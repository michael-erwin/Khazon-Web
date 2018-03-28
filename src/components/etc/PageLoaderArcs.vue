<template>
  <div class="figure" :class="color">
    <div class="arc outer rotate-right"></div>
    <div class="arc inner rotate-left"></div>
  </div>
</template>

<script>
  export default {
    props: {
      color: {
        default: 'light'
      }
    }
  }
</script>

<style scoped>
  .rotate-right {
    animation: rotate_right 4s infinite linear;
    -webkit-animation: rotate_right 4s infinite linear;
  }
  .rotate-left {
    animation: rotate_left 4s infinite linear;
    -webkit-animation: rotate_left 4s infinite linear;
  }
  .figure {
    width: 150px;
    height: 150px;
    position: relative;
  }
  .figure.light .arc {
    border: 4px solid rgba(255,255,255,0.8);
  }
  .figure.dark .arc {
    border: 4px solid rgba(100,100,100,0.5);
  }
  .figure.light .arc.outer,
  .figure.dark .arc.outer {
    border-top-color: transparent;
    border-bottom-color: transparent;
  }
  .figure.light .arc.inner,
  .figure.dark .arc.inner {
    border-left-color: transparent;
    border-right-color: transparent;
  }
  .arc {
    border-radius: 100%;
  }
  .arc.outer {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px; left: 0px;
  }
  .arc.inner {
    width: calc(100% - 24px);
    height: calc(100% - 24px);
    position: absolute;
    top: 12px; left: 12px;
  }
  @keyframes rotate_right {
    from { transform: rotate(0deg); }
    to { transform: rotate(359deg); }
  }
  @keyframes rotate_left {
    from { transform: rotate(359deg); }
    to { transform: rotate(0deg); }
  }
  @-webkit-keyframes rotate_right {
    from { -webkit-transform: rotate(0deg); }
    to { -webkit-transform: rotate(359deg); }
  }
  @-webkit-keyframes rotate_left {
    from { -webkit-transform: rotate(359deg); }
    to { -webkit-transform: rotate(0deg); }
  }
</style>
