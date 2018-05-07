<template>
  <div>
    <div slot="content" class="container">
      <PageLoader class="page-loader" v-if="auth===null" color="dark"></PageLoader>
      <div class="columns is-marginless">
        <div v-if="auth" class="column">
          <BusyPanel :class="{busy:loading}">
            <div class="panel-heading is-clearfix">
              <b>Referrals</b>
              <div class="panel-heading-right is-pulled-right">
                <date-picker v-show="filter_result.type=='date_range'" v-model="filter_result.date_range" lang="en" range format="yyyy-MM-dd"
                 :shortcuts="date_presets" confirm @confirm="submit_date_range"></date-picker>
                <SearchBox v-show="filter_result.type=='search'" style="width:190px" @submit="submit_search" @cleared="submit_search" />&nbsp;
                <div class="panel-heading-menu">
                  <a class="button" tabindex="1" title="Filter result">
                    <i class="fa fa-filter"></i>
                  </a>
                  <ul class="dropdown animated">
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
                  </ul>
                </div>
              </div>
            </div>
            <div class="panel-block">
              <table id="referrals_table" v-if="items.length > 0" class="table is-hoverable is-narrow is-striped is-bordered-inside is-fullwidth" style="margin-bottom:0">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Type</th><th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in items">
                    <td><a :href="'/user/' + item.address" target="_blank">{{item.name}}</a></td>
                    <td>{{item.email}}</td>
                    <td>{{get_type_text(item.type)}}</td>
                    <td>{{format_date_str(item.created_at)}}</td>
                  </tr>
                </tbody>
              </table>
              <div v-else>No items.</div>
            </div>
            <div v-if="items.length > 0" class="panel-block block-footer">
              <PanelPaginator v-on:refresh="fetch()"></PanelPaginator>
            </div>
          </BusyPanel>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import PageLoader from '@/components/etc/PageLoaderArcs'
  import BusyPanel from '@/components/containers/BusyPanel'
  import DatePicker from '@/components/etc/datepicker'
  import PanelPaginator from '@/components/containers/PanelPaginator'
  import SearchBox from '@/components/etc/searchbox'
  export default {
    beforeCreate () {
      if (localStorage.access_token === undefined) {
        this.$router.push('/signout')
      }
    },
    beforeMount () {
      this.$store.commit('resetValues')
      this.fetch()
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
    data () {
      return {
        loading: false,
        auth: null,
        filter_result: {
          type: 'search',
          date_range: '',
          keyword: ''
        }
      }
    },
    methods: {
      fetch (input = false) {
        let path = 'referrals/user'
        let options = {
          params: {
            per_page: this.page_limit,
            page: this.page_number
          }
        }
        if (typeof this.filter_result.date_range === 'object') {
          let dateRange = this.filter_result.date_range
          options.params.date_from = this.format_date_db(dateRange[0])
          options.params.date_to = this.format_date_db(dateRange[1])
        }
        if (this.filter_result.keyword.length > 0) {
          options.params.search = this.filter_result.keyword
        }
        this.loading = true
        this.$http.get(path, options).then((response) => {
          let body = response.body
          let total = (body.total >= this.page_limit) ? Math.ceil(body.total / this.page_limit) : 1
          this.$store.commit('setPageData', body.data)
          this.$store.commit('setPageNumber', body.current_page)
          this.$store.commit('setPageTotal', total)
          this.auth = true
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
      format_date_str (dateStr) {
        return dateStr.match(/\d{4}-\d{2}-\d{2}/)[0]
      },
      format_date_db (dateObj) {
        let yyyy = dateObj.getFullYear()
        let mm = dateObj.getMonth() + 1; mm = String(mm).length === 1 ? '0' + mm : mm
        let dd = String(dateObj.getDate()).length === 1 ? '0' + dateObj.getDate() : dateObj.getDate()
        return yyyy + '-' + mm + '-' + dd
      },
      get_type_text (type) {
        switch (type) {
          case 'ref_1':
            type = 'referral lvl. 1'
            break
          case 'ref_2':
            type = 'referral lvl. 2'
            break
          case 'ref_3':
            type = 'referral lvl. 3'
            break
          default:
            type = 'unknown'
        }
        return type
      },
      submit_date_range () {
        this.fetch()
      },
      submit_search (keyword) {
        this.filter_result.keyword = keyword
        this.fetch()
      }
    },
    components: { DatePicker, PageLoader, PanelPaginator, BusyPanel, SearchBox }
  }
</script>

<style scoped>
  p.notice {
    padding: 5px;
    margin-bottom: 10px;
  }
  /* Mobile Responsiveness */
  @media(max-width: 768px) {
    #referrals_table td:nth-child(3),
    #referrals_table th:nth-child(3) {
      border-right-style: none;
    }
    #referrals_table td:nth-child(4),
    #referrals_table th:nth-child(4) {
      display: none;
    }
  }
  @media(max-width: 420px) {
    #referrals_table td:nth-child(2),
    #referrals_table th:nth-child(2) {
      display: none;
    }
  }
</style>