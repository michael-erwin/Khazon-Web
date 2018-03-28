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
                <SearchBox @submit="search" @cleared="clear_search" />
              </div>
            </div>
            <div class="panel-block" style="background-color:white">
              <table class="table is-hoverable is-narrow is-striped is-bordered-inside is-fullwidth" style="margin-bottom:0">
                <thead>
                  <tr>
                    <th>Name</td><th>Email</th><th>Wallet</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in items">
                    <td><a :href="'/user/' + item.id" target="_blank">{{item.name}}</a></td>
                    <td>{{item.email}}</td>
                    <td>
                      <span class="eth-address monospace">{{item.address}}</span>
                      <span class="qr-button" title="Click for QR code" @click="show_qr(item.address)">
                        <i class="fa fa-qrcode"></i>
                      </span>
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
          type: 'search',
          keyword: ''
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
      fetch () {
        this.loading = true
        let options = {
          params: {
            per_page: this.page_limit,
            page: this.page_number
          }
        }
        let filter = this.filter_result
        if (filter.type === 'search' && filter.keyword.trim().length > 0) {
          options.params.search = filter.keyword
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
        filter.type = 'search'
        filter.keyword = value
        this.fetch()
      },
      clear_search () {
        let filter = this.filter_result
        filter.keyword = ''
        this.fetch()
      }
    },
    components: { PageLoader, PanelPaginator, BusyPanel, SearchBox }
  }
</script>

<style scoped>
  @media (max-width:768px) {
    .eth-address {
      display: none;
    }
  }
</style>
