import Vue from 'vue'
import Router from 'vue-router'
import Resource from 'vue-resource'

// Main Layouts
import ErrorPageLayout from '@/components/ErrorPageLayout'

// Error Pages
import Error503 from '@/components/contents/errors/error-503'

// Router
Vue.use(Router)
Vue.use(Resource)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/errors',
      component: ErrorPageLayout,
      children: [
        { path: 'maintenance', component: Error503, alias: '/maintenance' }
      ]
    },
    { path: '*', redirect: { path: '/maintenance' } }
  ]
})
