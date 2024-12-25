<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useRouterPush } from '@/hooks/common/router'
import { updateActress } from '@/service/api'
import { $t } from '@/locales'
import { cupOptions } from '@/constants/library'

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
const favorite = ref(false)
function setFavorite() {
  const temp = props.actress
  favorite.value = !favorite.value
  temp.favorite = favorite.value
  updateActress(temp).then(res => {
    if (res.data) {
      window.$message?.success(temp.favorite ? $t('common.addFavorite') : $t('common.removeFavorite'))
    }
  })
}
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
onMounted(() => {
  favorite.value = props.actress.favorite
})
</script>

<template>
  <NCard
    :bordered="false"
    size="small"
    class="relative z-4 w-36 rd-md text-center transition-transform duration-300 hover:transform-translate-y--2"
    hoverable>
    <template #cover>
      <img
        v-if="actress.avatar === ''"
        src="@renderer/assets/imgs/default-avatar.png"
        class="h-36 w-36 cursor-pointer object-cover"
        @click="showDetail(actress)" />
      <img
        v-else
        :src="actress.avatar"
        class="h-36 w-36 cursor-pointer object-cover object-top"
        @click="showDetail(actress)" />
    </template>
    <NP class="line-clamp-1 ma-0 cursor-pointer pt-1">
      <NButton text class="mr-1 font-size-4" @click="setFavorite">
        <NIcon>
          <SvgIcon
            class="inline-flex"
            :icon="favorite ? 'fluent-emoji-flat:heart-suit' : 'fluent-emoji-flat:grey-heart'"></SvgIcon>
        </NIcon>
      </NButton>
      <NText @click="showDetail(actress)">{{ actress.name }}</NText>
    </NP>
    <NP v-show="showSecondTitle" depth="3" class="ma-0">
      <NText v-if="sort != 'personalScore'">({{ sortText }})</NText>
      <NRate v-else :value="actress.personalScore" allow-half readonly size="small" class="mt-1" />
    </NP>
  </NCard>
</template>
