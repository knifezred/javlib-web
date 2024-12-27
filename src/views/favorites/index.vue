<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ActressCard from '@/components/custom/card/actress-card.vue'
import FavoriteCardGroup from '@/components/custom/card/favorite-card-group.vue'
import MovieCard from '@/components/custom/card/movie-card.vue'
import { pageSizeOptions } from '@/constants/library'
import {
  fetchActressPagedList,
  fetchMoviePagedList,
  findStorage,
  getFavoriteMoviesCount,
  getFavoritesActressCount
} from '@/service/api'
import { useAppStore } from '@/store/modules/app'

defineOptions({
  name: 'FavoritesPage'
})
const appStore = useAppStore()
const favCount = ref({
  movie: 0,
  actress: 0,
  studio: 0,
  series: 0
})
const favoritesData = ref({
  movie: [] as Array<Dto.DbMovie>,
  actress: [] as Array<Dto.DbActress>,
  studio: [] as Array<string>,
  series: [] as Array<string>
})
const currentTab = ref('movie')
const showPagination = ref(true)
const searchData = ref({
  page: 1,
  pageSize: 20,
  sort: 'updatedTime',
  sortRule: 'DESC',
  favorite: true
})
const pageCount = ref(1)
function handleSearch(tab: string) {
  currentTab.value = tab
  appStore.setCacheSearchData({
    currentTab: currentTab.value,
    searchData: searchData.value
  })
  switch (currentTab.value) {
    case 'movie':
      showPagination.value = true
      fetchMoviePagedList(searchData.value).then(res => {
        if (res.data !== null) {
          favoritesData.value.movie = res.data.records
          favCount.value.movie = res.data.total
          pageCount.value = Math.ceil(res.data.total / searchData.value.pageSize)
        } else {
          favoritesData.value.movie = []
          favCount.value.movie = 0
          pageCount.value = 0
        }
      })
      break
    case 'actress':
      fetchActressPagedList(searchData.value).then(res => {
        if (res.data !== null) {
          favoritesData.value.actress = res.data.records
          favCount.value.actress = res.data.total
          pageCount.value = Math.ceil(res.data.total / searchData.value.pageSize)
        } else {
          favoritesData.value.actress = []
          favCount.value.actress = 0
          pageCount.value = 0
        }
      })
      break
    default:
      showPagination.value = false
      break
  }
}
onMounted(() => {
  const cacheSearch = appStore.getCacheSearchData()
  if (cacheSearch) {
    currentTab.value = cacheSearch.data.currentTab
    searchData.value = cacheSearch.data.searchData
  }
  handleSearch(currentTab.value)

  getFavoriteMoviesCount().then(res => {
    if (res.data) {
      favCount.value.movie = res.data
    } else {
      favCount.value.movie = 0
    }
  })
  getFavoritesActressCount().then(res => {
    if (res.data) {
      favCount.value.actress = res.data
    } else {
      favCount.value.actress = 0
    }
  })
  findStorage('favorite_series').then(res => {
    if (res.data) {
      favoritesData.value.series = res.data.value.split('|')
      favCount.value.series = favoritesData.value.series.length
    } else {
      favoritesData.value.series = []
      favCount.value.series = 0
    }
  })
  findStorage('favorite_studio').then(res => {
    if (res.data) {
      favoritesData.value.studio = res.data.value.split('|')
      favCount.value.studio = favoritesData.value.studio.length
    } else {
      favoritesData.value.studio = []
      favCount.value.studio = 0
    }
  })
})
</script>

<template>
  <NFlex>
    <NTabs :value="currentTab" justify-content="space-evenly" type="card" animated @update:value="handleSearch">
      <NTabPane name="movie" :tab="$t('page.favorites.movie') + '（' + favCount.movie + '）'">
        <NEmpty v-if="favCount.movie == 0" size="large" class="ma-auto" description="什么也没有">
          <template #icon>
            <NIcon>
              <SvgIcon icon="solar:hand-heart-bold-duotone" />
            </NIcon>
          </template>
        </NEmpty>
        <NSpace class="ma-4" justify="center">
          <MovieCard
            v-for="movie in favoritesData.movie"
            :key="movie.file"
            :movie="movie"
            :show-second-title="false"
            sort="score"></MovieCard>
        </NSpace>
      </NTabPane>
      <NTabPane name="actress" :tab="$t('route.category_actress') + '（' + favCount.actress + '）'">
        <NEmpty v-if="favCount.actress == 0" size="large" class="ma-auto" description="什么也没有">
          <template #icon>
            <NIcon>
              <SvgIcon icon="solar:hand-heart-bold-duotone" />
            </NIcon>
          </template>
        </NEmpty>
        <NSpace class="ma-4" justify="center">
          <ActressCard
            v-for="actress in favoritesData.actress"
            :key="actress.name"
            :show-second-title="true"
            :actress="actress"
            sort="score"></ActressCard>
        </NSpace>
      </NTabPane>
      <NTabPane name="studio" :tab="$t('route.category_studio') + '（' + favCount.studio + '）'">
        <NEmpty v-if="favCount.studio == 0" size="large" class="ma-auto" description="什么也没有">
          <template #icon>
            <NIcon>
              <SvgIcon icon="solar:hand-heart-bold-duotone" />
            </NIcon>
          </template>
        </NEmpty>
        <NSpace justify="center">
          <FavoriteCardGroup :keys="favoritesData.studio" storage-key="favorite_studio" type="studio" />
        </NSpace>
      </NTabPane>
      <NTabPane name="series" :tab="$t('route.category_series') + '（' + favCount.series + '）'">
        <NEmpty v-if="favCount.series == 0" size="large" class="ma-auto" description="什么也没有">
          <template #icon>
            <NIcon>
              <SvgIcon icon="solar:hand-heart-bold-duotone" />
            </NIcon>
          </template>
        </NEmpty>
        <NSpace justify="center">
          <FavoriteCardGroup :keys="favoritesData.series" storage-key="favorite_series" type="series" />
        </NSpace>
      </NTabPane>
    </NTabs>

    <NPagination
      v-if="showPagination"
      v-model:page="searchData.page"
      v-model:page-size="searchData.pageSize"
      :page-count="pageCount"
      show-size-picker
      simple
      class="ma-auto"
      :page-sizes="pageSizeOptions"
      @update-page="handleSearch(currentTab)"
      @update-page-size="handleSearch(currentTab)" />
  </NFlex>
</template>

<style scoped></style>
