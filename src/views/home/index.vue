<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import CardData from './modules/card-data.vue'
import PieChart from './modules/pie-chart.vue'

const appStore = useAppStore()

const gap = computed(() => (appStore.isMobile ? 0 : 16))
</script>

<template>
  <NSpace vertical :size="16">
    <CardData />
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:10">
        <NCard :bordered="false" class="card-wrapper">
          <PieChart />
        </NCard>
      </NGi>
    </NGrid>
  </NSpace>
</template>

<style scoped></style>
