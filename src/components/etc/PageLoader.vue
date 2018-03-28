<template>
  <div class="page-loader">
    <div class="snakeloading">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      disabled: false
    }
  }
</script>

<style>
  .page-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 15rem;
  }
</style>
