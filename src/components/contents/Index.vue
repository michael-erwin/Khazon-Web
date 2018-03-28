<template>
  <div></div>
</template>

<script>
  export default {
    beforeCreate () {
      if (localStorage.access_token === undefined) {
        this.$router.push('/signout')
      } else if (localStorage.user_data === undefined) {
        this.$router.push('/signout')
      } else {
        let userdata = JSON.parse(localStorage.user_data)
        if (userdata.role_id === 2) {
          this.$router.push('/account/dashboard')
        } else if (userdata.role_id === 1) {
          this.$router.push('/admin/dashboard')
        }
      }
    }
  }
</script>