import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'
import { useLoading } from '@sa/hooks'
import { SetupStoreId } from '@/enum'
import { useRouterPush } from '@/hooks/common/router'
import { fetchGetUserInfo, fetchLogout } from '@/service/api'
import { localStg } from '@/utils/storage'
import { useRouteStore } from '../route'
import { useTabStore } from '../tab'
import { useAppStore } from '../app'
import { clearAuthStorage, getToken } from './shared'

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute()
  const appStore = useAppStore()
  const routeStore = useRouteStore()
  const tabStore = useTabStore()
  const { toLogin, redirectFromLogin } = useRouterPush(false)
  const { loading: loginLoading, startLoading, endLoading } = useLoading()

  const token = ref(getToken())

  const userInfo: Api.Auth.UserInfo = reactive({
    userId: '',
    userName: '',
    roles: [],
    buttons: []
  })

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE)
  })

  /** Is login */
  const isLogin = computed(() => Boolean(token.value))

  /** Reset auth store */
  async function resetStore() {
    const authStore = useAuthStore()

    await fetchLogout()

    clearAuthStorage()

    authStore.$reset()

    if (!route.meta.constant) {
      await toLogin()
    }

    tabStore.cacheTabs()
    routeStore.resetStore()
  }

  /**
   * Login
   *
   * @param userName User name
   * @param password Password
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(userName: string, password: string, redirect = true) {
    startLoading()

    // const { data: loginToken, error } = await fetchLogin(userName, password);
    appStore.setBaseUrl(userName)
    if (password === 'rEt25472A2eb5tai47') {
      // const pass = await loginByToken(loginToken);
      const pass = true
      localStg.set('token', appStore.getBaseUrl())
      if (pass) {
        await routeStore.initAuthRoute()

        if (redirect) {
          await redirectFromLogin()
        }
      }
    } else {
      resetStore()
    }

    endLoading()
  }

  async function getUserInfo() {
    const { data: infoDto, error } = fetchGetUserInfo()

    if (!error) {
      const info: Api.Auth.UserInfo = {
        userId: infoDto.account || '',
        userName: infoDto.username || '',
        roles: infoDto.userRoles,
        buttons: infoDto.permissions
      }
      // update store
      Object.assign(userInfo, info)

      return true
    }

    return false
  }

  async function initUserInfo() {
    const hasToken = getToken()

    if (hasToken) {
      const pass = await getUserInfo()

      if (!pass) {
        resetStore()
      }
    }
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    initUserInfo
  }
})
