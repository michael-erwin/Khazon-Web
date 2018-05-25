<template>
  <div>
    <div class="container">
      <PageLoader class="page-loader" v-if="auth===null" color="dark"></PageLoader>
      <div class="stats columns summary is-marginless">
        <div v-if="auth" class="column">
          <BusyPanel class="card-box blue" :class="{busy:stats_loading}">
            <div class="panel-block">
              <table>
                <tbody>
                  <tr>
                    <td class="icon-cell">
                      <div class="stats-icon">
                        <i class="fa fa-trophy"></i>
                      </div>
                    </td>
                    <td class="value-cell">
                      <div>Safe Level</div>
                      <div class="value">{{stats.total_safes}}</div>
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
                      <div class="stats-icon">
                        <i class="fa fa-user-plus"></i>
                      </div>
                    </td>
                    <td class="value-cell">
                      <div>Referrals</div>
                      <div class="value">{{stats.total_referrals}}</div>
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
              <div class="panel-block-menu">
                <a class="button" tabindex="1">
                  <i class="fa fa-ellipsis-v"></i>
                </a>
                <ul class="dropdown earnings-dropdown">
                  <li class="transfer" @mousedown="invoke_transfer()">
                    <!-- <i class="fa fa-caret-right"></i> -->
                    Transfer funds
                  </li>
                  <li class="receive" @mousedown="invoke_receive()">
                    <!-- <i class="fa fa-caret-right"></i> -->
                    Receive funds
                  </li>
                  <li class="withdraw" @mousedown="invoke_withdraw()">
                    <!-- <i class="fa fa-caret-right"></i> -->
                    Withdraw funds
                  </li>
                </ul>
              </div>
              <table>
                <tbody>
                  <tr>
                    <td class="icon-cell">
                      <div class="stats-icon">
                        <i class="fa fa-diamond"></i>
                      </div>
                    </td>
                    <td class="value-cell">
                      <div>Earnings</div>
                      <div class="value">
                        {{stats.total_rewards}} kta
                        <!-- <button class="button is-gradient mini" :disabled="stats.total_rewards==0" title="Withdraw to wallet."
                        @click="invoke_withdraw()">
                          <i class="fa fa-arrow-circle-right"></i>
                        </button> -->
                      </div>
                      <table class="card-buttons">
                        <tr>
                          <td>
                            <button class="button is-gradient mini" 
                            title="Transfer" @click="invoke_transfer()">
                            <div class="button-icon transfer"></div>
                            </button>
                          </td>
                          <td>
                            <button class="button is-gradient mini" 
                            title="Receive" @click="invoke_receive()">
                            <div class="button-icon receive"></div>
                            </button>
                          </td>
                          <td>
                            <button class="button is-gradient mini"
                            title="Withdraw" @click="invoke_withdraw()">
                            <div class="button-icon withdraw"></div>
                            </button>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BusyPanel>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="stats columns is-marginless">
        <div v-if="auth" class="column">
          <BusyPanel :class="{busy:activity_loading}">
            <div class="panel-heading">
              <b>Tx History</b>
              <div class="panel-heading-right is-pulled-right">
                <date-picker v-model="date_range" lang="en" range format="yyyy-MM-dd"
                 :shortcuts="date_presets" confirm @confirm="fetch_activities()"
                ></date-picker>&nbsp;
                <div class="panel-heading-menu">
                  <a class="button" tabindex="1" title="Filter result">
                    <i class="fa fa-filter"></i>
                  </a>
                  <ul class="dropdown animated">
                    <li @mousedown="change_code('ref_1')">
                      <i v-if="filter_result.code=='ref_1'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Ref lvl. 1
                    </li>
                    <li @mousedown="change_code('ref_2')">
                      <i v-if="filter_result.code=='ref_2'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Ref lvl. 2
                    </li>
                    <li @mousedown="change_code('ref_3')">
                      <i v-if="filter_result.code=='ref_3'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Ref lvl. 3
                    </li>
                    <li @mousedown="change_code('safe')">
                      <i v-if="filter_result.code=='safe'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Safe completed
                    </li>
                    <li @mousedown="change_code('transfer')">
                      <i v-if="filter_result.code=='transfer'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Fund transfer
                    </li>
                    <li @mousedown="change_code('withdraw')">
                      <i v-if="filter_result.code=='withdraw'" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      Fund withdrawal
                    </li>
                    <li @mousedown="change_code('')">
                      <i v-if="filter_result.code==''" class="fa fa-dot-circle-o"></i>
                      <i v-else class="fa fa-circle-o"></i>
                      All
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="panel-block">
              <table id="tx_table" v-if="activities.length > 0" class="table is-hoverable is-narrow is-striped is-fullwidth is-bordered-inside" style="margin-bottom:0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>                    
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in activities">
                    <td>{{translate_code(item.code)}}</td>
                    <td class="kta" :class="{debit:item.type==='dr'}">{{truncate_decimal(item.kta_amt)}} kta</td>
                    <td>
                      <template v-if="item.complete">
                        <template v-if="item.type=='dr' && item.code=='withdraw'">
                          <a :href="'https://etherscan.io/tx/'+item.ref" target="_blank"
                            title="Click to see receipt"
                          >completed</a>
                        </template>
                        <template v-else-if="item.code=='transfer'">
                          <a :href="'transactions/'+item.id" target="_blank"
                            title="Click to see receipt"
                          >completed</a>
                        </template>
                        <template v-else>
                          completed
                        </template>
                      </template>
                      <template v-else>
                        pending
                        <button v-if="item.type==='dr' && item.complete==0" class="button is-gradient is-small"
                        @click="confirm('Do you want to cancel existing withdrawal request?','submit_cancel_withdrawal',item.id)"
                      >Cancel</button>
                      </template>
                    </td>
                    <td>{{format_date_str(item.created_at)}}</td>
                    <td>{{format_date_str(item.updated_at)}}</td>                    
                  </tr>
                </tbody>
              </table>
              <div v-else>Data is empty</div>
            </div>
            <div v-if="activities.length > 0" class="panel-block block-footer">
              <PanelPaginator v-on:refresh="fetch_activities()"></PanelPaginator>
            </div>
          </BusyPanel>
        </div>
      </div>
    </div>
    <div class="modal" :class="{'is-active':modals.withdraw.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated" style="max-width:540px">
        <header class="modal-card-head">
          <p class="modal-card-title">Withdraw Funds</p>
          <button class="delete is-danger" :disabled="modals.withdraw.loading" @click="modals.withdraw.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              <div class="info-text">Withdraw to your wallet</div>
              <div>
                <form @submit.prevent="submit_withdraw()" novalidate>
                  <div class="field has-addons">
                    <p class="control has-icons-left has-icons-right" style="width: 100%">
                      <input class="input" ref="withdraw_focus" type="text"
                        :class="{'is-danger':modals.withdraw.field.error.length>0}"
                        :placeholder="modals.withdraw.field.placeholder"
                        :disabled="modals.withdraw.loading"
                        v-model="modals.withdraw.field.value"
                        @keyup="checkinput_withdraw()"
                        @keydown="number_only($event)"
                        @paste="checkinput_withdraw()"
                        @cut="checkinput_withdraw()"
                         />
                      <span class="icon is-small is-left">
                        <i class="fa fa-money"></i>
                      </span>
                      <span class="icon is-small is-right" :class="{'is-hidden':modals.withdraw.field.error.length===0}">
                        <i class="fa fa-warning"></i>
                      </span>
                    </p>
                    <p class="control">
                      <a class="button is-static">
                        kta
                      </a>
                    </p>
                    <p class="help is-danger" :class="{'is-active':modals.withdraw.field.error.length>0}">{{modals.withdraw.field.error}}</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" :class="{'is-loading':modals.withdraw.loading}"
            :disabled="!modals.withdraw.input_valid || modals.withdraw.loading"
            @click="submit_withdraw()">Ok</button>
          <button class="button is-gradient" @click="modals.withdraw.active=false" :disabled="modals.withdraw.loading">Cancel</button>
        </footer>
      </div>
    </div>
    <div class="modal" :class="{'is-active':modals.transfer.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated" style="max-width:540px">
        <header class="modal-card-head">
          <p class="modal-card-title">Transfer Funds</p>
          <button class="delete is-danger" :disabled="modals.transfer.loading" @click="modals.transfer.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              <div class="info-text">Transfer to another account</div>
              <div>
                <form @submit.prevent="submit_transfer()" novalidate>
                  <div class="field has-addons">
                    <p class="control has-icons-left has-icons-right" style="width: 100%">
                      <input class="input" ref="transfer_focus" type="text"
                        :class="{'is-danger':modals.transfer.fields.amount.error.length>0}"
                        :placeholder="modals.transfer.fields.amount.placeholder"
                        :disabled="modals.transfer.loading"
                        v-model="modals.transfer.fields.amount.value"
                        @keyup="checkinput_transfer()"
                        @keydown="number_only($event)"
                        @paste="checkinput_transfer()"
                        @cut="checkinput_transfer()"
                         />
                      <span class="icon is-small is-left">
                        <i class="fa fa-money"></i>
                      </span>
                      <span class="icon is-small is-right" 
                        :class="{'is-hidden':modals.transfer.fields.amount.error.length===0}">
                        <i class="fa fa-warning"></i>
                      </span>
                    </p>
                    <p class="control">
                      <a class="button is-static" style="width:43.16px">
                        <span>kta</span>
                      </a>
                    </p>
                    <p class="help is-danger" :class="{'is-active':modals.transfer.fields.amount.error.length>0}">
                      {{modals.transfer.fields.amount.error}}
                    </p>
                  </div>
                  <div class="field has-addons">
                    <p class="control has-icons-left has-icons-right" style="width: 100%">
                      <input class="input" type="text"
                        :class="{'is-danger':modals.transfer.fields.address.error.length>0}"
                        :placeholder="modals.transfer.fields.address.placeholder"
                        :disabled="modals.transfer.loading"
                        v-model="modals.transfer.fields.address.value"
                        @keyup="checkinput_transfer()"
                        @paste="checkinput_transfer()"
                        @cut="checkinput_transfer()"
                         />
                      <span class="icon is-small is-left">
                        <i class="fa fa-address-card-o"></i>
                      </span>
                      <span class="icon is-small is-right" 
                        :class="{'is-hidden':modals.transfer.fields.address.error.length===0}">
                        <i class="fa fa-warning"></i>
                      </span>
                    </p>
                    <p class="control">
                      <a class="button" @click="scan_qr('transfer.address')" title="Scan QR code">
                        <i class="fa fa-camera"></i>
                      </a>
                    </p>
                    <p class="help is-danger" :class="{'is-active':modals.transfer.fields.address.error.length>0}">
                      {{modals.transfer.fields.address.error}}
                    </p>
                  </div>
                  <div v-show="modals.transfer.error.length>0">
                    <div class="notification is-danger animated shake">
                      {{modals.transfer.error}}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" :class="{'is-loading':modals.transfer.loading}"
            :disabled="!modals.transfer.input_valid || modals.transfer.loading"
            @click="submit_transfer()">Ok</button>
          <button class="button is-gradient" @click="modals.transfer.active=false" :disabled="modals.transfer.loading">Cancel</button>
        </footer>
      </div>
    </div>
    <div class="modal" :class="{'is-active':modals.confirm.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated" style="max-width:430px">
        <header class="modal-card-head">
          <p class="modal-card-title">Confirm</p>
          <button class="delete is-danger" :disabled="modals.confirm.loading" @click="modals.confirm.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              {{modals.confirm.message}}
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" :class="{'is-loading':modals.confirm.loading}"
            :disabled="modals.confirm.loading"
            @click="submit_confirm()">Yes</button>
          <button class="button is-gradient" @click="modals.confirm.active=false" :disabled="modals.confirm.loading">Cancel</button>
        </footer>
      </div>
    </div>
    <div ref="qr_scanner">
      <QRCodeScanner :active="qr_scanner.active" @decoded="scan_done" @canceled="scan_cancel" />
    </div>
    <div class="modal" :class="{'is-active':modals.qr.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated" style="max-width:330px">
        <header class="modal-card-head">
          <p class="modal-card-title">Receive Funds</p>
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
  import PageLoader from '@/components/etc/PageLoaderArcs'
  import BusyPanel from '@/components/containers/BusyPanel'
  import DatePicker from '@/components/etc/datepicker'
  import { FullScreenCtl, Qr } from '@/mixins/Utilities.js'
  import PanelPaginator from '@/components/containers/PanelPaginator'
  import QRCodeScanner from '@/components/etc/QRCodeScanner'

  export default {
    beforeCreate () {
      if (localStorage.access_token === undefined) {
        this.$router.push('/signout')
      }
    },
    beforeMount () {
      this.$store.commit('resetValues')
      this.fetch_stats()
    },
    data () {
      return {
        auth: null,
        date_range: '',
        stats_loading: false,
        activity_loading: false,
        filter_result: {
          code: ''
        },
        kta_precision: 2,
        qr_scanner: {
          active: null,
          field: null
        },
        stats: {
          total_safes: 0,
          total_referrals: 0,
          total_rewards: 0.00
        },
        modals: {
          withdraw: {
            active: false,
            loading: false,
            input_valid: false,
            field: {
              value: '',
              error: '',
              placeholder: 'amount',
              regex: /^\d+(\.\d+)?$/
            }
          },
          transfer: {
            active: false,
            loading: false,
            input_valid: false,
            fields: {
              amount: {
                value: '',
                error: '',
                placeholder: 'amount',
                regex: /^\d+(\.\d+)?$/
              },
              address: {
                value: '',
                error: '',
                placeholder: 'to address'
              }
            },
            error: ''
          },
          confirm: {
            active: false,
            loading: false,
            message: '',
            data: {},
            fn: false
          }
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
      activities () {
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
    mixins: [FullScreenCtl, Qr],
    methods: {
      change_code (type) {
        if (this.filter_result.code !== type) {
          this.filter_result.code = type
          this.fetch_activities()
        }
      },
      confirm (message = '', fn = false, data = {}) {
        let _self = this.modals.confirm
        _self.message = message
        if (fn) _self.fn = fn
        _self.data = data
        _self.active = true
      },
      number_only (evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode
        if ((charCode < 48 || charCode > 57) && (charCode < 96 || charCode > 105) && charCode !== 190 && charCode !== 110 && charCode !== 8) {
          evt.preventDefault()
        } else {
          return true
        }
      },
      checkinput_withdraw () {
        let _self = this.modals.withdraw
        let errors = 0
        if (_self.field.value === '') {
          _self.field.error = ''
          errors++
        } else if (!_self.field.regex.test(_self.field.value)) {
          _self.field.error = 'invalid format'
          errors++
        } else if (parseFloat(_self.field.value) < 0.0001) {
          _self.field.error = 'below minimum'
          errors++
        } else if (parseFloat(_self.field.value) > parseFloat(this.stats.total_rewards)) {
          _self.field.error = 'exceeded your balance'
          errors++
        } else {
          _self.field.error = ''
        }
        if (errors === 0) {
          _self.input_valid = true
        } else {
          _self.input_valid = false
        }
      },
      checkinput_transfer () {
        let _self = this.modals.transfer
        let errors = 0
        // Validate kta amount
        if (_self.fields.amount.value === '') {
          _self.fields.amount.error = ''
          errors++
        } else if (!_self.fields.amount.regex.test(_self.fields.amount.value)) {
          _self.fields.amount.error = 'invalid format'
          errors++
        } else if (parseFloat(_self.fields.amount.value) < 0.0001) {
          _self.fields.amount.error = 'below minimum'
          errors++
        } else if (parseFloat(_self.fields.amount.value) > parseFloat(this.stats.total_rewards)) {
          _self.fields.amount.error = 'exceeded your balance'
          errors++
        } else {
          _self.fields.amount.error = ''
        }
        // Validate Eth address
        let regexEthAddr = /^0x[0-9a-f]{40}$/i
        if (_self.fields.address.value.length > 0) {
          if (!regexEthAddr.test(_self.fields.address.value)) {
            _self.fields.address.error = 'Format is invalid'
            errors++
          } else { _self.fields.address.error = '' }
        } else {
          _self.fields.address.error = ''
          errors++
        }
        // Finalize
        _self.error = ''
        if (errors === 0) {
          _self.input_valid = true
        } else {
          _self.input_valid = false
        }
      },
      fetch_stats () {
        let path = 'stats/user'
        this.stats_loading = true
        this.$http.get(path).then((response) => {
          this.stats_loading = false
          let data = response.body
          this.stats = {
            total_safes: data.total_safes,
            total_referrals: data.total_referrals,
            total_rewards: data.total_rewards ? this.truncate_decimal(data.total_rewards) : this.truncate_decimal(0)
          }
          this.fetch_activities()
        }).catch((response) => {
          if (response.status === 403) {
            this.auth = false
          } else if (response.status === 423) {
            this.$router.push('/signin/verify')
          } else {
            this.$router.push('/signout')
          }
        })
      },
      fetch_activities () {
        let path = 'transactions/my_account/items'
        this.activity_loading = true
        let options = {
          params: {
            per_page: this.page_limit,
            page: this.page_number
          }
        }
        if (this.filter_result.code.length > 0) options.params.code = this.filter_result.code
        if (typeof this.date_range === 'object') {
          let dateFrom = this.format_date_db(this.date_range[0])
          let dateUpto = this.format_date_db(this.date_range[1])
          options.params.date_from = dateFrom
          options.params.date_to = dateUpto
        }
        this.$http.get(path, options).then((response) => {
          this.auth = true
          this.activity_loading = false
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
            this.activity_loading = false
          }
        })
      },
      format_date_db (dateObj) {
        let yyyy = dateObj.getFullYear()
        let mm = dateObj.getMonth() + 1; mm = String(mm).length === 1 ? '0' + mm : mm
        let dd = String(dateObj.getDate()).length === 1 ? '0' + dateObj.getDate() : dateObj.getDate()
        return yyyy + '-' + mm + '-' + dd
      },
      format_date_str (dateStr) {
        return dateStr.match(/\d{4}-\d{2}-\d{2}/)[0]
      },
      invoke_withdraw () {
        let _self = this.modals.withdraw
        _self.field.value = ''
        _self.active = true
        this.checkinput_withdraw()
      },
      invoke_transfer () {
        let _self = this.modals.transfer
        _self.fields.amount.value = ''
        _self.fields.address.value = ''
        _self.active = true
        this.checkinput_transfer()
      },
      invoke_receive () {
        let userData = JSON.parse(localStorage.user_data)
        this.modals.qr.value = userData.address
        this.modals.qr.active = true
      },
      scan_qr (field) {
        this.qr_scanner.active = true
        this.qr_scanner.field = field
        if (window.innerWidth < 768) this.makeFullScreen(this.$refs.qr_scanner)
      },
      scan_cancel () {
        this.qr_scanner.active = null
        this.qr_scanner.field = null
        this.exitFullScreen()
      },
      scan_done (data) {
        if (this.qr_scanner.field === 'transfer.address') {
          this.modals.transfer.fields.address.value = data
          this.checkinput_transfer()
        }
        this.qr_scanner.active = null
        this.exitFullScreen()
      },
      submit_cancel_withdrawal (confirm) {
        confirm.loading = true
        let url = 'transactions/my_account/items/' + confirm.data
        this.$http.delete(url).then(response => {
          confirm.loading = false
          confirm.active = false
          this.fetch_stats()
        }).catch(response => {
          confirm.loading = false
          confirm.active = false
          try {
            this.$noty.error(response.body.error.message)
          } catch (e) {
            this.$noty.error('Unknown error has occured')
            console.log(e)
          }
        })
      },
      submit_withdraw () {
        let _self = this.modals.withdraw
        if (_self.input_valid) {
          _self.loading = true
          this.$http.post('transactions/my_account/withdraw', {amount: _self.field.value}).then(response => {
            _self.loading = false
            _self.active = false
            this.fetch_stats()
          }).catch(response => {
            _self.loading = false
            try {
              _self.field.error = response.body.error.data.amount[0]
            } catch (e) {
              this.$noty.error('Unknown error has occured')
              console.log(e)
            }
          })
        }
      },
      submit_transfer () {
        let _self = this.modals.transfer
        let url = 'transactions/my_account/transfer'
        let params = {
          amount: _self.fields.amount.value,
          address: _self.fields.address.value
        }
        if (_self.input_valid) {
          _self.loading = true
          this.$http.post(url, params).then(response => {
            _self.loading = false
            _self.active = false
            this.$noty.success('Fund transfer success')
            this.fetch_stats()
          }).catch(response => {
            _self.loading = false
            try {
              if (typeof response.body.error === 'object') {
                if (typeof response.body.error.data !== 'undefined') {
                  let errorData = response.body.error.data
                  let fieldErrors = Object.keys(errorData)
                  if (fieldErrors.length > 0) {
                    for (let i in fieldErrors) _self.fields[fieldErrors[i]].error = errorData[fieldErrors[i]][0]
                  } else {
                    _self.error = response.body.error.message
                  }
                } else {
                  _self.error = response.body.error.message
                }
              } else {
                this.$noty.error('Unknown error has occured')
              }
            } catch (e) {
              this.$noty.error('Unknown error has occured')
              console.log(e)
            }
          })
        }
      },
      submit_confirm () {
        let _self = this.modals.confirm
        if (typeof _self.fn === 'function') {
          _self.fn(_self)
        } else if (typeof _self.fn === 'string') {
          this[_self.fn](_self)
        } else {
          _self.fn = false
          _self.loading = false
          _self.active = false
        }
      },
      translate_code (code) {
        let translation = ''
        if (code === 'safe') {
          translation = 'safe completed'
        } else if (code === 'ref_1') {
          translation = 'referral lvl. 1'
        } else if (code === 'ref_2') {
          translation = 'referral lvl. 2'
        } else if (code === 'ref_3') {
          translation = 'referral lvl. 3'
        } else if (code === 'withdraw') {
          translation = 'fund withdrawal'
        } else if (code === 'transfer') {
          translation = 'fund transfer'
        } else {
          translation = 'unknown'
        }
        return translation
      },
      truncate_decimal (amount) {
        return Number(amount).toFixed(this.kta_precision)
      }
    },
    components: { PageLoader, PanelPaginator, BusyPanel, DatePicker, Qr, QRCodeScanner }
  }
</script>

<style scoped>
  .button.mini {
    padding: 0px !important;
    width: 88%;
    height: 25px;
    line-height: 20px;
    vertical-align: middle;
    font-size: 15px;
  }
  .button-icon {
    width: 100%;
    height: 100%;
    background-size: 16px;
    background-position: center center;
    background-repeat: no-repeat;
    display: block;
    position:absolute; left: 0; top: 0;
  }
  .button-icon.transfer,
  .earnings-dropdown .transfer {
    background-image:url('/static/transfer.png');
  }
  .button-icon.receive,
  .earnings-dropdown .receive {
    background-image:url('/static/receive.png');
  }
  .button-icon.withdraw,
  .earnings-dropdown .withdraw {
    background-image:url('/static/withdraw.png');
  }
  .card-buttons td {
    vertical-align: bottom;
  }
  .earnings-dropdown li {
    padding-left: 30px !important;
    background-position: 8px center;
    background-repeat: no-repeat;
  }
  footer .button.is-gradient {
    min-width: 73px;
  }
  .info-text {
    margin-bottom: 15px;
    line-height: 1;
  }
  .kta { color: #093; }
  .kta:before { content: '+'; }
  .kta.debit { color: #F21; }
  .kta.debit:before { content: '-'; }
  .stats .column { flex: 1; }
  .stats table { width: 100%; }
  .icon-cell { width: 6rem; }
  .value-cell>div:first-child {
    font-size: 1.2rem;
    font-weight: 500;
  }
  table.card-buttons td {
    text-align: center;
  }
  table.card-buttons td:first-child {
    text-align: left;
  }
  table.card-buttons td:last-child {
    text-align: right;
  }
  .value {
    font-size: 1.3rem;
  }
  .notification {
    padding: 8px 15px;
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
  /* Mobile Responsiveness */
  @media(max-width: 768px) {
    .stats {
      margin-left: 15px;
      margin-right: 15px;
    }
    #tx_table td:nth-child(3),
    #tx_table th:nth-child(3) {
      border-right-style: none;
    }
    #tx_table td:nth-child(4),
    #tx_table th:nth-child(4),
    #tx_table td:nth-child(5),
    #tx_table th:nth-child(5) {
      display: none;
    }
  }
</style>