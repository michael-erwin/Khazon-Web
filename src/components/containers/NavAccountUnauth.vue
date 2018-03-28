<template>
  <div>
    <router-link to="/signin" class="nav-item button" :class="getState('signin')">Sign-in</router-link>
    &nbsp;
    <router-link to="/register" class="nav-item button" :class="getState('register')">Register</router-link>
  </div>
</template>

<script>
export default {
  props: ['active'],
  methods: {
    getState (btnName) {
      let classname = {}
      if (this.active === btnName) {
        classname['is-danger'] = true
      } else {
        classname['is-white'] = true
      }
      return classname
    }
  }
}
</script>
