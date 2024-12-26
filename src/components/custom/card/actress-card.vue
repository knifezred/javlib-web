<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouterPush } from '@/hooks/common/router'
import { cupOptions } from '@/constants/library'
import { useAppStore } from '@/store/modules/app'

defineOptions({
  name: 'ActressCard'
})
interface Props {
  /** Button class */
  actress: Dto.DbActress
  showSecondTitle: boolean
  sort: string
}

const props = defineProps<Props>()
const appStore = useAppStore()
const routerPush = useRouterPush()
function showDetail(entity: Dto.DbActress) {
  routerPush.routerPushByKey('detail-page_actress', { query: { name: entity.name } })
}
const sortText = ref<string>('')
watch(
  () => props.sort,
  () => {
    if (props.sort.endsWith('Time')) {
      sortText.value = new Date(props.actress[props.sort]).toLocaleDateString()
    } else if (props.sort === 'cup') {
      sortText.value = cupOptions.find(x => x.value === props.actress.cup)?.label ?? ''
    } else if (props.sort === 'name') {
      sortText.value = props.actress.alias.split('，')[0]
    } else {
      sortText.value = props.actress[props.sort]
    }
  },
  { immediate: true }
)
</script>

<template>
  <NCard
    :bordered="false"
    size="small"
    class="relative z-4 w-24 rd-md text-center transition-transform duration-300 hover:transform-translate-y--2"
    hoverable>
    <template #cover>
      <img
        :src="appStore.baseURL + actress.avatar"
        class="max-h-24 cursor-pointer object-cover object-top"
        @click="showDetail(actress)" />
    </template>
    <NP class="line-clamp-1 ma-0 cursor-pointer pt-1" @click="showDetail(actress)">
      {{ actress.name }}
    </NP>
    <NP v-show="showSecondTitle" depth="3" class="ma-0">
      <NText v-if="sort != 'personalScore'">({{ sortText }})</NText>
      <NRate v-else :value="actress.personalScore" allow-half readonly size="small" class="mt-1" />
    </NP>
  </NCard>
</template>
