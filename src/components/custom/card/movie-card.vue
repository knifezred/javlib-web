<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouterPush } from '@/hooks/common/router'
import { useAppStore } from '@/store/modules/app'

defineOptions({
  name: 'MovieCard'
})
interface Props {
  /** Button class */
  movie: Dto.DbMovie
  sort: string
  showSecondTitle: boolean
}
const props = defineProps<Props>()

const appStore = useAppStore()
const sortText = ref<string>('')
const routerPush = useRouterPush()
function showMovieInfo(entity: Dto.DbMovie) {
  routerPush.routerPushByKey('detail-page_video', { query: { num: entity.num } })
}
watch(
  () => props.sort,
  () => {
    if (props.sort === 'createdTime') {
      sortText.value = new Date(props.movie.createdTime).toLocaleDateString()
    } else if (props.sort === 'title') {
      sortText.value = props.movie.year.toString()
    } else {
      sortText.value = props.movie[props.sort]
    }
  },
  { immediate: true }
)
</script>

<template>
  <NCard :bordered="false" size="small" class="relative z-4 max-w-30 rd-12px text-center" hoverable>
    <template #cover>
      <img
        :src="appStore.baseURL + movie.poster"
        class="cursor-pointer transition-transform duration-300 hover:transform-scale-120"
        @click="showMovieInfo(movie)" />
    </template>
    <NP class="line-clamp-1 ma-0 cursor-pointer pt-1" @click="showMovieInfo(movie)">
      {{ movie.title }}
    </NP>
    <NP v-if="sort != 'personalScore' && showSecondTitle" depth="3" class="mt-1">
      {{ sortText }}
    </NP>
    <NRate v-else-if="showSecondTitle" :value="movie.personalScore" allow-half readonly size="small" class="mt-1" />
  </NCard>
</template>
