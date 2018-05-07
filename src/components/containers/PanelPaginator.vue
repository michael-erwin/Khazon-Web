<template>
  <nav class="pagination is-right is-small" role="navigation" aria-label="pagination" style="width:100%">
    <div class="pagination-display">
      <span style="line-height:27px">Display</span>&nbsp;<!--
      --><select :value="page_limit" class="select input is-small" @change="page_limit_change" ref="page_limit_input">
        <option value="15">15</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
    <ul class="pagination-list">
      <li><button class="pagination-link" :disabled="page_number<2" @click="page_prev()"><i class="fa fa-chevron-left"></i></button></li>
      <li>
        <input ref="page_number_input" type="text" class="input is-small has-text-centered" style="width:35px" :value="page_number" @keypress.enter="page_number_change()" />
        <span style="line-height:27px">of {{page_total}}</span>
      </li>
      <li><button class="pagination-link" :disabled="page_number===page_total" @click="page_next()"><i class="fa fa-chevron-right"></i></button></li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: ['current', 'total', 'batch'],
  computed: {
    page_number () {
      return this.$store.state.page.number
    },
    page_total () {
      return this.$store.state.page.total
    },
    page_limit () {
      return this.$store.state.page.limit
    }
  },
  methods: {
    fetch () {
      this.$emit('fetch')
    },
    page_number_change () {
      let pageNumberInput = this.$refs.page_number_input.value
      if (pageNumberInput > this.page_total) {
        pageNumberInput = this.page_total
        this.$refs.page_number_input.value = this.page_total
      }
      this.$store.commit('setPageNumber', pageNumberInput)
      this.$emit('refresh')
    },
    page_limit_change () {
      this.$store.commit('setPageNumber', 1)
      this.$store.commit('setPageLimit', this.$refs.page_limit_input.value)
      this.$emit('refresh')
    },
    page_prev () {
      if (this.page_number > 1) {
        let newPageNumber = Number(this.$refs.page_number_input.value) - 1
        this.$store.commit('setPageNumber', newPageNumber)
        this.$emit('refresh')
      }
    },
    page_next () {
      if (this.page_number < this.page_total) {
        let newPageNumber = Number(this.$refs.page_number_input.value) + 1
        this.$store.commit('setPageNumber', newPageNumber)
        this.$emit('refresh')
      }
    }
  }
}
</script>

<style scoped>
  .pagination-display {
    white-space: nowrap;
    padding-left: 5px;
  }
  .select.input {
    -webkit-appearance: none;
    background-image: url(/static/caret-down.svg);
    background-repeat: no-repeat;
    background-position: 90% center;
    width: 55px;
    background-size: 16px 16px;
  }
</style>
