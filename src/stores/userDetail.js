// stores/userDetail.js
import { defineStore } from 'pinia'

export const useUserDetailStore = defineStore('userDetail', {
  state: () => ({
    userDetail: {},
  }),
  persist: true,
})
