<template>
  <div class="field">
      <p class="control has-icons-right">
        <input class="input is-small" v-model="input" type="text" placeholder="Search" @keypress.enter="submit">
        <span class="icon is-right" :class="{'is-hidden': this.search_submitted}">
          <i class="fa fa-search"></i>
        </span>
        <span v-show="this.search_submitted" class="icon-control" @click="clear" title="Clear search">
          <i class="fa fa-times"></i>
        </span>
      </p>
    </div>
</template>
<script>
export default {
  data () {
    return {
      input: '',
      search_submitted: false
    }
  },
  methods: {
    clear () {
      this.input = ''
      this.search_submitted = false
      this.$emit('cleared', '')
    },
    submit () {
      let inputValue = this.input.trim()
      if (inputValue === '') {
        this.input = ''
        this.search_submitted = false
        this.$emit('cleared', '')
      } else {
        this.search_submitted = true
        this.$emit('submit', inputValue)
      }
    }
  }
}
</script>
<style scoped>
  .icon-control {
    height: 2.25em;
    width: 2.25em;
    line-height: 2.25em;
    position: absolute;
    right: 0px; top: 0px;
    font-size: 0.75rem;
    text-align: center;
    z-index: 5;
    cursor: pointer;
    opacity: 0.8;
  }
  .icon-control:hover {
    opacity: 1;
  }
  .is-hidden {
    visibility: hidden;
  }
</style>