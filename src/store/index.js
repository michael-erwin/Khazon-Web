import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    page: {
      name: null,
      number: 1,
      limit: 15,
      total: 1,
      data: []
    },
    user: {
      name: 'unknown',
      email: 'unknown'
    }
  },
  mutations: {
    setPageName (state, name) {
      state.page.name = name
    },
    setPageNumber (state, number) {
      state.page.number = number
    },
    setPageLimit (state, limit) {
      state.page.limit = limit
    },
    setPageTotal (state, total) {
      state.page.total = total
    },
    setPageData (state, data) {
      state.page.data = data
    },
    resetValues (state) {
      state.page.name = null
      state.page.number = 1
      state.page.limit = 15
      state.page.total = 1
      state.page.data = []
    },
    updateUser (state, data) {
      if (typeof data === 'object') {
        localStorage.user_data = JSON.stringify(data)
      }
      if (localStorage.user_data) {
        state.user = JSON.parse(localStorage.user_data)
      }
    },
    clearUser (state) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_data')
    }
  },
  actions: {
    setPageNumberAct (state, number) {
      state.commit('setPageNumber', number)
    }
  }
})
