<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { updateMovie } from '@/service/api'
import { $t } from '@/locales'
import { useRouterPush } from '@/hooks/common/router'
import { useAppStore } from '@/store/modules/app'

defineOptions({
  name: 'MovieCard'
})
interface Props {
  /** Button class */
  movie: Dto.DbMovie
  sort: string
}
const props = defineProps<Props>()

const appStore = useAppStore()
const sortText = ref<string>('')
const favorite = ref(false)
function setFavorite() {
  const temp = props.movie
  favorite.value = !favorite.value
  temp.favorite = favorite.value
  updateMovie(temp).then(res => {
    if (res.data) {
      window.$message?.success(temp.favorite ? $t('common.addFavorite') : $t('common.removeFavorite'))
    }
  })
}
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
onMounted(() => {
  favorite.value = props.movie.favorite
})
</script>

<template>
  <NCard :bordered="false" size="small" class="relative z-4 w-48 rd-12px text-center" hoverable>
    <template #cover>
      <img
        :src="appStore.baseURL + movie.poster"
        class="h-72 w-48 cursor-pointer transition-transform duration-300 hover:transform-scale-120"
        @click="showMovieInfo(movie)" />
    </template>
    <NButton text class="pointer-events-auto absolute-tr z-10 mr-4 mt-64 font-size-5" @click="setFavorite">
      <NIcon>
        <SvgIcon
          class="inline-flex"
          :icon="favorite ? 'fluent-emoji-flat:heart-suit' : 'fluent-emoji-flat:grey-heart'"></SvgIcon>
      </NIcon>
    </NButton>
    <NP class="line-clamp-2 ma-0 cursor-pointer pt-1" @click="showMovieInfo(movie)">
      {{ movie.title }}
    </NP>
    <NP v-if="sort != 'personalScore'" depth="3" class="ma-0">
      {{ sortText }}
    </NP>
    <NRate v-else :value="movie.personalScore" allow-half readonly size="small" class="mt-1" />
  </NCard>
</template>
