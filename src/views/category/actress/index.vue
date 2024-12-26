<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ActressCard from '@/components/custom/card/actress-card.vue'
import { useAppStore } from '@/store/modules/app'
import { fetchActressPagedList } from '@/service/api/index'
import { $t } from '@/locales'
import { bodySizeOptions, cupOptions, pageSizeOptions, sortRuleOptions } from '@/constants/library'
defineOptions({
  name: 'ActressPage'
})
const appStore = useAppStore()
const sortOptions = [
  {
    label: '作品数量',
    value: 'videoCount'
  },
  {
    label: '更新时间',
    value: 'updatedTime'
  },
  {
    label: $t('page.actress.debutDate'),
    value: 'debutDate'
  },
  {
    label: $t('page.actress.name'),
    value: 'name'
  },
  {
    label: $t('page.actress.body'),
    value: 'body'
  },
  {
    label: $t('page.actress.face'),
    value: 'face'
  },
  {
    label: $t('page.actress.cup'),
    value: 'cup'
  },
  {
    label: '综合评分',
    value: 'score'
  },
  {
    label: '个人评分',
    value: 'personalScore'
  }
]

const pageCount = ref(1)
const totalCount = ref(0)

const searchData = ref<Dto.ActressSearchOption>({
  face: [0, 10],
  body: [0, 10],
  sort: 'videoCount',
  sortRule: 'DESC',
  pageSize: 30,
  page: 1
})

const actressData = ref<Array<Dto.DbActress>>([])
function handleSearch() {
  appStore.setCacheSearchData(searchData.value)
  fetchActressPagedList(searchData.value).then(res => {
    if (res.data !== null) {
      actressData.value = res.data.records
      pageCount.value = Math.ceil(res.data.total / searchData.value.pageSize)
      totalCount.value = res.data.total
    } else {
      actressData.value = []
      pageCount.value = 1
    }
  })
}

function resetSearch() {
  searchData.value = {
    tags: null,
    type: null,
    body: [0, 10],
    face: [0, 10],
    bodySize: null,
    cup: null,
    name: '',
    sort: 'videoCount',
    sortRule: 'DESC',
    pageSize: 30,
    page: 1
  }
  handleSearch()
}

onMounted(() => {
  const cacheSearch = appStore.getCacheSearchData()
  if (cacheSearch) {
    searchData.value = cacheSearch.data as Dto.ActressSearchOption
  }
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
            <NFormItem :label="$t('page.library.tags')" class="hidden h-10">
              <NCheckboxGroup v-model:value="searchData.tags">
                <NSpace item-style="display: flex;" align="center">
                  <NCheckbox value="中文字幕" label="中文" />
                  <NCheckbox value="无码破解" label="破解" />
                  <NCheckbox value="VR" label="VR" />
                </NSpace>
              </NCheckboxGroup>
            </NFormItem>
            <NSpace item-style="display: flex;" align="center">
              <NFormItem :label="$t('page.actress.bodySize')">
                <NSelect v-model:value="searchData.bodySize" :options="bodySizeOptions" clearable class="w-26" />
              </NFormItem>
              <NFormItem>
                <NSelect
                  v-model:value="searchData.cup"
                  :options="cupOptions"
                  class="w-24"
                  :placeholder="$t('page.actress.cup')"
                  clearable />
              </NFormItem>
              <NFormItem :label="$t('page.actress.body')">
                <NSlider v-model:value="searchData.body" range :step="0.5" :max="10" class="w-xs" />
              </NFormItem>
            </NSpace>
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
              <NFormItem :label="$t('page.actress.face')">
                <NSlider v-model:value="searchData.face" range :step="0.5" :max="10" class="w-xs" />
              </NFormItem>
            </NSpace>
            <NFormItem :label="$t('page.library.searchKey')" class="h-10">
              <NInputGroup>
                <NInput v-model:value="searchData.name" type="text" placeholder="请输入标题关键词" class="max-w-3xl" />
              </NInputGroup>
            </NFormItem>
            <NSpace justify="center">
              <NFormItem>
                <NP>共找到 {{ totalCount }} 位演员</NP>
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
          </NForm>
        </NCollapseItem>
      </NCollapse>
    </NCard>
    <NSpace justify="center">
      <ActressCard
        v-for="actress in actressData"
        :key="actress.id"
        :actress="actress"
        :show-second-title="true"
        :sort="searchData.sort"></ActressCard>
    </NSpace>
    <NPagination
      v-model:page="searchData.page"
      v-model:page-size="searchData.pageSize"
      class="ma-auto"
      :page-count="pageCount"
      show-size-picker
      :page-sizes="pageSizeOptions"
      simple
      @update-page="handleSearch"
      @update-page-size="handleSearch" />
  </NFlex>
</template>

<style scoped></style>
