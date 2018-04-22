<template>
  <div>
    <div slot="content" class="container">
      <!-- <UnauthNotice v-if="auth === false"></UnauthNotice> -->
      <PageLoader class="page-loader" v-if="auth===null" color="dark"></PageLoader>
      <div class="stats columns is-marginless">
        <div v-if="auth" class="column">
          <BusyPanel class="card-box blue" :class="{busy:stats_loading}">
            <div class="panel-block">
              <table>
                <tbody>
                  <tr>
                    <td class="icon-cell">
                      <div class="stats-icon info">
                        <i class="fa fa-users"></i>
                      </div>
                    </td>
                    <td class="value-cell">
                      <div><router-link to="/admin/users">Users</router-link></div>
                      <div>{{stats.total_users}}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BusyPanel>
        </div>
        <div v-if="auth" class="column">
          <BusyPanel class="card-box pink" :class="{busy:stats_loading}">
            <div class="panel-block">
              <table>
                <tbody>
                  <tr>
                    <td class="icon-cell">
                      <div class="stats-icon danger">
                        <i class="fa fa-exclamation-triangle"></i>
                      </div>
                    </td>
                    <td class="value-cell">
                      <div><a @click="set_payable_filter('0')">Payables</a></div>
                      <div>{{stats.total_payables}} kta</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BusyPanel>
        </div>
        <div v-if="auth" class="column">
          <BusyPanel class="card-box lime" :class="{busy:stats_loading}">
            <div class="panel-block">
              <table>
                <tbody>
                  <tr>
                    <td class="icon-cell">
                      <div class="stats-icon success">
                        <i class="fa fa-thumbs-o-up"></i>
                      </div>
                    </td>
                    <td class="value-cell">
                      <div><a @click="set_payable_filter('1')">Paid</a></div>
                      <div>{{stats.total_paid}} kta</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BusyPanel>
        </div>
      </div>
    </div>
    <div slot="content" class="container">
      <div class="stats columns is-marginless">
        <div v-if="auth" class="column">
          <BusyPanel :class="{busy:payables_loading}">
            <div class="panel-heading">
              <b>Account Payables</b>
              <div class="panel-heading-right is-pulled-right">
                <date-picker v-show="filter_result.type=='date_range'" v-model="filter_result.date_range" lang="en "range format="yyyy-MM-dd"
                 :shortcuts="date_presets" confirm @confirm="submit_date_range"></date-picker>
                <SearchBox v-show="filter_result.type=='search'" style="width:190px" @submit="submit_search" @cleared="submit_search" />&nbsp;
                <div class="panel-heading-menu">
                  <a class="button" tabindex="1" title="Filter result">
                    <i class="fa fa-filter"></i>
                  </a>
                  <ul class="dropdown">
                    <li @mousedown="filter_result.type='search'">
                      <i v-if="filter_result.type=='search'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Search
                    </li>
                    <li @mousedown="filter_result.type='date_range'">
                      <i v-if="filter_result.type=='date_range'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Filter date
                    </li>
                    <li class="divider"></li>
                    <li @mousedown="set_payable_filter('1')">
                      <i v-if="filter_result.paid==='1'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Show completed
                    </li>
                    <li @mousedown="set_payable_filter('0')">
                      <i v-if="filter_result.paid==='0'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Show pending
                    </li>
                    <li @mousedown="set_payable_filter(false)">
                      <i v-if="!filter_result.paid" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Show all
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="panel-block">
              <table id="table_account_payables" v-if="payables.length > 0" class="table is-hoverable is-narrow is-striped is-fullwidth is-bordered-inside" style="margin-bottom:0">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in payables">
                    <td>{{truncate_decimal(item.kta_amt)}}</td>
                    <td><a :href="'/user/' + item.user_id" target="_blank">{{item.name}}</a></td>
                    <td>{{item.email}}</td>
                    <td>
                      <template v-if="item.complete">
                        <a :href="'https://etherscan.io/tx/'+item.ref" target="_blank"
                          title="Click to see receipt"
                        >completed</a>
                      </template>
                      <template v-else>
                        pending
                      </template>
                    </td>
                    <td>{{format_date(item.created_at)}}</td>
                    <td><a v-show="item.complete==0" class="button is-gradient is-small" @click="pay_account(item)">Pay</a></td>
                  </tr>
                </tbody>
              </table>
              <div v-else>Data is empty</div>
            </div>
            <div v-if="payables.length > 0" class="panel-block">
              <PanelPaginator v-on:refresh="fetch_payables()"></PanelPaginator>
            </div>
          </BusyPanel>
        </div>
      </div>
    </div>
    <div slot="content" class="modal" :class="{'is-active':modals.pay.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated">
        <header class="modal-card-head">
          <p class="modal-card-title">Pay Account</p>
          <button class="delete is-danger" aria-label="close" @click="modals.pay.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column" style="text-align:center;flex:1">
              <QRCode :value="modals.qr.value" size="167"></QRCode>
            </div>
            <div class="column" style="flex:3">
              <table class="table is-bordered is-fullwidth is-narrow" style="margin-bottom:0">
                <tbody>
                  <tr>
                    <td style="max-width:100px">User</td><td>{{modals.pay.name}}</td>
                  </tr>
                  <tr>
                    <td>Pay To</td>
                    <td>
                      <input type="text" class="address-placeholder monospace" :value="modals.pay.address" />
                    </td>
                  </tr>
                  <tr>
                    <td>Type</td><td>{{translate_code(modals.pay.code)}}</td>
                  </tr>
                  <tr>
                    <td>Amount</td><td>{{truncate_decimal(modals.pay.amount)}} kta</td>
                  </tr>
                  <tr>
                    <td>TXN Hash</td>
                    <td>
                      <form @submit.prevent="submit_pay()" novalidate>
                        <div class="field has-addons">
                          <div class="control" @click="scan_qr()">
                            <a class="button is-small" title="Scan QR using webcam">
                              <i class="fa fa-camera"></i>
                            </a>
                          </div>
                          <div class="control is-expanded has-icons-right">
                            <input class="input is-small" type="text" placeholder="TXN value"
                              :class="{'is-danger':modals.pay.txn_hash.error.length>0}"
                              :disabled="modals.pay.loading"
                              v-model="modals.pay.txn_hash.value"
                              @keyup="checkinput_pay()"
                              @paste="checkinput_pay()"
                              @cut="checkinput_pay()">
                            <span class="icon is-small is-right" :class="{'is-hidden':modals.pay.txn_hash.error.length===0}">
                              <i class="fa fa-warning"></i>
                            </span>
                          </div>
                          <p class="help is-danger" :class="{'is-active':modals.pay.txn_hash.error.length>0}">{{modals.pay.txn_hash.error}}</p>
                        </div>
                      </form>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient has-minimum" 
            :class="{'is-loading':modals.pay.loading}"
            :disabled="!modals.pay.input_valid || modals.pay.loading"
            @click="submit_pay()">Confirm</button>
          <button class="button is-gradient has-minimum" @click="modals.pay.active=false">Cancel</button>
        </footer>
      </div>
    </div>
    <div ref="qr_scanner">
      <QRCodeScanner :active="qr_scanner.active" @decoded="scan_done" @canceled="scan_cancel" />
    </div>
  </div>
</template>

<script>
  import PageLoader from '@/components/etc/PageLoaderArcs'
  import BusyPanel from '@/components/containers/BusyPanel'
  import DatePicker from '@/components/etc/datepicker'
  import PanelPaginator from '@/components/containers/PanelPaginator'
  import QRCodeScanner from '@/components/etc/QRCodeScanner'
  import SearchBox from '@/components/etc/searchbox'
  import { Earnings, FullScreenCtl, Qr } from '@/mixins/Utilities.js'

  export default {
    mixins: [Earnings, FullScreenCtl, Qr],
    beforeCreate () {
      if (localStorage.access_token === undefined) {
        this.$router.push('/signout')
      } else if (localStorage.user_data === undefined) {
        this.$router.push('/signout')
      } else {
        try {
          let userdata = JSON.parse(localStorage.user_data)
          if (userdata.role_id !== 1) {
            this.$router.push('/signout')
          }
        } catch (e) {
          this.$router.push('/signout')
        }
      }
    },
    beforeMount () {
      this.$store.commit('resetValues')
      this.fetch_stats()
    },
    data () {
      return {
        auth: null,
        stats_loading: false,
        payables_loading: false,
        prefix: '',
        stats: {
          total_users: 0,
          total_payables: 0.00,
          total_paid: 0.00
        },
        filter_result: {
          type: 'search',
          date_range: '',
          keyword: '',
          paid: '0'
        },
        modals: {
          pay: {
            active: false,
            address: 'na',
            amount: 'na',
            id: null,
            code: 'na',
            input_valid: false,
            loading: false,
            name: 'na',
            type: 'na',
            txn_hash: {
              value: '',
              error: '',
              regex: /^0x[0-9a-f]{64}$/i,
              regex_error: 'Invalid format'
            },
            user_id: null
          }
        },
        qr_scanner: {
          active: null
        }
      }
    },
    computed: {
      date_presets () {
        let now = new Date()
        return [{
          text: 'This month',
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        },
        {
          text: 'Last 7 days',
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        },
        {
          text: 'Last 30 days',
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        },
        {
          text: 'Last 90 days',
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        }]
      },
      payables () {
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
      checkinput_pay () {
        let _self = this.modals.pay
        let field = _self.txn_hash
        let errors = 0
        if (field.value === '') {
          field.error = ''
          errors++
        } else if (!field.regex.test(field.value)) {
          field.error = field.regex_error
          errors++
        } else {
          field.error = ''
        }
        if (errors === 0) {
          _self.input_valid = true
        } else {
          _self.input_valid = false
        }
      },
      fetch_stats () {
        let path = 'stats/dashboard'
        this.stats_loading = true
        this.$http.get(path).then((response) => {
          this.stats_loading = false
          let data = response.body
          this.stats = {
            total_users: data.total_users,
            total_payables: data.total_payables ? this.truncate_decimal(data.total_payables) : this.truncate_decimal(0),
            total_paid: data.total_paid ? this.truncate_decimal(data.total_paid) : this.truncate_decimal(0)
          }
          this.fetch_payables()
        }).catch((response) => {
          if (response.status === 403) {
            this.auth = false
          } else if (response.status === 423) {
            this.$router.push('/signin/verify')
          } else {
            this.$router.push('/signout')
            this.stats_loading = false
          }
        })
      },
      fetch_payables (input = false) {
        let path = 'transactions/payables'
        this.payables_loading = true
        let options = {
          params: {
            per_page: this.page_limit,
            page: this.page_number
          }
        }
        if (this.filter_result.paid) options.params.complete = String(this.filter_result.paid)
        if (input) {
          let type = this.filter_result.type
          if (type === 'date_range') {
            if (typeof input === 'object') {
              options.params.date_from = input.from
              options.params.date_to = input.upto
            }
          }
        } else {
          if (this.filter_result.keyword.length > 0) {
            options.params.search = this.filter_result.keyword
          }
        }
        this.$http.get(path, options).then((response) => {
          this.auth = true
          this.payables_loading = false
          let body = response.body
          let total = (body.total >= this.page_limit) ? Math.ceil(body.total / this.page_limit) : 1
          this.$store.commit('setPageData', body.data)
          this.$store.commit('setPageNumber', body.current_page)
          this.$store.commit('setPageTotal', total)
        }).catch((response) => {
          if (response.status === 403) {
            this.auth = false
          } else {
            // this.$router.push('/signout')
            this.payables_loading = false
          }
        })
      },
      format_date (dateRaw) {
        return dateRaw.match(/\d{4}-\d{2}-\d{2}/)[0]
      },
      format_date_db (dateObj) {
        let yyyy = dateObj.getFullYear()
        let mm = dateObj.getMonth() + 1; mm = String(mm).length === 1 ? '0' + mm : mm
        let dd = String(dateObj.getDate()).length === 1 ? '0' + dateObj.getDate() : dateObj.getDate()
        return yyyy + '-' + mm + '-' + dd
      },
      pay_account (item) {
        let _self = this.modals.pay
        _self.address = item.address
        _self.amount = item.kta_amt
        _self.code = item.code
        _self.id = item.id
        _self.name = item.name
        _self.txn_hash.value = ''
        _self.user_id = item.user_id
        _self.active = true
        this.modals.qr.value = item.address
        this.checkinput_pay()
      },
      scan_qr () {
        this.qr_scanner.active = true
        if (window.innerWidth < 768) this.makeFullScreen(this.$refs.qr_scanner)
      },
      scan_cancel () {
        this.qr_scanner.active = null
        this.exitFullScreen()
      },
      scan_done (data) {
        this.modals.pay.txn_hash.value = data
        this.qr_scanner.active = null
        this.exitFullScreen()
        this.checkinput_pay()
      },
      set_payable_filter (status = false) {
        this.filter_result.paid = status
        this.fetch_payables()
      },
      submit_date_range () {
        let range = ''
        if (typeof this.filter_result.date_range === 'object') {
          let dateRange = this.filter_result.date_range
          range = {
            from: this.format_date_db(dateRange[0]),
            upto: this.format_date_db(dateRange[1])
          }
        }
        this.fetch_payables(range)
      },
      submit_search (keyword) {
        if (typeof keyword === 'string') {
          this.filter_result.keyword = keyword
        } else {
          this.filter_result.keyword = ''
        }
        this.fetch_payables()
      },
      submit_pay () {
        let _self = this.modals.pay
        this.checkinput_pay()
        if (_self.input_valid) {
          _self.loading = true
          let data = {
            id: _self.id,
            user_id: _self.user_id,
            amount: _self.amount,
            ref: _self.txn_hash.value
          }
          this.$http.post('transactions/pay', data).then(response => {
            _self.loading = false
            _self.active = false
            this.$noty.success('Payment success.')
            this.fetch_stats()
          }).catch(response => {
            _self.loading = false
            try {
              this.$noty.error(response.body.error.message)
            } catch (e) {
              this.$noty.error('Unknown error has occured')
              console.log(e)
            }
          })
        }
      }
    },
    components: { PageLoader, PanelPaginator, BusyPanel, DatePicker, QRCodeScanner, SearchBox }
  }
</script>

<style scoped>
  .address-placeholder {
    font-size: 12.5px;
    border-style: none;
    background-color: transparent;
    width: 100%;
    text-overflow: ellipsis;
  }
  .dropdown li:hover .fa {
    color: #000 !important;
    font-weight: bold;
  }
  .stats .column {
    flex: 1;
  }
  .stats table {
    width: 100%;
  }
  .icon-cell {
    width: 6rem;
  }
  .value-cell>div:first-child {
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 5px;
  }
  .value-cell>div:last-child {
    font-size: 1.5rem;
  }
  .stats .card-box a {
    color: white;
  }
  .stats-icon {
    width: 6rem;
    height: 6rem;
    line-height: 6rem;
    text-align: center;
    color: white;
    font-size: 3.5rem;
    margin: -5px -9px;
  }
  @media (max-width: 420px) {
    #table_account_payables th:nth-child(3),
    #table_account_payables td:nth-child(3),
    #table_account_payables th:nth-child(4),
    #table_account_payables td:nth-child(4) {
      display: none;
    }
  }
</style>