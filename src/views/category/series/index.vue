<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { findAllSeries } from '@/service/api'

defineOptions({
  name: 'SeriesPage'
})
const keys = ref<Array<string>>([])
onMounted(() => {
  findAllSeries().then(res => {
    if (res.data) {
      res.data.forEach(item => {
        if (item.series.length > 0) {
          keys.value.push(item.series)
        }
      })
    } else {
      keys.value = []
    }
  })
})
</script>

<template>
  <NSpace>
    <FavoriteCardGroup :keys="keys" storage-key="favorite_series" type="series" />
  </NSpace>
</template>

<style scoped></style>
