<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { findAllStudio } from '@/service/api'

defineOptions({
  name: 'StudioPage'
})
const keys = ref<Array<string>>([])
onMounted(() => {
  findAllStudio().then(res => {
    if (res.data) {
      res.data.forEach(item => {
        if (item.studio.length > 0) {
          keys.value.push(item.studio)
        }
      })
    } else {
      keys.value = []
    }
  })
})
</script>

<template>
  <NSpace justify="center">
    <FavoriteCardGroup :keys="keys" storage-key="favorite_studio" type="studio" />
  </NSpace>
</template>

<style scoped></style>
