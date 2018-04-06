<template>
  <div>
    <div class="container">
      <PageLoader class="page-loader" v-if="auth===null" color="dark"></PageLoader>
      <div class="columns is-marginless">
        <div v-if="auth && page_error==false" class="column">
          <BusyPanel :class="{busy:loading}">
            <div class="panel-heading">
              <b>User Details</b>
            </div>
            <div class="panel-block block-footer">
              <table class="table is-bordered-inside is-narrow is-striped is-fullwidth" style="margin-bottom:0">
                <tbody>
                  <tr>
                    <td>Name</td><td>{{item.name}}</td>
                  </tr>
                  <tr>
                    <td>Email</td><td>{{item.email}}</td>
                  </tr>
                  <tr>
                    <td>Address</td>
                    <td>
                      <span class="eth-address monospace">{{item.address}}</span>
                      <span class="qr-button" title="Click for QR code" @click="show_qr(item.address)">
                        <i class="fa fa-qrcode"></i>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Guardian Address</td>
                    <td>
                      <span class="eth-address monospace">
                        <a :href="'/user/' + item.guardian_address" target="_blank">{{item.guardian_address}}</a>
                      </span>
                      <template v-if="!this.item.guardian_address" >
                        <template v-if="this.item.guardian_type==='static'">
                          (genesis)
                        </template>
                        <template v-else>
                          Not indicated
                        </template>
                      </template>
                      <span v-if="this.item.guardian_address" class="qr-button" title="Click for QR code"
                       @click="show_qr(item.guardian_address)">
                        <i class="fa fa-qrcode"></i>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Mounting Address</td>
                    <td>
                      <span class="eth-address monospace">
                        <a :href="'/user/' + item.mounting_address" target="_blank">{{item.mounting_address}}</a>
                        ({{item.mounting_type}})
                      </span>
                      <template v-if="!this.item.mounting_address">
                        (genesis)
                      </template>
                      <span v-if="this.item.mounting_address" class="qr-button" title="Click for QR code" 
                       @click="show_qr(item.mounting_address)">
                        <i class="fa fa-qrcode"></i>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Joined</td><td>{{item.created_at}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BusyPanel>
        </div>
      </div>
    </div>
    <div class="modal" :class="{'is-active':modals.qr.active}">
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
  import NavMenuAuth from '@/components/containers/NavMenuAuth'
  import NavAccountAuth from '@/components/containers/NavAccountAuth'
  import PageLoader from '@/components/etc/PageLoaderArcs'
  import BusyPanel from '@/components/containers/BusyPanel'
  import PanelPaginator from '@/components/containers/PanelPaginator'
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
        auth: true,
        page_error: false,
        item: {}
      }
    },
    methods: {
      fetch () {
        this.loading = true
        let userLocator = this.$route.params.user_locator
        console.log(userLocator)
        this.$http.get('users/' + userLocator).then((response) => {
          this.auth = true
          this.item = response.body
          this.loading = false
          if (typeof response.body.name === 'undefined') this.page_error = '404'
        }).catch((response) => {
          if (response.status === 403) {
            this.auth = false
          } else {
            // this.$router.push('/signout')
            this.loading = false
            console.log('error has occured')
          }
        })
      },
      show_qr (qrValue) {
        this.modals.qr.value = qrValue
        this.modals.qr.active = true
      }
    },
    components: { PageLoader, PanelPaginator, BusyPanel, NavMenuAuth, NavAccountAuth }
  }
</script>

<style scoped>
  @media (max-width:768px) {
    .eth-address {
      display: none;
    }
  }
  .is-bordered-inside tr:first-child td {
    border-top-style: none;
  }
</style>
