<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouterPush } from '@/hooks/common/router'
import { createStorage, findStorage, updateStorage } from '@/service/api'

defineOptions({
  name: 'FavoriteCardGroup'
})
interface Props {
  type: string
  keys: string[]
  storageKey: string
}

const props = defineProps<Props>()
const { routerPushByKey } = useRouterPush()
const queryObj = ref<any>({})
function showMovieList(item: string) {
  queryObj.value[props.type] = item
  console.log(queryObj)
  routerPushByKey('detail-page_video-list', {
    query: queryObj.value
  })
}
const favoritesData = ref<Dto.DbStorage>()
const favoritesValue = ref<Array<string>>([])
function changeFavorite(item: string) {
  if (favoritesData.value === undefined) {
    favoritesValue.value.push(item)
    createStorage({
      key: props.storageKey,
      value: item
    }).then(() => {
      findStorage(props.storageKey).then(rr => {
        if (rr.data) {
          favoritesData.value = rr.data
        }
      })
    })
  } else {
    if (favoritesValue.value.includes(item)) {
      favoritesValue.value = favoritesValue.value.filter(x => x !== item)
    } else {
      favoritesValue.value.push(item)
    }
    favoritesData.value.value = favoritesValue.value.join('|')
    updateStorage(favoritesData.value)
  }
}
onMounted(() => {
  findStorage(props.storageKey).then(res => {
    if (res.data) {
      favoritesValue.value = res.data.value.split('|')
      favoritesData.value = res.data
    } else {
      favoritesValue.value = []
    }
  })
})
</script>

<template>
  <NSpace>
    <NCard
      v-for="item in keys"
      :key="item"
      :bordered="false"
      class="relative z-4 w-auto cursor-pointer rd-12px text-center text-center transition-transform duration-300 hover:transform-translate-y--2">
      <NP class="inline cursor-pointer" @click="showMovieList(item)">
        {{ item }}
      </NP>
      <NButton text class="ml-2 font-size-4" @click="changeFavorite(item)">
        <NIcon>
          <SvgIcon
            class="inline-flex"
            :icon="
              favoritesValue.includes(item) ? 'fluent-emoji-flat:heart-suit' : 'fluent-emoji-flat:grey-heart'
            "></SvgIcon>
        </NIcon>
      </NButton>
    </NCard>
  </NSpace>
</template>

<style scoped></style>
