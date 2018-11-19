<template>
  <div>
    <div v-cloak slot="content" class="container">
      <!-- <UnauthNotice v-if="auth === false" :active="auth === false"></UnauthNotice> -->
      <PageLoader class="page-loader" v-if="auth===null" color="dark"></PageLoader>
      <div class="columns is-marginless">
        <div v-if="auth" class="column">
          <BusyPanel :class="{busy:loading}">
            <div class="panel-heading">
              <b>Users</b>
              <div class="panel-heading-right is-pulled-right">
                <SearchBox @submit="search" @cleared="clear_search" />&nbsp;
                <div class="panel-heading-menu">
                  <a class="button" tabindex="1" title="Filter result">
                    <i class="fa fa-filter"></i>
                  </a>
                  <ul class="dropdown">
                    <li @mousedown="apply_filter('default', 'id')">
                      <i v-if="filter_result.name==='default'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Default order
                    </li>
                    <li @mousedown="apply_filter('balance', 'desc')">
                      <i v-if="filter_result.name==='balance'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      From highest balance
                    </li>
                    <li class="divider"></li>
                    <li @mousedown="apply_filter('status', '1')">
                      <i v-if="filter_result.name==='status' && filter_result.value==='1'" 
                         class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Active
                    </li>
                    <li @mousedown="apply_filter('status', '0')">
                      <i v-if="filter_result.name==='status' && filter_result.value==='0'" 
                         class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Inactive
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="panel-block" style="background-color:white">
              <table class="table is-hoverable is-narrow is-striped is-bordered-inside is-fullwidth" style="margin-bottom:0">
                <thead>
                  <tr>
                    <th>Name</td><th>Email</th><th>Balance</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in items">
                    <td><a :href="'/user/' + item.id" target="_blank">{{item.name}}</a></td>
                    <td>{{item.email}}</td>
                    <td>{{truncate_decimal(item.balance)}} KTA</td>
                    <td :class="status_text(item.active)">{{status_text(item.active)}}</td>
                    <td  class="actions">
                      <a class="button is-gradient is-small has-text-info" 
                        @click="show_qr(item.address)"
                        title="Show QR Address">
                        <i class="fa fa-qrcode"></i>
                      </a>
                      <template v-if="item.role_id===2">
                        <a v-if="item.active>0"
                          class="button is-gradient is-small has-text-primary" 
                          title="Deactivate account"
                          @click="confirm_status(0,index)"
                        >
                          <i class="fa fa-lock"></i>
                        </a>
                        <a v-else
                          class="button is-gradient is-small has-text-danger" 
                          title="Reactivate account"
                          @click="confirm_status(1,index)"
                        >
                          <i class="fa fa-unlock-alt"></i>
                        </a>
                      </template>
                    </td>
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
    <div slot="content" class="modal" :class="{'is-active':modals.qr.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated" style="max-width:330px;animation-name:zoomIn">
        <header class="modal-card-head">
          <p class="modal-card-title">QR Code</p>
          <button class="delete is-danger" aria-label="close" @click="modals.qr.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column" style="text-align: center">
              <QRCode :value="modals.qr.value" size="250"></QRCode>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:center">
          <div class="monospace" style="font-size:13px;color:black">
            {{modals.qr.value}}
          </div>
        </footer>
      </div>
    </div>
    <div class="modal" :class="{'is-active':modals.confirm_status.show}">
      <div class="modal-background"></div>
      <div class="modal-card animated" style="max-width:430px">
        <header class="modal-card-head">
          <p class="modal-card-title">Confirm Status</p>
          <button class="delete is-danger" :disabled="modals.confirm_status.loading"
            @click="modals.confirm_status.show=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              Do you want to <b>{{modals.confirm_status.status_text}}</b> 
              <code>{{modals.confirm_status.user.email}}</code>?
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient"
            :class="{'is-loading':modals.confirm_status.loading}"
            :disabled="modals.confirm_status.loading"
            @click="submit_confirm_status()"
          >Yes</button>
          <button class="button is-gradient" 
            @click="modals.confirm_status.show=false" 
            :disabled="modals.confirm_status.loading"
          >Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
  import PageLoader from '@/components/etc/PageLoaderArcs'
  import BusyPanel from '@/components/containers/BusyPanel'
  import PanelPaginator from '@/components/containers/PanelPaginator'
  import SearchBox from '@/components/etc/searchbox'
  import {Qr} from '@/mixins/Utilities.js'
  
  export default {
    mixins: [Qr],
    beforeCreate () {
      if (localStorage.access_token === undefined) {
        this.$router.push('/signout')
      }
    },
    beforeMount () {
      // Reset page data
      this.$store.commit('resetValues')
      this.fetch()
    },
    data () {
      return {
        loading: false,
        auth: null,
        filter_result: {
          name: 'balance',
          value: 'desc',
          search_keyword: ''
        },
        modals: {
          confirm_status: {
            user: {
              email: '',
              id: '',
              index: 0
            },
            status: '',
            status_text: '',
            show: false,
            loading: false
          }
        }
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
      apply_filter (name, value) {
        this.filter_result.name = name
        this.filter_result.value = value
        this.fetch()
      },
      fetch () {
        this.loading = true
        let options = { params: { per_page: this.page_limit, page: this.page_number } }
        let filter = this.filter_result
        if (filter.search_keyword.trim().length > 0) {
          options.params.search = filter.search_keyword
        }
        if (filter.name !== 'default') {
          if (filter.name === 'balance') {
            options.params.order_by = 'balance'
            options.params.sort_as = filter.value
          } else if (filter.name === 'status') {
            options.params.filter_field = 'active'
            options.params.filter_value = filter.value
          }
        }
        this.$http.get('users', options).then((response) => {
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
      show_qr (qrValue) {
        this.modals.qr.value = qrValue
        this.modals.qr.active = true
      },
      search (value) {
        let filter = this.filter_result
        filter.search_keyword = value
        this.fetch()
      },
      confirm_status (status, userIndex) {
        let user = this.items[userIndex]
        this.modals.confirm_status.user.id = user.id
        this.modals.confirm_status.user.email = user.email
        this.modals.confirm_status.user.index = userIndex
        this.modals.confirm_status.status = status
        this.modals.confirm_status.status_text = (status === 0) ? 'deactivate' : 'reactivate'
        this.modals.confirm_status.show = true
      },
      submit_confirm_status () {
        this.modals.confirm_status.loading = true
        let status = this.modals.confirm_status.status
        let userId = this.modals.confirm_status.user.id
        let userIndex = this.modals.confirm_status.user.index
        this.$http.put(`users/${userId}`, { active: status }).then((response) => {
          try {
            let newUserData = response.body.data
            let newItems = JSON.parse(JSON.stringify(this.items))
            newItems[userIndex] = newUserData
            this.$store.commit('setPageData', newItems)
            this.$noty.success('Status updated')
          } catch (e) {
            this.modals.confirm_status.loading = false
            this.modals.confirm_status.show = false
            this.$noty.error('An error has occured')
          }
        }).catch((response) => {
          this.$noty.error('An error has occured')
        }).finally(() => {
          this.modals.confirm_status.loading = false
          this.modals.confirm_status.show = false
        })
      },
      clear_search () {
        let filter = this.filter_result
        filter.search_keyword = ''
        this.fetch()
      },
      truncate_decimal (amount) {
        return Number(amount).toFixed(4)
      },
      status_text (code) {
        return code === 0 ? 'inactive' : 'active'
      }
    },
    components: { PageLoader, PanelPaginator, BusyPanel, SearchBox }
  }
</script>

<style scoped>
  .actions .button {
    width: 32px;
  }
  .active {
    color: #00d1b2;
  }
  .inactive {
    color: #ff3860;
  }
</style>
