<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { cupOptions, pageSizeOptions } from '@/constants/library'
import { useRouterPush } from '@/hooks/common/router'
import { $t } from '@/locales'
import { fetchMoviePagedList, findActress, updateActress } from '@/service/api'
import { useAppStore } from '@/store/modules/app'
defineOptions({
  name: 'ActressDetail'
})

const appStore = useAppStore()
const route = useRoute()
const { routerBack } = useRouterPush()

const info = ref<Dto.DbActress>({
  createdTime: 0,
  favorite: false,
  score: 0,
  personalScore: 0,
  category: '',
  name: '',
  alias: '',
  introduction: '',
  avatar: '',
  cover: '',
  tags: '',
  birthday: '',
  videoCount: 0,
  bust: 0,
  waist: 0,
  hip: 0,
  face: 0,
  body: 0,
  cup: 0,
  bodySize: '',
  bodyHeight: 0,
  debutDate: ''
})

const movies = ref<Array<Dto.DbMovie>>([])
const age = ref(0)

const searchData = ref<Dto.MovieSearchOption>({
  sort: 'year',
  sortRule: 'DESC',
  page: 1,
  pageSize: 20
})
const pageCount = ref(1)
const totalMovies = ref(0)
function handleSearch() {
  searchData.value.actress = info.value.name
  fetchMoviePagedList(searchData.value).then(res => {
    if (res.data) {
      movies.value = res.data.records
      pageCount.value = Math.ceil(res.data.total / searchData.value.pageSize)
      totalMovies.value = res.data.total
    } else {
      movies.value = []
      pageCount.value = 1
      totalMovies.value = 0
    }
  })
}

onMounted(() => {
  findActress(route.query.name as string).then(res => {
    if (res.data !== null) {
      info.value = res.data
      age.value = new Date().getFullYear() - Number.parseInt(info.value.birthday.split('/')[0], 10)
      // 查找作品
      handleSearch()
    }
  })
})

const showModal = ref(false)
function setAvatar() {
  showModal.value = true
}
function updateActressAvatar(poster: string) {
  info.value.avatar = poster
  updateActress(info.value).then(res => {
    if (res.data) {
      window.$message?.success($t('common.modifySuccess'))
    }
  })
}
</script>

<template>
  <NGrid x-gap="12" y-gap="24" :cols="2">
    <NGi :span="2">
      <NPageHeader :title="$t('common.backToList')" @back="routerBack">
        <NCard>
          <NGrid x-gap="12" y-gap="12" :cols="3">
            <NGi>
              <img
                :src="appStore.baseURL + info.avatar"
                class="h-24 w-24 cursor-pointer rd-md object-cover object-top transition-transform duration-300"
                @click="setAvatar" />
            </NGi>
            <NGi :span="2">
              <NP>
                {{ info.name }}
                <NText :depth="3">({{ age }}岁)</NText>
              </NP>
              <NP depth="3" class="my-1">{{ info.alias }}</NP>
            </NGi>
            <NGi>
              <NStatistic label="参演作品" :value="totalMovies" />
            </NGi>
            <NGi>
              <NStatistic label="出生日期" :value="info.birthday" />
            </NGi>
            <NGi>
              <NStatistic label="出道时间" :value="info.debutDate" />
            </NGi>
            <NGi>
              <NStatistic
                label="体型"
                :value="info.bodySize + (info.cup > 0 ? '/' + cupOptions.find(x => x.value == info.cup)?.label : '')" />
            </NGi>
            <NGi>
              <NStatistic label="身高" :value="info.bodyHeight + 'cm'" />
            </NGi>
            <!--
 <n-gi>
                  <n-statistic
                    label="三围"
                    :value="info.bust + '/' + info.waist + '/' + info.hip" />
                </n-gi>
-->

            <NGi>
              <NStatistic label="综合评分" :value="info.score + ' / ' + info.personalScore" />
            </NGi>

            <NGi :span="3">
              <NP>
                <NTag v-for="tag in info.tags.split('|').filter(x => x.length > 0)" :key="tag">
                  {{ tag }}
                </NTag>
              </NP>
              <NP class="line-clamp-6">{{ info.introduction }}</NP>
            </NGi>
          </NGrid>
        </NCard>
      </NPageHeader>
    </NGi>
    <NGi :span="2">
      <NCard title="TA的作品">
        <NSpace>
          <MovieCard
            v-for="movie in movies"
            :key="movie.id"
            :movie="movie"
            :show-second-title="false"
            :sort="searchData.sort"></MovieCard>
        </NSpace>

        <NPagination
          v-model:page="searchData.page"
          v-model:page-size="searchData.pageSize"
          class="mt-lg"
          :page-count="pageCount"
          show-size-picker
          :page-sizes="pageSizeOptions"
          @update-page="handleSearch"
          @update-page-size="handleSearch" />
      </NCard>
    </NGi>
    <NGi :span="2">
      <NModal v-model:show="showModal" class="h-auto w-5xl!" preset="dialog" title="Dialog">
        <template #header>
          <NText>修改头像</NText>
        </template>
        <NSpace class="mt-lg w-auto">
          <NCard
            v-for="movie in movies"
            :key="movie.id"
            content-style="padding:0px !important"
            hoverable
            @click="updateActressAvatar(movie.poster)">
            <img :src="appStore.baseURL + movie.poster" class="h-auto w-36 cursor-pointer rd-md" />
          </NCard>
        </NSpace>
        <NPagination
          v-model:page="searchData.page"
          v-model:page-size="searchData.pageSize"
          class="mt-lg"
          :page-count="pageCount"
          show-size-picker
          :page-sizes="pageSizeOptions"
          @update-page="handleSearch"
          @update-page-size="handleSearch" />
      </NModal>
    </NGi>
  </NGrid>
</template>

<style scoped></style>
