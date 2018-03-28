<template>
  <div class="panel" :class="{busy:disabled}">
    <slot></slot>
    <div class="no-interact is-loading">
      <div class="bubblingG">
        <span id="bubblingG_1">
        </span>
        <span id="bubblingG_2">
        </span>
        <span id="bubblingG_3">
        </span>
      </div>
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

<style scoped>
  .panel.busy .no-interact.is-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255,255,255,0.5)
  }
  .panel.busy .no-interact.is-loading:after {
    content: "";
    width: 3rem;
    height: 3rem;
    display: inline-block;
    animation: spinAround 1000ms infinite linear;
    border: 4px solid #ccc;
    border-top-color: transparent;
    border-right-color: transparent;
    border-radius: 100%;
  }
  @media (max-width:768px) {
    .panel {
      margin-left: calc(-0.75rem - 2px);
      margin-right: calc(-0.75rem - 2px);
    }
  }
</style>
