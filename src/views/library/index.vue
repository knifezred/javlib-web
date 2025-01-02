<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { pageSizeOptions, sortRuleOptions } from '@/constants/library'
import MovieCard from '@/components/custom/card/movie-card.vue'
import { $t } from '@/locales'
import { fetchCategoryPagedList, fetchMoviePagedList, updateMovieLibrary } from '@/service/api'
import { useAppStore } from '@/store/modules/app'

defineOptions({
  name: 'LibraryPage'
})
const appStore = useAppStore()
const sortOptions = [
  {
    label: '年份',
    value: 'year'
  },
  {
    label: '番号',
    value: 'num'
  },
  {
    label: '综合评分',
    value: 'score'
  },
  {
    label: '个人评分',
    value: 'personalScore'
  },
  {
    label: '添加时间',
    value: 'createdTime'
  },
  {
    label: '上映时间',
    value: 'releaseTime'
  },
  {
    label: '播放次数',
    value: 'viewCount'
  }
]

const pageCount = ref(1)
const totalCount = ref(0)

const searchData = ref<Dto.MovieSearchOption>({
  viewCount: 0,
  sort: 'createdTime',
  sortRule: 'DESC',
  pageSize: 30,
  page: 1
})
const movieData = ref<Array<Dto.DbMovie>>([])
async function handleSearch() {
  appStore.setCacheSearchData(searchData.value)
  fetchMoviePagedList(searchData.value).then(res => {
    if (res.data !== null) {
      movieData.value = res.data.records
      pageCount.value = Math.ceil(res.data.total / searchData.value.pageSize)
      totalCount.value = res.data.total
    } else {
      movieData.value = []
      pageCount.value = 1
      totalCount.value = 0
    }
  })
}

function resetSearch() {
  searchData.value = {
    years: null,
    keyword: '',
    type: null,
    tags: null,
    viewCount: 0,
    sort: 'createdTime',
    sortRule: 'DESC',
    pageSize: 20,
    page: 1
  }
  handleSearch()
}

function updateLibrary() {
  window.$message?.info('后台添加中，请耐心等待')
  updateMovieLibrary()
}

const typeOptions = ref<Array<Dto.DbCategory>>([])
function getTopTypes() {
  fetchCategoryPagedList({
    page: 1,
    pageSize: 5,
    type: 'tag',
    sort: 'value',
    sortRule: 'DESC'
  }).then(res => {
    if (res.data) {
      typeOptions.value = res.data.records
    }
  })
}

onMounted(() => {
  const cacheSearch = appStore.getCacheSearchData()
  if (cacheSearch) {
    searchData.value = cacheSearch.data as Dto.MovieSearchOption
  }
  getTopTypes()
  handleSearch()
})
</script>

<template>
  <NFlex vertical>
    <NCard :bordered="false" class="relative z-4 w-auto rd-12px">
      <NCollapse :default-expanded-names="[]">
        <NCollapseItem :title="$t('common.search')" name="1">
          <NForm label-placement="left" :label-width="54" require-mark-placement="right-hanging" size="small">
            <NFormItem :label="$t('page.library.type')" class="hidden h-10">
              <NCheckboxGroup v-model:value="searchData.type">
                <NSpace item-style="display: flex;" align="center">
                  <NCheckbox value="内地" label="内地" />
                  <NCheckbox value="港台" label="港台" />
                  <NCheckbox value="日本" label="日本" />
                </NSpace>
              </NCheckboxGroup>
            </NFormItem>
            <NFormItem v-show="typeOptions.length > 0" :label="$t('page.library.tags')" class="hidden h-10">
              <NCheckboxGroup v-model:value="searchData.tags">
                <NSpace item-style="display: flex;" align="center">
                  <NCheckbox v-for="tag in typeOptions" :key="tag.id" :value="tag.key" :label="tag.key" />
                </NSpace>
              </NCheckboxGroup>
            </NFormItem>
            <NFormItem :label="$t('page.library.yearGroup')" class="hidden h-10">
              <NCheckboxGroup v-model:value="searchData.years">
                <NSpace item-style="display: flex;" align="center">
                  <NCheckbox value="2024" label="2024" />
                  <NCheckbox value="2023" label="2023" />
                  <NCheckbox value="2022" label="2022" />
                  <NCheckbox value="2021" label="2021" />
                  <NCheckbox value="2020" label="2020" />
                  <NCheckbox value="2019-2015" label="2019 - 2015" />
                  <NCheckbox value="2015-2010" label="2014 - 2010" />
                  <NCheckbox value="2009-2000" label="2009 - 2000" />
                  <NCheckbox value="1999-1990" label="90年代" />
                  <NCheckbox value="1989-1980" label="80年代" />
                  <NCheckbox value="1979-1900" label="更早" />
                </NSpace>
              </NCheckboxGroup>
            </NFormItem>
            <NFormItem :label="$t('page.library.searchKey')">
              <NInputGroup>
                <NInput
                  v-model:value="searchData.keyword"
                  type="text"
                  placeholder="请输入标题关键词"
                  class="max-w-xl" />
              </NInputGroup>
            </NFormItem>
            <NSpace item-style="display: flex;" align="center">
              <NFormItem :label="$t('common.sort')">
                <NSelect
                  v-model:value="searchData.sort"
                  :options="sortOptions"
                  class="w-26"
                  @update:value="handleSearch" />
              </NFormItem>
              <NFormItem>
                <NSelect
                  v-model:value="searchData.sortRule"
                  :options="sortRuleOptions"
                  class="w-24"
                  @update:value="handleSearch" />
              </NFormItem>
              <NFormItem>
                <NSwitch
                  v-model:value="searchData.viewCount"
                  :checked-value="0"
                  :unchecked-value="-1"
                  @update-value="handleSearch">
                  <template #checked>未播放</template>
                  <template #unchecked>全部</template>
                </NSwitch>
              </NFormItem>
              <NFormItem>
                <NButton type="primary" @click="handleSearch">
                  {{ $t('common.search') }}
                </NButton>
              </NFormItem>
              <NFormItem>
                <NButton type="default" ghost @click="resetSearch">
                  {{ $t('common.reset') }}
                </NButton>
              </NFormItem>
            </NSpace>
            <NFormItem>
              <NText>{{ '共找到 ' + totalCount + ' 部影片' }}</NText>
              <NButton type="warning" class="ml-2" @click="updateLibrary">
                {{ $t('page.library.updateLibrary') }}
              </NButton>
            </NFormItem>
          </NForm>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <!--
    <NGrid x-gap="12" y-gap="8" :cols="3">
 <NGi v-for="movie in movieData" :key="movie.id">
        <MovieCard :movie="movie" :show-second-title="true" :sort="searchData.sort"></MovieCard>
      </NGi>
    </NGrid>
-->
    <NSpace justify="center">
      <MovieCard
        v-for="movie in movieData"
        :key="movie.id"
        :movie="movie"
        :show-second-title="true"
        :sort="searchData.sort"></MovieCard>
    </NSpace>
    <NPagination
      v-model:page="searchData.page"
      v-model:page-size="searchData.pageSize"
      :page-count="pageCount"
      show-size-picker
      simple
      class="ma-auto"
      :page-sizes="pageSizeOptions"
      @update-page="handleSearch"
      @update-page-size="handleSearch" />
  </NFlex>
</template>

<style scoped></style>
