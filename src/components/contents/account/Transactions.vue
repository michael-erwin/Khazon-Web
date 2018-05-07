<template>
  <div>
    <div class="container">
      <PageLoader class="page-loader" v-if="auth===null" color="dark"></PageLoader>
      <div class="columns is-marginless">
        <div v-if="auth && page_error==false" class="column">
          <BusyPanel :class="{busy:loading}">
            <div class="panel-heading">
              <b>Transaction Details</b>
            </div>
            <div class="panel-block block-footer">
              <table class="table is-bordered-inside is-narrow is-striped is-fullwidth" style="margin-bottom:0">
                <tbody>
                  <tr>
                    <td>Amount</td><td>{{item.amount}} kta</td>
                  </tr>
                  <tr>
                    <td>Sender</td>
                    <td>
                      <span class="eth-address monospace overflow-ellipsis">
                        <a :href="'/user/' + item.sender" target="_blank">{{item.sender}}</a>
                      </span>
                      <span class="qr-button" title="Click for QR code" 
                       @click="show_qr(item.sender)">
                        <i class="fa fa-qrcode"></i>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Receiver</td>
                    <td>
                      <span class="eth-address monospace overflow-ellipsis">
                        <a :href="'/user/' + item.receiver" target="_blank">{{item.receiver}}</a>
                      </span>
                      <span class="qr-button" title="Click for QR code" 
                       @click="show_qr(item.receiver)">
                        <i class="fa fa-qrcode"></i>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Created</td><td>{{item.created_at}}</td>
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
          <input class="monospace overflow-ellipsis input-clear" 
          style="width:100%;text-align:center" 
          :value="modals.qr.value" readonly 
           @focus="$event.target.select()" />
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
        let txId = this.$route.params.tx_id
        this.$http.get('transactions/transfer/' + txId).then((response) => {
          this.auth = true
          this.item = response.body
          this.loading = false
        }).catch((response) => {
          console.log(response)
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
  table {
    table-layout:fixed;
  }
  table th,
  table td {
    position: relative;
    vertical-align: middle;
  }
  table td:first-child {
    width: 20%;
  }
  @media (max-width:768px) {
  }
  @media (max-width:420px) {
    table td {
      height: 36px;
    }
    table td:first-child {
      width: 30%;
    }
    table td:last-child > .eth-address {
      display: block;
      width: 85%;
    }
    .qr-button {
      position: absolute;
      top: 4px; right: 8px;
    }
  }
  .is-bordered-inside tr:first-child td {
    border-top-style: none;
  }
</style>
