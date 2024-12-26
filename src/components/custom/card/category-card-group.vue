<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { $t } from '@/locales'
import { fetchCategoryPagedList, updateCategory } from '@/service/api'
import { useRouterPush } from '@/hooks/common/router'

defineOptions({
  name: 'CategoryCardGroup'
})
interface Props {
  type: string
  keys: string
}

const props = defineProps<Props>()

const categories = ref<Array<Dto.DbCategory>>([])
function setFavorite(category: Dto.DbCategory) {
  category.favorite = !category.favorite
  updateCategory(category).then(res => {
    if (res.data) {
      window.$message?.success(category.favorite ? $t('common.addFavorite') : $t('common.removeFavorite'))
    }
  })
}
const routerPush = useRouterPush()
function showDetail(entity: Dto.DbCategory) {
  routerPush.routerPushByKey('detail-page_video-list', {
    query: { key: entity.key, type: entity.type }
  })
}

watch(
  () => props.keys,
  () => {
    handleSearch()
  },
  { immediate: true }
)

function handleSearch() {
  if (props.keys.length > 0) {
    fetchCategoryPagedList({
      type: props.type,
      keys: props.keys,
      page: 1,
      pageSize: 10,
      sort: 'key',
      sortRule: 'ASC'
    }).then(res => {
      if (res.data) {
        categories.value = res.data.records
      } else {
        categories.value = []
      }
    })
  }
}
onMounted(() => {
  handleSearch()
})
</script>

<template>
  <NSpace>
    <div
      v-for="info in categories"
      :key="info.id"
      class="relative w-auto rd-md text-center transition-transform duration-300 hover:transform-translate-y--2"
      hoverable>
      <NText
        :depth="3"
        class="cursor-pointer border-b-2 border-b-primary border-b-style-solid color-warning-200"
        @click="showDetail(info)">
        {{ info.key }}
      </NText>
      <NButton text class="ml-2 font-size-4" @click="setFavorite(info)">
        <NIcon>
          <SvgIcon
            class="inline-flex"
            :icon="info.favorite ? 'fluent-emoji-flat:heart-suit' : 'fluent-emoji-flat:grey-heart'"></SvgIcon>
        </NIcon>
      </NButton>
    </div>
  </NSpace>
</template>
