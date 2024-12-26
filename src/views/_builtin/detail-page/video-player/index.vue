<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Player from 'xgplayer'
import { useAppStore } from '@/store/modules/app'
import { useRouterPush } from '@/hooks/common/router'
import 'xgplayer/dist/index.min.css'

defineOptions({
  name: 'VideoPlayerPage'
})
const route = useRoute()
const appStore = useAppStore()
const { routerBack } = useRouterPush()
const title = route.query.title as string
const player = ref<Player>()
function playerNextVideo(video: string) {
  if (player.value !== undefined) {
    player.value.src = appStore.baseURL + video
  }
}

function getFileName(filePath: string) {
  // 使用lastIndexOf找到最后一个'/'或'\'的位置
  const lastIndex = !filePath.includes('/') ? filePath.lastIndexOf('\\') : filePath.lastIndexOf('/')

  // 如果找到了'/'或'\'，则返回其后面的部分作为文件名
  // 否则，整个字符串就是文件名（没有路径分隔符的情况）
  return lastIndex === -1 ? filePath : filePath.substring(lastIndex + 1)
}

onMounted(() => {
  if (route.query.file?.includes(',')) {
    player.value = new Player({
      id: 'mse',
      url: (route.query.file as string).split(',')[0],
      fluid: true,
      autoplay: true,
      playnext: {
        urlList: (route.query.file as string).split(',').slice(1)
      },
      closeVideoDblclick: true
    })
    player.value.play()
  } else {
    player.value = new Player({
      id: 'mse',
      url: route.query.file as string,
      fluid: true,
      autoplay: true,
      closeVideoDblclick: true
    })
    player.value.play()
  }
})
</script>

<template>
  <NCard class="ma-0 rd-0 pa-0" :bordered="false" :title="title" closable @close="routerBack">
    <div id="mse"></div>
    <NSpace class="mt-2">
      <NTag
        v-for="video in (route.query.file as string).split(',')"
        :key="video"
        type="primary"
        class="cursor-pointer pa-4"
        @click="playerNextVideo(video)">
        {{ getFileName(video) }}
      </NTag>
    </NSpace>
  </NCard>
</template>

<style scoped></style>
