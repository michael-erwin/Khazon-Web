<template>
  <div>
    <div slot="content" class="container">
      <PageLoader class="page-loader" v-if="auth===null" color="dark"></PageLoader>
      <div class="columns is-marginless">
        <div v-if="auth" class="column">
          <BusyPanel :class="{busy:loading}">
            <div v-if="safe.current" class="panel-heading is-clearfix">
              <b>Safe Explorer</b>
              <div class="panel-heading-right is-pulled-right">
                <div class="field">
                  <div class="control">
                    <div class="select is-small">
                      <select @change="set_safe_level($event)">
                        <option value="0">Level 1</option>
                        <option value="1" :disabled="safe.all.length<2">Level 2</option>
                        <option value="2" :disabled="safe.all.length<3">Level 3</option>
                        <option value="3" :disabled="safe.all.length<4">Level 4</option>
                        <option value="4" :disabled="safe.all.length<5">Level 5</option>
                        <option value="5" :disabled="safe.all.length<6">Level 6</option>
                        <option value="6" :disabled="safe.all.length<7">Level 7</option>
                      </select>
                    </div>
                  </div>
                </div>&nbsp;
                <div v-if="safe.visited.length > 0 || is_safe_unlockable()" class="panel-heading-menu">
                  <a class="button" tabindex="1">
                    <i class="fa fa-ellipsis-v"></i>
                  </a>
                  <ul class="dropdown animated">
                    <li v-if="safe.visited.length > 0" @mousedown="goto_home_safe()">Got to home safe</li>
                    <li v-if="is_safe_unlockable()" @mousedown="open_cuk_prompt()">Unlock a chamber</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="panel-block block-footer">
              <div v-if="safe.current" style="position:relative;overflow:hidden">
                <table ref="safebox" class="matrix">
                  <tbody>
                    <tr>
                      <td position="llt" ref="llt" :guard="guard('llt')" :data-id="safe.current.llt?safe.current.llt.user_id:null"
                      :class="{hovered:safe.hovering=='lft'}"
                      @click="explore($event)">
                        {{guard_text('llt')}}
                      </td>
                      <td position="lmd" ref="lmd" :guard="guard('lmd')" :data-id="safe.current.lmd?safe.current.lmd.user_id:null"
                      :class="{hovered:safe.hovering=='lft'}"
                      @click="explore($event)">
                        {{guard_text('lmd')}}
                      </td>
                      <td position="rmd" ref="rmd" :guard="guard('rmd')" :data-id="safe.current.rmd?safe.current.rmd.user_id:null"
                      :class="{hovered:safe.hovering=='rgt'}"
                      @click="explore($event)">
                        {{guard_text('rmd')}}
                      </td>
                      <td position="rlt" ref="rlt" :guard="guard('rlt')" :data-id="safe.current.rlt?safe.current.rlt.user_id:null"
                      :class="{hovered:safe.hovering=='rgt'}"
                      @click="explore($event)">
                        {{guard_text('rlt')}}
                      </td>
                    </tr>
                    <tr>
                      <td position="lft" ref="lft" colspan="2" :guard="guard('lft')" :data-id="safe.current.lft?safe.current.lft.user_id:null"
                      @mouseover="hover_chamber($event)" @mouseout="safe.hovering=''"
                      @click="explore($event)">
                        {{guard_text('lft')}}
                      </td>
                      <td position="rgt" ref="rgt" colspan="2" :guard="guard('rgt')" :data-id="safe.current.rgt?safe.current.rgt.user_id:null"
                      @mouseover="hover_chamber($event)" @mouseout="safe.hovering=''"
                      @click="explore($event)">
                        {{guard_text('rgt')}}
                      </td>
                    </tr>
                    <tr>
                      <td position="bse" ref="bse" colspan="4" :guard="guard('bse', this)" @click="explore($event)" :data-id="safe.current.bse?safe.current.bse.id:null">
                        {{guard_text('bse')}}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div class="animator" ref="animator">
                  <table class="matrix">
                    <tbody>
                      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
                      <tr><td colspan="2">&nbsp;</td></tr>
                    </tbody>
                  </table>
                </div>
                <div ref="animator2" class="animator2" style="display:none;position:absolute">
                  <table class="matrix">
                    <tbody>
                      <tr>
                        <td guard="lock">...</td>
                        <td guard="lock">...</td>
                        <td guard="lock">...</td>
                        <td guard="lock">...</td>
                      </tr>
                      <tr>
                        <td guard="lock" colspan="2">...</td>
                        <td guard="lock" colspan="2">...</td>
                      </tr>
                      <tr>
                        <td guard="lock" colspan="4">...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-if="safe.current" style="padding:5px">
                <table class="table is-narrow is-bordered is-striped is-fullwidth" style="margin:0">
                  <tbody>
                    <tr>
                      <td>Email</td><td>{{this.safe.owner.email}}</td>
                    </tr>
                    <tr>
                      <td>Address</td>
                      <td>
                        <a :href="'/user/' + safe.owner.address" target="_blank">{{this.safe.owner.address}}</a>
                        <span class="qr-button" title="Click for QR code" @click="show_qr(safe.owner.address)">
                          <i class="fa fa-qrcode"></i>
                        </span>
                      </td>
                    </tr>
                    <!-- <tr>
                      <td>Guardian</td>
                      <td>
                        <a :href="'/user/' + safe.owner.upl_address" target="_blank">{{this.safe.owner.upl_address}}</a> 
                        <template v-if="this.safe.owner.upl_address">
                          <template v-if="this.safe.owner.upl_type == 'adjust'">
                            (<a :href="'/user/' + this.safe.owner.regref_id" title="Click for original upline referral" target="_blank">{{safe.owner.upl_type}}</a>)
                          </template>
                          <template v-else>
                            ({{this.safe.owner.upl_type}})
                          </template>
                          <span class="qr-button" title="Click for QR code" @click="show_qr(safe.owner.upl_address)">
                            <i class="fa fa-qrcode"></i>
                          </span>
                        </template>
                        <template v-else>(genesis)</template>
                      </td>
                    </tr>
                    <tr>
                      <td>Location</td><td>{{this.current_location.level}}.{{this.current_location.row}}.{{this.current_location.col}}</td>
                    </tr> -->
                  </tbody>
                </table>
              </div>
              <div v-if="safe.current" class="has-text-centered">
                <button class="button" title="Previous" :disabled="safe.visited.length==0" @click="go_down()"><i class="fa fa-arrow-down" aria-hidden="true"></i></button>
              </div>
              <div v-if="!safe.current" class="notification has-text-centered" style="width:100%">
                <h1 class="title">Notice</h1>
                <p>No associated safe found.</p>
              </div>
            </div>
          </BusyPanel>
        </div>
      </div>
    </div>
    <div slot="content" class="modal" :class="{'is-active':modal_cuk.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated" style="max-width:430px">
        <header class="modal-card-head">
          <p class="modal-card-title" @click="disableForm()">Prompt</p>
          <button class="delete is-danger" aria-label="close" @click="modal_cuk.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns" style="align-items:center">
            <div class="column" style="flex:1">CUK:</div>
            <div class="column" style="flex:8">
              <form id="chamber_unlock_form" @submit.prevent="unlock_chamber()">
                <div class="field">
                  <p class="control has-icons-left has-icons-right">
                    <input class="input" type="text" maxlength="29"
                      :placeholder="modal_cuk.placeholder"
                      :class="{'is-danger':fields.cuk.error.length>0}"
                      v-model="fields.cuk.value" @keyup="check_cuk_input()"
                      @paste="check_cuk_input()"
                      @cut="check_cuk_input()"
                      @keyup.enter="submit">
                    <span class="icon is-small is-left">
                      <i class="fa fa-key"></i>
                    </span>
                    <span class="icon is-small is-right" :class="{'is-hidden':fields.cuk.error.length===0}">
                      <i class="fa fa-warning"></i>
                    </span>
                  </p>
                  <p class="help is-danger" :class="{'is-active':fields.cuk.error.length>0}">{{fields.cuk.error}}</p>
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
          <button class="button is-gradient" :class="{'is-loading':modal_cuk.loading}" @click="unlock_chamber()" :disabled="!fields.cuk.valid">Unlock</button>
          <button class="button is-gradient" @click="modal_cuk.active=false">Cancel</button>
        </footer>
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
  import {Qr} from '@/mixins/Utilities.js'
  import {Form} from '@/mixins/Form.js'
  export default {
    mixins: [Form, Qr],
    beforeCreate () {
      if (localStorage.access_token === undefined) {
        this.$router.push('/signout')
      }
    },
    created () {
      let userdata = JSON.parse(localStorage.user_data)
      this.userdata = userdata
      this.safe.owner = userdata
    },
    beforeMount () {
      this.$store.commit('resetValues')
      let userId = this.$route.params.user_id
      if (/[0-9]+/.test(userId)) {
        this.fetch({user_id: userId})
      } else {
        this.fetch()
      }
    },
    data () {
      return {
        loading: false,
        auth: null,
        animatortext: '',
        animatoractive: false,
        fields: {
          cuk: {
            value: '',
            error: '',
            valid: false
          }
        },
        modal_cuk: {
          active: false,
          placeholder: '00000-00000-00000-00000-00000',
          loading: false
        },
        safe: {
          all: [],
          current: null,
          index: 0,
          baseIndex: null,
          owner: null,
          visited: [],
          hovering: ''
        },
        userdata: null,
        error_generic: ''
      }
    },
    computed: {
      current_location () {
        let parts = this.safe.current.location.split('.')
        return { level: parts[0], row: parts[1], col: parts[2] }
      }
    },
    methods: {
      fetch (item = null) {
        let path = item ? 'safes/user/' + item.user_id : 'safes/user'
        let animator = this.$refs.animator
        this.loading = true
        this.$http.get(path).then((response) => {
          let safes = response.body
          this.auth = true
          this.safe.all = safes
          if (item) {
            if (item.user) {
              this.safe.owner = item.user
              this.safe.visited.push(item)
            }
          } else {
            this.safe.owner = this.userdata
          }
          this.safe.current = safes[this.safe.index]
          this.loading = false
          if (typeof animator !== 'undefined') animator.style.display = 'none'
        }).catch((response) => {
          if (response.status === 403) {
            this.auth = false
          } else {
            this.$router.push('/signout')
            this.loading = false
            if (typeof animator !== 'undefined') animator.style.display = 'none'
          }
        })
      },
      guard_text (placement) {
        let statusName = 'locked'
        if (this.safe.current[placement] === null) {
          statusName = 'locked'
        } else {
          if (this.safe.current[placement].user_id === this.userdata.id) {
            statusName = 'me'
          } else {
            statusName = 'unknown'
            if (this.safe.current[placement]) {
              if (this.safe.current[placement].user) statusName = this.safe.current[placement].user.name
            }
          }
        }
        return statusName
      },
      guard (placement, obj = null) {
        let statusName = 'unknown'
        if (this.safe.current[placement] === null) {
          statusName = 'lock'
        } else {
          if (this.safe.current[placement].unlock_method === 'cuk') {
            statusName = 'cuked'
          } else if (placement === 'bse' || this.safe.current[placement].user_id === this.safe.current.bse.user_id) {
            statusName = 'self'
          } else {
            statusName = 'other'
          }
        }
        return statusName
      },
      hover_chamber (event) {
        let position = event.target.getAttribute('position')
        if (this.guard(position) === 'other') this.safe.hovering = position
      },
      explore (event) {
        /* Animation Logic */
        let $target = event.target
        let guard = $target.getAttribute('guard')
        let safebox = this.$refs.safebox
        let animator = this.$refs.animator
        if (guard === 'other') {
          let position = $target.getAttribute('position')
          let toFullSize = { left: '0px', top: '0px', width: safebox.offsetWidth + 'px', height: safebox.offsetHeight + 'px' }
          // Reset animator object to initial size & position
          if (position === 'lft' || position === 'rgt') {
            let child = this.$refs[position]
            let grand = position === 'lft' ? this.$refs.llt : this.$refs.rlt
            animator.style.top = grand.offsetTop + 'px'
            animator.style.left = child.offsetLeft + 'px'
            animator.style.width = child.offsetWidth + 'px'
            animator.style.height = (child.offsetHeight + grand.offsetHeight + 5) + 'px'
          } else {
            let grand = this.$refs[position]
            animator.style.top = grand.offsetTop + 'px'
            animator.style.left = grand.offsetLeft + 'px'
            animator.style.width = grand.offsetWidth + 'px'
            animator.style.height = grand.offsetHeight + 'px'
          }
          this.animatortext = $target.innerHTML
          animator.style.display = 'block'
          // Get specs for center positioning
          let toCenterMiddle = { left: ((safebox.offsetWidth - animator.offsetWidth) / 2) + 'px', top: ((safebox.offsetHeight - animator.offsetHeight) / 2) + 'px' }
          // Apply animation
          this.$animate(animator, toCenterMiddle, {duration: 300, easing: 'ease-in'}).then(() => {
            this.$animate(animator, toFullSize, {duration: 300, easing: 'ease-out'}).then(() => {
              this.loading = true
              // Retrieve data
              let userClone = Object.assign({ position: position, index: 'unknown' }, this.safe.current[position])
              this.fetch(userClone)
            })
          })
        }
      },
      go_down () {
        if (this.safe.visited.length > 0) {
          let current = this.safe.visited.pop()
          /* Animation Logic */
          let animator = this.$refs.animator
          let safebox = this.$refs.safebox
          // Reset animator to initial state
          animator.style.left = '0px'
          animator.style.top = '0px'
          animator.style.width = safebox.offsetWidth + 'px'
          animator.style.height = safebox.offsetHeight + 'px'
          animator.style.display = 'block'
          // Get correct restoration state specs
          let toRestoredSize = {}
          let toRestoredPosition = {}
          if (current.position === 'lft' || current.position === 'rgt') {
            let child = this.$refs[current.position]
            let grand = current.position === 'lft' ? this.$refs.llt : this.$refs.rlt
            toRestoredSize = { width: child.offsetWidth + 'px', height: (child.offsetHeight + grand.offsetHeight + 5) + 'px' }
            toRestoredPosition = { top: grand.offsetTop + 'px', left: child.offsetLeft + 'px' }
          } else {
            let grand = this.$refs[current.position]
            toRestoredSize = { width: grand.offsetWidth + 'px', height: grand.offsetHeight + 'px' }
            toRestoredPosition = { top: grand.offsetTop + 'px', left: grand.offsetLeft + 'px' }
          }
          // Get specs for center positioning
          toRestoredSize.left = ((safebox.offsetWidth - toRestoredSize.width.replace('px', '')) / 2) + 'px'
          toRestoredSize.top = ((safebox.offsetHeight - toRestoredSize.height.replace('px', '')) / 2) + 'px'
          // Animate the animator
          this.$animate(animator, toRestoredSize, {duration: 300, easing: 'ease-in'}).then(() => {
            this.$animate(animator, toRestoredPosition, {duration: 300, easing: 'ease-in'}).then(() => {
              // Retreive data
              if (this.safe.visited.length > 0) {
                let backFor = this.safe.visited.pop()
                this.fetch(backFor)
              } else {
                this.fetch()
              }
            })
          })
        }
      },
      goto_home_safe () {
        if (this.safe.visited.length > 0) {
          this.safe.visited = []
          this.fetch()
        }
      },
      swap_safe (safeIndex) {
        let safebox = this.$refs.safebox
        let animator = this.$refs.animator2
        let direction = 'up'
        function slideTop () {
          animator.style.top = '100%'
          safebox.style.transform = 'translateY(0%)'
          this.$animate(animator, {top: '0px'}, {duration: 500, easing: 'ease'}).then(() => {
            animator.style.display = 'none'
          })
          this.$animate(safebox, {translateY: '-100%'}, {duration: 500, easing: 'ease'}).then(() => {
            safebox.style.transform = 'none'
            applyChange.call(this)
          })
        }
        function slideDown () {
          animator.style.top = '-100%'
          safebox.style.transform = 'translateY(0%)'
          this.$animate(animator, {top: '0px'}, {duration: 500, easing: 'ease'}).then(() => {
            animator.style.display = 'none'
          })
          this.$animate(safebox, {translateY: '100%'}, {duration: 500, easing: 'ease'}).then(() => {
            safebox.style.transform = 'none'
            applyChange.call(this)
          })
        }
        function applyChange () {
          if (this.safe.visited.length === 0) {
            this.safe.index = safeIndex
            this.safe.baseIndex = safeIndex
            this.safe.current = this.safe.all[safeIndex]
          } else if (safeIndex !== this.safe.index) {
            let lastIndex = this.safe.visited.length - 1
            this.safe.index = safeIndex
            this.safe.current = this.safe.all[this.safe.index]
            this.safe.visited[lastIndex].index = this.safe.index
          }
        }
        if (safeIndex !== this.safe.index) {
          animator.style.display = 'block'
          animator.style.width = safebox.offsetWidth + 'px'
          animator.style.height = safebox.offsetHeight + 'px'
          animator.style.left = '0px'
          if (safeIndex < this.safe.index) direction = 'down'
          if (direction === 'up') {
            slideTop.call(this)
          } else {
            slideDown.call(this)
          }
        }
      },
      set_safe_level (evt) {
        let safeIndex = evt.target.value
        let safebox = this.$refs.safebox
        let animator = this.$refs.animator2
        let direction = 'up'
        function slideTop () {
          animator.style.top = '100%'
          safebox.style.transform = 'translateY(0%)'
          this.$animate(animator, {top: '0px'}, {duration: 500, easing: 'ease'}).then(() => {
            animator.style.display = 'none'
          })
          this.$animate(safebox, {translateY: '-100%'}, {duration: 500, easing: 'ease'}).then(() => {
            safebox.style.transform = 'none'
            applyChange.call(this)
          })
        }
        function slideDown () {
          animator.style.top = '-100%'
          safebox.style.transform = 'translateY(0%)'
          this.$animate(animator, {top: '0px'}, {duration: 500, easing: 'ease'}).then(() => {
            animator.style.display = 'none'
          })
          this.$animate(safebox, {translateY: '100%'}, {duration: 500, easing: 'ease'}).then(() => {
            safebox.style.transform = 'none'
            applyChange.call(this)
          })
        }
        function applyChange () {
          if (this.safe.visited.length === 0) {
            this.safe.index = safeIndex
            this.safe.baseIndex = safeIndex
            this.safe.current = this.safe.all[safeIndex]
          } else if (safeIndex !== this.safe.index) {
            let lastIndex = this.safe.visited.length - 1
            this.safe.index = safeIndex
            this.safe.current = this.safe.all[this.safe.index]
            this.safe.visited[lastIndex].index = this.safe.index
          }
        }
        if (safeIndex !== this.safe.index) {
          animator.style.display = 'block'
          animator.style.width = safebox.offsetWidth + 'px'
          animator.style.height = safebox.offsetHeight + 'px'
          animator.style.left = '0px'
          if (safeIndex < this.safe.index) direction = 'down'
          if (direction === 'up') {
            slideTop.call(this)
          } else {
            slideDown.call(this)
          }
        }
      },
      is_safe_current (safeIndex) {
        if (this.safe.index === safeIndex) {
          return true
        } else {
          return false
        }
      },
      is_safe_unlockable () {
        if (this.safe.current.bse.user_id === this.userdata.id) {
          return this.safe.current.level === 1 && this.safe.current.completed < 7
        } else {
          return false
        }
      },
      open_cuk_prompt () {
        this.error_generic = ''
        this.resetForm()
        this.modal_cuk.active = true
        this.modal_cuk.loading = false
      },
      unlock_chamber () {
        if (this.fields.cuk.valid) {
          this.disableForm()
          this.modal_cuk.loading = true
          this.$http.post('safes/unlock', {cuk: this.fields.cuk.value}).then((response) => {
            this.enableForm()
            this.modal_cuk.loading = false
            this.modal_cuk.active = false
            this.fetch()
          }).catch(response => {
            this.enableForm()
            this.modal_cuk.loading = false
            let result = response.body
            if (result.error.code === 'INVALID_INPUT') {
              this.fields.cuk.error = result.error.data.cuk[0]
            } else {
              this.error_generic = result.error.message
            }
          })
        }
      },
      check_cuk_input () {
        this.error_generic = ''
        if (this.fields.cuk.value.length > 0) {
          if (!this.regex.cuk.test(this.fields.cuk.value)) {
            this.fields.cuk.error = 'Format is invalid'
            this.fields.cuk.valid = false
          } else { this.fields.cuk.error = ''; this.fields.cuk.valid = true }
        } else { this.fields.cuk.error = ''; this.fields.cuk.valid = false }
      }
    },
    components: { PageLoader, PanelPaginator, BusyPanel }
  }
</script>

<style scoped>
  tr.current {
    color:black!important;
    font-weight: 500;
  }
  a.current {
    color: #363636;
    cursor: default;
  }
  .panel-block {
    position: relative;
  }
  .panel-block .animator {
    display: none;
    position: absolute;
    box-shadow: 0px 0px 2px 0px rgba(0,0,0,0.12), 0px 2px 2px 0px rgba(0,0,0,0.24);
  }
  .panel-block .animator table {
    height: 100%;
    background-color: white;
  }
  .panel-block .animator td:before,
  .panel-block .animator td:after {
    display: none;
  }
  .panel-block .animator td {
    height: 50%;
    background-color: rgb(47,111,159);
  }
  .panel-block .animator tr:first-child td {
    width: 50%;
  }
  .panel-block .animator2 table.matrix tr td:before,
  .panel-block .animator2 table.matrix tr td:after {
    background-color: rgb(204, 204, 204) !important;
  }
  table.matrix {
    width: 100%;
    border-collapse: separate;
    border-spacing: 5px;
  }
  table.matrix td {
    position: relative;
  }
  table tr:nth-child(1) td {
    width: 25%;
  }
  table tr:nth-child(2) td {
    width: 50%;
  }
  table.matrix tr td:before,
  table.matrix tr td:after {
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 50%;
    font-family: FontAwesome;
    font-size: 18px;
    content: "\f062";
    position: absolute;
    top: -20px;
    color: white;
    background-color: #6FBB02;
    display: none;
  }
  table.matrix tr td:before {
    left: calc(25% - 15px)
  }
  table.matrix tr td:after {
    right: calc(25% - 15px)
  }
  table.matrix tr:nth-child(2) td:before,
  table.matrix tr:nth-child(2) td:after,
  table.matrix tr:nth-child(3) td:before,
  table.matrix tr:nth-child(3) td:after {
    display: inline-block;
  }
  table.matrix td {
    text-align: center;
    vertical-align: middle;
  }
  table.matrix td[guard=lock] {
    color: rgba(54,54,54,0.5);
    border: 1px solid #ccc;
    background-color: #f5f5f5;
  }
  table.matrix td[guard=lock],
  table.matrix td[guard=other],
  table.matrix td[guard=cuked],
  table.matrix td[guard=self] {
    height: 5rem;
  }
  table.matrix td[guard=self] {
    color: rgba(255,255,255,0.9);
    background-color: rgba(47,111,159,0.9);
    border-color: rgba(47,111,159,0.9);
  }
  table.matrix td[guard=cuked] {
    color: rgba(255,255,255,0.9);
    background-color: #f06c41;
    border-color: rgba(47,111,159,0.9);
  }
  table.matrix td[guard=other] {
    color: white;
    background-color: rgb(47,111,159);
    border-color: rgb(47,111,159);
    cursor: pointer;
  }
  /**
  * Hover effect.
  */
  table.matrix td.hovered {
    border: 4px solid #FF3050!important;
    /* border: 4px solid #6FBB02 !important; */
  }
  table.matrix td[guard=other]:hover {
    background-color: rgb(34,102,153);
    border: 4px solid #FF3050;
    /* border: 4px solid #6FBB02; */
    /* box-shadow: 0px 0px 2px 0px rgba(0,0,0,0.12), 0px 2px 2px 0px rgba(0,0,0,0.24); */
  }
  table.matrix td[guard=other]:hover:before,
  table.matrix td[guard=other]:hover:after {
    top: -24px;
    background-color: #FF3050;
    /* background-color: #6FBB02; */
  }
  table.matrix td[guard=other]:hover:before  {
    left: calc(25% - 17px)
  }
  table.matrix td[guard=other]:hover:after {
    right: calc(25% - 17px)
  }
  table.table {
    margin-bottom: 1.1rem;
  }
</style>
