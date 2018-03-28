<template>
  <div class="navbar-item">
    <router-link v-if="role_id === 1" class="button" to="/admin/dashboard" :class="getState('/admin/dashboard')">Dashboard</router-link>
    <router-link v-if="role_id === 1" class="button" to="/admin/users" :class="getState('/admin/users')">Users</router-link>
    <router-link v-if="role_id === 1" class="button" to="/admin/cuks" :class="getState('/admin/cuks')">CUKs</router-link>
    <router-link v-if="role_id === 2" class="button" to="/account/dashboard" :class="getState('/account/dashboard')">Dashboard</router-link>
    <router-link v-if="role_id === 2" class="button" to="/account/referrals" :class="getState('/account/referrals')">Referrals</router-link>
    <router-link v-if="role_id === 2" class="button" to="/account/safes" :class="getState('/account/safes')">Safes</router-link>
  </div>
</template>

<script>
export default {
  computed: {
    role_id () {
      let userdata = JSON.parse(localStorage.user_data)
      return userdata.role_id
    }
  },
  beforeMount () {
  },
  methods: {
    getState (btnName) {
      let classname = {}
      if (this.$route.path === btnName) {
        classname['is-primary'] = true
      } else {
        classname['is-white'] = true
      }
      return classname
    }
  }
}
</script>

<style scoped>
  .button {
    margin-right: 5px;
  }
  .navbar-item .button:hover:not(.is-primary) {
    background-color: #eaf8fe;
  }
  .button:last-child {
    margin-right: 0;
  }
</style>
