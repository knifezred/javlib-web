<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouterPush } from '@/hooks/common/router'
import { $t } from '@/locales'
import { deleteMovie, fetchActressPagedList, fetchMoviePagedList, findMovie, updateMovie } from '@/service/api'
import { useAppStore } from '@/store/modules/app'

defineOptions({
  name: 'VideoDetail'
})

const appStore = useAppStore()
const route = useRoute()
const { routerBack, routerPushByKey } = useRouterPush()

const info = ref<Dto.DbMovie>({
  createdTime: 0,
  viewCount: 0,
  favorite: false,
  personalScore: undefined,
  uniqueid: '',
  num: '',
  title: '',
  originTitle: '',
  introduction: '',
  file: '',
  torrent: '',
  cover: '',
  poster: '',
  tags: '',
  genres: '',
  studio: '',
  country: '',
  series: '',
  actress: '',
  director: '',
  year: 0,
  releaseTime: '',
  score: 0,
  fileSize: 0
})

const options = ref([
  {
    label: '编辑信息',
    key: 'modify'
  },
  {
    label: '重新识别',
    key: 'reScraping'
  },
  {
    label: `${$t('common.delete')}源文件`,
    key: 'delete'
  }
])

function playVideo() {
  setViewed()
  routerPushByKey('detail-page_video-player', {
    query: {
      file: info.value.file,
      title: info.value.title
    }
  })
}

function setViewed() {
  // 更新播放次数
  info.value.viewCount++
  info.value.viewTime = Date.now()
  updateMovie(info.value)
}

function setFavorite() {
  info.value.favorite = !info.value.favorite
  info.value.favoriteTime = Date.now()
  updateMovie(info.value).then(res => {
    if (res.data) {
      window.$message?.success(info.value.favorite ? $t('common.addFavorite') : $t('common.removeFavorite'))
    }
  })
}

function setPersonalScore() {
  updateMovie(info.value).then(res => {
    if (res.data) {
      window.$message?.success($t('common.saveSuccess'))
    }
  })
}

function dorpDownSelect(val: string) {
  if (val === 'delete') deleteMovieFile()
  if (val === 'modify') {
    window.$message?.info('敬请期待')
  }
  if (val === 'reScraping') {
    window.$message?.info('敬请期待')
  }
}

function deleteMovieFile() {
  deleteMovie(info.value).then(() => {
    routerBack()
  })
}

function goCategoryPage(item: string, type: string) {
  const queryEntity = {} as any
  queryEntity[type] = item
  routerPushByKey('detail-page_video-list', {
    query: queryEntity
  })
}

const relatedMovies = ref<Array<Dto.DbMovie>>([])
function getRelatedMovies() {
  fetchMoviePagedList({
    page: 1,
    pageSize: 10,
    sort: 'id',
    sortRule: 'RAND'
  }).then(res => {
    if (res.data) {
      relatedMovies.value = res.data.records.filter(x => x.num !== info.value.num)
    }
  })
}

const seriesMovies = ref<Array<Dto.DbMovie>>([])
function getSeriesMovies() {
  seriesMovies.value = []
  if (info.value.series.trim().length > 0) {
    fetchMoviePagedList({
      series: info.value.series,
      page: 1,
      pageSize: 10,
      sort: 'id',
      sortRule: 'RAND'
    }).then(res => {
      if (res.data) {
        seriesMovies.value = res.data.records.filter(x => x.num !== info.value.num)
      }
    })
  }
}

const recommendedTag = ref('')
const recommendedTagMovies = ref<Array<Dto.DbMovie>>([])
function getRecommendedTagMovies() {
  fetchMoviePagedList({
    tags: [recommendedTag.value],
    page: 1,
    pageSize: 10,
    sort: 'id',
    sortRule: 'RAND'
  }).then(res => {
    if (res.data) {
      recommendedTagMovies.value = res.data.records.filter(x => x.num !== info.value.num)
    }
  })
}
const actressList = ref<Array<Dto.DbActress>>([])
watch(
  () => route.query,
  () => {
    loadMovieInfo()
  }
)
function loadMovieInfo() {
  findMovie(route.query.num as string).then(res => {
    if (res.data !== null) {
      info.value = res.data
      fetchActressPagedList({
        page: 1,
        pageSize: 100,
        name: res.data.actress,
        sort: 'name',
        sortRule: 'DESC'
      }).then(act => {
        actressList.value = []
        if (act.data !== null) {
          const actressArray = info.value.actress.split('|').filter(x => x.length > 0)
          for (const element of actressArray) {
            const temp = act.data.records.find(x => x.name === element)
            if (temp) {
              actressList.value.push(temp)
            }
          }
        }
      })
      getRelatedMovies()
      getSeriesMovies()
      recommendedTag.value = info.value.tags.split('|').filter(x => x.length > 0)[0]
      getRecommendedTagMovies()
    }
  })
}
onMounted(() => {
  loadMovieInfo()
})
</script>

<template>
  <NSpace
    class="pa-0"
    :style="
      'background: url(' +
      appStore.baseURL +
      info.cover.replaceAll('\\', '/') +
      ');background-repeat: no-repeat;background-size: cover;'
    ">
    <NCard :bordered="false" class="frosted-glass-container z-3 ma-0 rd-0">
      <NFlex class="mb-lg" vertical>
        <NP>
          <NButton text class="z-3 v-sub font-size-lg color-white" @click="routerBack">
            <NIcon>
              <SvgIcon icon="solar:alt-arrow-left-line-duotone"></SvgIcon>
            </NIcon>
            <NText class="inline-block pl-2 color-white hover:color-primary-400">
              {{ $t('route.detail-page_video') }}
            </NText>
          </NButton>
        </NP>
      </NFlex>

      <NGrid class="z-3 flex" x-gap="12" y-gap="0" :cols="5">
        <NGi :span="2">
          <NCard :bordered="false" class="rd-2xl" content-style="padding: 0;" hoverable @click="playVideo">
            <template #cover>
              <img
                :src="appStore.baseURL + info.poster"
                class="cursor-pointer rd-xl transition-transform duration-300 hover:transform-scale-120" />
            </template>
          </NCard>
        </NGi>
        <NGi :span="3">
          <NH1 class="line-clamp-2 my-sm text-xl text-white">
            {{ info.title }}
          </NH1>
          <NP class="my-sm">
            <NText class="z-3 inline-block text-xl color-#F9A11E">{{ info.score }}分</NText>
          </NP>
          <NP class="my-sm">
            <NRate v-model:value="info.personalScore" allow-half :count="5" @update:value="setPersonalScore" />
          </NP>
          <!-- <n-p depth="3" class="my-0 text-lg mx-1">{{ info.originTitle }} </n-p> -->
          <NP class="my-0">
            <NText class="z-3 mr-1 inline-block text-sm text-#A4A6A7">
              {{ info.year }}
            </NText>
            <NText class="z-3 mx-1 inline-block text-sm text-#A4A6A7">
              {{ ' | ' + (info.fileSize / 1000 / 1000 / 1000).toFixed(2) + ' GB' }}
            </NText>
          </NP>
          <NP v-if="info.studio.length > 0" class="my-0 inline-block text-#A4A6A7">
            <NText depth="3" class="z-3 cursor-pointer text-#A4A6A7" @click="goCategoryPage(info.studio, 'studio')">
              {{ '厂商: ' + info.studio }}
            </NText>
          </NP>
          <NP class="my-0">
            <NText v-if="info.director.length > 0" class="z-3 inline-block text-sm text-#A4A6A7">
              {{ '导演: ' + info.director }}
            </NText>
          </NP>
        </NGi>
        <NGi class="z-3 mt-xl" :span="5">
          <NP class="my-xs">
            <CategoryCardGroup type="tag" :keys="info.tags"></CategoryCardGroup>
          </NP>
          <NSpace class="mt-2">
            <span
              class="z-3 ml-0 inline-block h-10 w-30 cursor-pointer rd-12 bg-primary-600 pa-2 text-center color-light hover:bg-primary"
              @click="playVideo">
              <SvgIcon class="mr-2 inline-block size-4 color-white" icon="solar:play-bold" />
              立即播放
            </span>
            <span
              class="z-3 inline-block h-10 w-10 cursor-pointer rd-50% bg-#404245 pa-3 v-mid color-light hover:bg-primary-300"
              @click="setViewed">
              <SvgIcon
                class="ma-auto size-4"
                :class="info.viewCount > 0 ? 'color-primary' : 'color-white'"
                icon="solar:verified-check-bold"></SvgIcon>
            </span>
            <span
              class="z-3 inline-block h-10 w-10 cursor-pointer rd-50% bg-#404245 pa-3 v-mid color-light hover:bg-primary"
              @click="setFavorite">
              <SvgIcon
                class="ma-auto size-4"
                :class="info.favorite ? 'color-#F8312F' : 'color-white'"
                icon="solar:heart-angle-bold"></SvgIcon>
            </span>
            <NDropdown class="v-mid" trigger="click" :options="options" @select="dorpDownSelect">
              <span
                class="z-3 inline-block h-10 w-10 cursor-pointer rd-50% bg-#404245 pa-3 v-mid color-light hover:bg-primary">
                <SvgIcon class="ma-auto size-4" icon="tabler:dots"></SvgIcon>
              </span>
            </NDropdown>
          </NSpace>
        </NGi>
        <NGi class="z-3 mt-xl" :span="5">
          <NH4 depth="3" class="mb-lg text-light-9">剧情简介</NH4>
          <NEllipsis class="indent-lg text-sm text-#9D9E9F" expand-trigger="click" line-clamp="3" :tooltip="false">
            {{ info.introduction }}
          </NEllipsis>
          <NH4 depth="3" class="mb-lg text-light-9">演员列表</NH4>
          <NCarousel class="z-3" :slides-per-view="3" :show-dots="false" draggable>
            <NCarouselItem v-for="actor in actressList" :key="actor.name" class="w-auto">
              <ActressCard :show-second-title="false" :actress="actor" sort="score" class="mt-2"></ActressCard>
            </NCarouselItem>
          </NCarousel>
        </NGi>
        <NGi v-if="relatedMovies.length > 0" class="z-3 mt-xl" :span="5">
          <NH4 depth="3" class="mb-lg text-light-9">推荐影片</NH4>
          <NCarousel class="z-10" :slides-per-view="3" :show-dots="false" draggable>
            <NCarouselItem v-for="movie in relatedMovies" :key="movie.name" class="w-auto">
              <MovieCard :movie="movie" :show-second-title="false" sort="score"></MovieCard>
            </NCarouselItem>
          </NCarousel>
        </NGi>
        <NGi v-if="seriesMovies.length > 0" class="z-3 mt-xl" :span="5">
          <NH4 depth="3" class="mb-lg text-light-9" @click="goCategoryPage(info.series, 'series')">
            同系列{{ info.series }}影片
          </NH4>
          <NCarousel class="z-10" :slides-per-view="3" :show-dots="false" draggable>
            <NCarouselItem v-for="movie in seriesMovies" :key="movie.name" class="w-auto">
              <MovieCard :movie="movie" :show-second-title="false" sort="score"></MovieCard>
            </NCarouselItem>
          </NCarousel>
        </NGi>
        <NGi v-if="recommendedTagMovies.length > 0" class="mt-xl" :span="5">
          <NH4 depth="3" class="mb-lg text-light-9" @click="goCategoryPage(recommendedTag, 'tags')">
            更多 {{ recommendedTag }} 影片
          </NH4>
          <NCarousel class="z-10" :slides-per-view="3" :show-dots="false" draggable>
            <NCarouselItem v-for="movie in recommendedTagMovies" :key="movie.name" class="w-auto">
              <MovieCard :movie="movie" :show-second-title="false" sort="score"></MovieCard>
            </NCarouselItem>
          </NCarousel>
        </NGi>
      </NGrid>
    </NCard>
  </NSpace>
</template>

<style scoped>
.frosted-glass-container {
  position: relative;
  width: 100%;
  border: 0px;
  background: rgba(0, 0, 0, 0.3);
  /* 半透明背景 */
  backdrop-filter: blur(60px);
  /* 模糊背景 */
  -webkit-backdrop-filter: blur(30px);
  /* 兼容Safari */
}
</style>
