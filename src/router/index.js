import Vue from 'vue'
import Router from 'vue-router'
import Resource from 'vue-resource'

// Main Layouts
import PortalLayout from '@/components/PortalLayout'
import ControlLayout from '@/components/ControlLayout'
import ErrorPageLayout from '@/components/ErrorPageLayout'

// Portal Contents
import Index from '@/components/contents/Index'
import SignIn from '@/components/contents/SignIn'
import SignOut from '@/components/SignOut'
import ForgotPassword from '@/components/contents/ForgotPassword'
import ResetPassword from '@/components/contents/ResetPassword'
import Register from '@/components/contents/Register'
import ValidateOTP from '@/components/contents/ValidateOTP'

// Account Contents
import AccountDashboard from '@/components/contents/account/Dashboard'
import Referrals from '@/components/contents/account/Referrals'
import Safes from '@/components/contents/account/Safes'
import Settings from '@/components/contents/account/Settings'
import User from '@/components/contents/account/User'

// Admin Contents
import AdminDashboard from '@/components/contents/admin/Dashboard'
import Users from '@/components/contents/admin/Users'
import Cuks from '@/components/contents/admin/Cuks'

// Error Pages
import Error429 from '@/components/contents/errors/Error-429'
import Error404 from '@/components/contents/errors/Error-404'
import Error500 from '@/components/contents/errors/Error-500'
import Notice204 from '@/components/contents/errors/Notice-204'

// Router
Vue.use(Router)
Vue.use(Resource)
// Vue.http.options.root = 'https://api.khazon.local/v1'
Vue.http.options.root = 'https://api.khazon.online/v1'

/*
* Token management
*/
Vue.http.interceptors.push(function (request, next) {
  // Maintain authorization header if available
  if (localStorage.access_token) {
    let bearer = 'Bearer ' + localStorage.access_token
    request.headers.set('Authorization', bearer)
  }
  // Keep access token updated
  next(function (response) {
    if (response.status === 204) {
      this.$router.push('/notice-204')
    } else if (response.status === 404) {
      this.$router.push('/error-404')
    } else if (response.status === 429) {
      this.$router.push('/error-429')
    } else if (response.status === 401) {
      if (typeof response.body.error.data === 'undefined') {
        this.$router.push('/signout')
      }
    } else if (response.status === 500) {
      this.$router.push('/error-500')
    } else if (response.headers.has('Access-Token')) {
      localStorage.access_token = response.headers.get('Access-Token')
    }
  })
})

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', component: Index },
    {
      path: '/portal',
      component: PortalLayout,
      children: [
        { path: 'signin', component: SignIn, alias: '/signin' },
        { path: 'signin/verify', component: ValidateOTP, alias: '/signin/verify' },
        { path: 'forgot-password', component: ForgotPassword, alias: '/forgot-password' },
        { path: 'register', component: Register, alias: '/register' },
        { path: 'reset-password/:token', component: ResetPassword, alias: '/reset-password/:token' }
      ]
    },
    {
      path: '/account',
      component: ControlLayout,
      children: [
        { path: 'dashboard', component: AccountDashboard },
        { path: 'safes', component: Safes },
        { path: 'safes/:user_id', component: Safes },
        { path: 'referrals', component: Referrals },
        { path: 'settings', component: Settings },
        { path: 'user/:user_locator', component: User, alias: '/user/:user_locator' }
      ]
    },
    {
      path: '/admin',
      component: ControlLayout,
      children: [
        { path: 'dashboard', component: AdminDashboard },
        { path: 'users', component: Users },
        { path: 'cuks', component: Cuks }
      ]
    },
    {
      path: '/errors',
      component: ErrorPageLayout,
      children: [
        { path: 'notice-204', component: Notice204, alias: '/notice-204' },
        { path: 'error-429', component: Error429, alias: '/error-429' },
        { path: 'error-404', component: Error404, alias: '/error-404' },
        { path: 'error-500', component: Error500, alias: '/error-500' }
      ]
    },
    { path: '/signout', component: SignOut },
    { path: '*', redirect: { path: '/error-404' } }
  ]
})
