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
                      <div>{{stats.total_safes}}</div>
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
                      <div>{{stats.total_referrals}}</div>
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
                      <div class="stats-icon">
                        <i class="fa fa-diamond"></i>
                      </div>
                    </td>
                    <td class="value-cell">
                      <div>Earnings</div>
                      <div>
                        {{stats.total_rewards}} kta
                        <button class="button is-gradient mini" :disabled="stats.total_rewards==0" title="Withdraw to wallet."
                        @click="invoke_withdraw()">
                          <i class="fa fa-arrow-circle-right"></i>
                        </button>
                      </div>
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
                        <template v-if="item.type=='dr'">
                          <a :href="'https://etherscan.io/tx/'+item.ref" target="_blank"
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
      <div class="modal-card animated" style="max-width:350px">
        <header class="modal-card-head">
          <p class="modal-card-title">Withdraw Funds</p>
          <button class="delete is-danger" :disabled="modals.withdraw.loading" @click="modals.withdraw.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              <div class="info-text">Enter amount:</div>
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
  </div>
</template>

<script>
  import PageLoader from '@/components/etc/PageLoaderArcs'
  import BusyPanel from '@/components/containers/BusyPanel'
  import DatePicker from '@/components/etc/datepicker'
  import PanelPaginator from '@/components/containers/PanelPaginator'
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
              placeholder: '0.0001'
            }
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
    methods: {
      submit_cancel_withdrawal (confirm) {
        confirm.loading = true
        this.$http.post('transactions/cancel', {id: confirm.data}).then(response => {
          confirm.loading = false
          confirm.active = false
          this.fetch_stats()
        }).catch(response => {
          confirm.loading = false
          try {
            this.$noty.error(response.body.error.message)
          } catch (e) {
            this.$noty.error('Unknown error has occured')
            console.log(e)
          }
        })
      },
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
        console.log(data)
      },
      number_only (evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode
        if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
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
        } else if (parseFloat(_self.field.value) < 0.0001) {
          _self.field.error = 'amount is too small'
          errors++
        } else if (parseFloat(_self.field.value) > parseFloat(this.stats.total_rewards)) {
          _self.field.error = 'amount exceeds your balance'
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
        let path = 'transactions/account'
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
      submit_withdraw () {
        let _self = this.modals.withdraw
        if (_self.input_valid) {
          _self.loading = true
          this.$http.post('transactions/withdraw', {amount: _self.field.value}).then(response => {
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
        } else {
          translation = 'unknown'
        }
        return translation
      },
      truncate_decimal (amount) {
        return Number(amount).toFixed(this.kta_precision)
      }
    },
    components: { PageLoader, PanelPaginator, BusyPanel, DatePicker }
  }
</script>

<style scoped>
  .button.mini {
    padding: 0px !important;
    width: 25px;
    height: 25px;
    line-height: 25px;
    vertical-align: middle;
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
    margin-bottom: 5px;
  }
  .value-cell>div:last-child {
    font-size: 1.5rem;
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