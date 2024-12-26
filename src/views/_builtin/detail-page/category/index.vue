<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRouterPush } from '@/hooks/common/router'
import { fetchActressPagedList, findMovie } from '@/service/api'
import { useAppStore } from '@/store/modules/app'

defineOptions({
  name: 'VideoDetail'
})

const appStore = useAppStore()
const route = useRoute()
const { routerBack } = useRouterPush()

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

const actressList = ref<Array<Dto.DbActress>>([])
onMounted(() => {
  findMovie(route.query.num as string).then(res => {
    if (res.data !== null) {
      info.value = res.data
      fetchActressPagedList({
        page: 1,
        pageSize: 100,
        name: res.data.actress,
        sort: 'updatedTime',
        sortRule: 'DESC'
      }).then(act => {
        if (act.data !== null) {
          actressList.value = act.data.records
        }
      })
    }
  })
})

function goTagPage(tag: string) {
  window.$message?.info(tag)
}
</script>

<template>
  <NGrid x-gap="12" y-gap="24" :cols="2">
    <NGi :span="2">
      <NPageHeader :subtitle="info.originTitle" @back="routerBack">
        <NCard>
          <NSpace justify="start">
            <div>
              <img :src="appStore.baseURL + info.cover == '' ? info.poster : info.cover" class="w-xl" />
            </div>
            <NFlex vertical class="w-4xl">
              <NH1 class="my-1">{{ info.title }} ({{ info.year }})</NH1>
              <NP depth="3" class="my-0">{{ info.originTitle }}</NP>
              <NSpace justify="space-between">
                <NStatistic label="上映时间" :value="info.releaseTime" />
                <NStatistic label="媒体评分" :value="info.score" />
                <NStatistic label="导演" :value="info.director" />
                <NStatistic label="厂商" :value="info.studio" />
              </NSpace>
              <NBreadcrumb>
                <NBreadcrumbItem
                  v-for="tag in info.genres.split('|').filter(x => x.length > 0)"
                  :key="tag"
                  @click="goTagPage(tag)">
                  {{ tag }}
                </NBreadcrumbItem>
              </NBreadcrumb>
              <NH4 class="my-0">剧情简介</NH4>
              <NP class="line-clamp-6 mt-0">{{ info.introduction.replace('<![CDATA[', '').replace(']]>', '') }}</NP>
            </NFlex>
          </NSpace>

          <NP>入库时间：{{ new Date(info.createdTime).toLocaleDateString() }}</NP>
          <NH2>演员</NH2>
          <NSpace>
            <ActressCard
              v-for="actor in actressList"
              :key="actor.name"
              :actress="actor"
              :show-second-title="false"
              sort="score"
              @click="goTagPage(actor.name)"></ActressCard>
          </NSpace>
        </NCard>
        <template #title>
          {{ info.title }}
        </template>
        <template #extra>
          <NSpace>
            <NButton disabled>{{ $t('common.modify') }}</NButton>
          </NSpace>
        </template>
      </NPageHeader>
    </NGi>
    <NGi span="2">
      <NCard title="相关推荐"></NCard>
    </NGi>
    <NGi>
      <NCard title="相关推荐"></NCard>
    </NGi>
  </NGrid>
</template>

<style scoped></style>
