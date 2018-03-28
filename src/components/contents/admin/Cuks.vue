<template>
  <div>
    <div slot="content" class="container">
      <!-- <UnauthNotice v-if="auth === false" :active="auth === false"></UnauthNotice> -->
      <PageLoader class="page-loader" v-if="auth===null" color="dark"></PageLoader>
      <div class="columns is-marginless">
        <div v-if="auth" class="column">
          <BusyPanel :class="{busy:loading}">
            <div class="panel-heading is-clearfix">
              <b>CUKs</b>
              <div class="panel-heading-right is-pulled-right">
                <div class="panel-heading-menu">
                  <a class="button" tabindex="1">
                    <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
                  </a>
                  <ul class="dropdown">
                    <li @mousedown="open_generate_prompt()">Generate Keys</li>
                    <li class="divider"></li>
                    <li @mousedown="apply_filter('used')">
                      <i v-if="filter_result=='used'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Used
                    </li>
                    <li @mousedown="apply_filter('unused')">
                      <i v-if="filter_result=='unused'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Unused
                    </li>
                    <li @mousedown="apply_filter('all')">
                      <i v-if="filter_result=='all'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      All
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="panel-block" style="background-color:white">
              <table class="table is-hoverable is-narrow is-striped is-bordered-inside is-fullwidth" style="margin-bottom:0">
                <thead>
                  <tr>
                    <th class="hover-options">Code <sup><i class="option fa fa-files-o" title="Copy CUKs to clipboard" @click="copy_cuk_to_clipboard()"></i></sup></th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in items">
                    <td>
                      <span class="cuk monospace" :style="{'color':item.user_id? 'red' : '#363636'}">{{item.code}}</span>
                      <span class="qr-button" title="Click for QR code" @click="show_qr(item.code)">
                        <i class="fa fa-qrcode"></i>
                      </span>
                    </td>
                    <td>
                      <template v-if="item.user_id"><a :href="'/user/' + item.user_id" target="_blank">used</a></template>
                      <template v-else>unused</template>
                    </td>
                    <td>{{item.created_at!==null?item.created_at.date.match(/\d{4}\-\d{2}\-\d{2}/)[0]:''}}</td>
                    <td>{{item.created_at!==null?item.updated_at.date.match(/\d{4}\-\d{2}\-\d{2}/)[0]:''}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="panel-block">
              <PanelPaginator v-on:refresh="fetch()"></PanelPaginator>
            </div>
          </BusyPanel>
        </div>
      </div>
    </div>
    <div slot="content" class="modal" :class="{'is-active':modals.generate.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated" style="max-width:330px">
        <header class="modal-card-head">
          <p class="modal-card-title">Prompt</p>
          <button class="delete is-danger" aria-label="close" @click="modals.generate.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column" style="flex:1">Quantity</div>
            <div class="column" style="flex:3">
              <form id="cuk_generate_form" @submit.prevent="generate()">
                <div class="field">
                  <p class="control has-icons-left has-icons-right">
                    <input class="input" type="number" maxlength="4"
                      v-model="fields.generate_amount.value"
                      :placeholder="modals.generate.placeholder"
                      :class="{'is-danger':fields.generate_amount.error.length>0}"
                      @keyup="check_generate_input()"
                      @paste="check_generate_input()"
                      @cut="check_generate_input()"
                      @keyup.enter="submit" />
                    <span class="icon is-small is-left">
                      <i class="fa fa-key"></i>
                    </span>
                    <span class="icon is-small is-right" :class="{'is-hidden':fields.generate_amount.error.length===0}">
                      <i class="fa fa-warning"></i>
                    </span>
                  </p>
                  <p class="help is-danger" :class="{'is-active':fields.generate_amount.error.length>0}">{{fields.generate_amount.error}}</p>
                </div>
              </form>
            </div>
          </div>
          <div v-if="error_generic.length>0" class="columns">
            <div class="column">
              <div class="field">
                <div class="notification is-danger is-mini animated shake">
                  {{error_generic}}
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient has-minimum" :class="{'is-loading':modals.generate.loading}" @click="generate()" :disabled="!fields.generate_amount.valid">Generate</button>
          <button class="button is-gradient has-minimum" @click="modals.generate.active=false">Cancel</button>
        </footer>
      </div>
    </div>
    <div slot="content" class="modal" :class="{'is-active':modals.qr.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated" style="max-width:330px;animation-name:zoomIn">
        <header class="modal-card-head">
          <p class="modal-card-title">QR Code</p>
          <button class="delete is-danger" @click="modals.qr.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column" style="text-align: center">
              <QRCode :value="modals.qr.value" size="250"></QRCode>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:center">
          <div class="monospace" style="color:black">
            {{modals.qr.value}}
          </div>
        </footer>
      </div>
    </div>
    <!-- Extra hidden elements -->
    <div slot="content" style="position:fixed;left:0;top:0;z-index:-1">
      <textarea ref="clipboardtext"></textarea>
    </div>
  </div>
</template>

<script>
  import PageLoader from '@/components/etc/PageLoaderArcs'
  import BusyPanel from '@/components/containers/BusyPanel'
  import PanelPaginator from '@/components/containers/PanelPaginator'
  import {Form} from '@/mixins/Form.js'
  import {Qr} from '@/mixins/Utilities.js'

  export default {
    mixins: [Form, Qr],
    beforeCreate: function () {
      if (localStorage.access_token === undefined) {
        this.$router.push('/signout')
      }
    },
    beforeMount: function () {
      // Reset page data
      this.$store.commit('resetValues')
      this.fetch()
    },
    data () {
      return {
        loading: false,
        auth: null,
        fields: {
          generate_amount: {
            value: '',
            error: '',
            valid: false
          }
        },
        filter_result: 'all',
        modals: {
          generate: {
            active: false,
            placeholder: '1-1000',
            loading: false
          }
        },
        error_generic: ''
      }
    },
    computed: {
      items () {
        return this.$store.state.page.data
      },
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
      apply_filter (filter) {
        if (this.filter_result !== filter) {
          this.filter_result = filter
          this.fetch()
        }
      },
      fetch () {
        this.loading = true
        let options = {
          params: {
            per_page: this.page_limit,
            page: this.page_number,
            type: this.filter_result
          }
        }
        this.$http.get('cuks', options).then((response) => {
          this.auth = true
          let body = response.body
          let total = (body.total >= this.page_limit) ? Math.ceil(body.total / this.page_limit) : 1
          this.$store.commit('setPageData', body.data)
          this.$store.commit('setPageNumber', body.current_page)
          this.$store.commit('setPageTotal', total)
          this.loading = false
        }).catch((response) => {
          if (response.status === 403) {
            this.auth = false
          } else {
            this.$router.push('/signout')
            this.loading = false
          }
        })
      },
      check_generate_input () {
        this.error_generic = ''
        if (this.fields.generate_amount.value.length > 0) {
          if (!/^[1-9][0-9]*$/.test(this.fields.generate_amount.value)) {
            this.fields.generate_amount.error = 'Invalid number'
            this.fields.generate_amount.valid = false
          } else if (this.fields.generate_amount.value < 1 || this.fields.generate_amount.value > 1000) {
            this.fields.generate_amount.error = 'From 1 to 1000 only'
            this.fields.generate_amount.valid = false
          } else { this.fields.generate_amount.error = ''; this.fields.generate_amount.valid = true }
        } else { this.fields.generate_amount.error = ''; this.fields.generate_amount.valid = false }
      },
      open_generate_prompt () {
        this.resetForm('cuk_generate_form')
        this.error_generic = ''
        this.modals.generate.active = true
      },
      generate () {
        this.modals.generate.loading = true
        this.disableForm()
        this.$http.post('cuks/generate', {items: this.fields.generate_amount.value}).then((response) => {
          this.modals.generate.loading = false
          this.enableForm()
          this.modals.generate.active = false
          this.fetch()
        }).catch((response) => {
          if (response.status === 403) {
            this.auth = false
            this.error_generic = response.error.message
          } else {
            this.$router.push('/signout')
            this.loading = false
          }
        })
      },
      show_qr (qrValue) {
        this.modals.qr.value = qrValue
        this.modals.qr.active = true
      },
      copy_cuk_to_clipboard () {
        let cliptext = ''
        let cliptextholder = this.$refs.clipboardtext
        for (let item of this.items) {
          cliptext += item.code + '\n'
        }
        cliptextholder.value = cliptext
        cliptextholder.select()
        document.execCommand('Copy')
      }
    },
    components: { BusyPanel, PageLoader, PanelPaginator }
  }
</script>
<style scoped>
  .hover-options .option {
    font-size: 0.8rem;
    opacity: 0.8;
    cursor: pointer;
    display: none;
  }
  .hover-options .option:hover {
    opacity: 1;
  }
  .hover-options:hover .option {
    display: inline-block;
  }
</style>
