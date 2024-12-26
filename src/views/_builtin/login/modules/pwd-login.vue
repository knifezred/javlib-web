<script setup lang="ts">
import { computed, reactive } from 'vue'
import { $t } from '@/locales'
import { useFormRules, useNaiveForm } from '@/hooks/common/form'
import { useAuthStore } from '@/store/modules/auth'

defineOptions({
  name: 'PwdLogin'
})

const authStore = useAuthStore()
const { formRef, validate } = useNaiveForm()

interface FormModel {
  url: string
  password: string
}

const model: FormModel = reactive({
  url: `${window.location.protocol}//${window.location.host}`,
  password: ''
})

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  // inside computed to make locale reactive, if not apply i18n, you can define it without computed
  const { formRules } = useFormRules()

  return {
    url: formRules.url,
    password: formRules.pwd
  }
})

async function handleSubmit() {
  await validate()
  await authStore.login(model.url, model.password)
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false">
    <NFormItem path="userName">
      <NInput v-model:value="model.url" :placeholder="$t('page.login.common.serverUrlPlaceholder')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')" />
    </NFormItem>
    <NSpace vertical :size="24">
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
    </NSpace>
  </NForm>
</template>

<style scoped></style>
