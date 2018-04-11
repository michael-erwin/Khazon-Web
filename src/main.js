// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
// import router from './router'
import router from './router/down.js'
import store from './store'
import velocity from 'velocity-animate'
import VueNoty from 'vuejs-noty'

import './assets/noty/noty.css'
import './assets/noty/themes/sunset.css'

Vue.config.productionTip = false
Vue.prototype.$animate = velocity
Vue.use(VueNoty)

// Load our main styles
require('./assets/scss/main.scss')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
