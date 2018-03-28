<template></template>

<script>
export default {
  beforeMount () {
    this.$store.commit('clearUser')
    this.$router.push('/signin')
  }
}
</script>
