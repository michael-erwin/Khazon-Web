<template>
  <div class="container">
    <div class="columns">
      <div class="column">
        <BusyBox :disabled="loading" v-show="!modals.message.active">
          <h1 class="title has-text-centered is-size-5" style="margin-bottom:10px">[ Create Password ]</h1>
          <div style="margin-bottom:10px">Enter new password for your account.</div>
          <form @submit.prevent="submit">
            <!-- Email -->
            <div class="field">
              <p class="control has-icons-left has-icons-right" style="width:100%">
                <input class="input" :type="fields.npassword.type" placeholder="Password*"
                  :class="{'is-danger':fields.npassword.error.length>0}"
                  v-model="fields.npassword.value" @keyup="checkInput()"
                  @paste="checkInput()"
                  @cut="checkInput()"
                  @keyup.enter="submit">
                <span class="icon is-small is-left">
                  <i class="fa fa-unlock-alt"></i>
                </span>
                <span class="icon is-small is-right" :class="{'is-hidden':fields.npassword.error.length===0}">
                  <i class="fa fa-warning"></i>
                </span>
              </p>
              <p class="help is-danger" :class="{'is-active':fields.npassword.error.length>0}">{{fields.npassword.error}}</p>
            </div>
            <div class="field has-addons">
              <p class="control has-icons-left has-icons-right" style="width:100%">
                <input class="input" :type="fields.rpassword.type" placeholder="Retyp password*"
                  :class="{'is-danger':fields.rpassword.error.length>0}"
                  v-model="fields.rpassword.value" @keyup="checkInput()"
                  @paste="checkInput()"
                  @cut="checkInput()"
                  @keyup.enter="submit">
                <span class="icon is-small is-left">
                  <i class="fa fa-lock"></i>
                </span>
                <span class="icon is-small is-right" :class="{'is-hidden':fields.rpassword.error.length===0}">
                  <i class="fa fa-warning"></i>
                </span>
              </p>
              <div class="control">
                <a class="button" title="Switch visibility" @click="switch_password_visibility('rpassword')">
                  <i class="fa" :class="switch_password_icon('rpassword')"></i>
                </a>
              </div>
              <p class="help is-danger" :class="{'is-active':fields.rpassword.error.length>0}">{{fields.rpassword.error}}</p>
            </div>
            <!-- Buttons -->
            <div class="field" style="margin-bottom: -30px">
              <div class="columns">
                <div class="column is-hidden-mobile"></div>
                <div class="column is-half-desktop is-three-quarters-tablet">
                  <a class="button is-primary is-bold is-block" :class="{'is-loading':loading}" :disabled="!validated" @click="submit()">Submit</a>
                </div>
                <div class="column is-hidden-mobile"></div>
              </div>
            </div>
          </form>
        </BusyBox>
        <BusyBox :disabled="loading" v-show="modals.message.active">
          <p class="title has-text-centered is-size-5">[ Success ]</p>
          <div class="columns is-mobile">
            <div class="column">
              <span class="has-text-success" style="flex:2">
                <i style="font-size:3rem" class="fa fa-check-circle"></i>
              </span>
            </div>
            <div class="column" style="flex:8">
              {{modals.message.text}}
            </div>
          </div>
          <div class="columns is-mobile" style="margin-bottom: -30px">
            <div class="column is-hidden-mobile"></div>
            <div class="column is-half-desktop is-three-quarters-tablet">
              <router-link :to="{path:'/signin'}" class="button is-primary is-bold is-block">
                Sign in now
              </router-link>
            </div>
            <div class="column is-hidden-mobile"></div>
          </div>
        </BusyBox>
      </div>
    </div>
  </div>
</template>

<script>
import BusyBox from '@/components/containers/BusyBox'
import {Form} from '@/mixins/Form.js'
export default {
  mixins: [Form],
  beforeMount () {
    this.fetch()
  },
  data () {
    return {
      loading: false,
      fields: {
        jti: 0,
        ref: '',
        npassword: { value: '', type: 'password', error: '' },
        rpassword: { value: '', type: 'password', error: '' }
      },
      modals: {
        message: {
          active: false,
          text: 'Your password has been changed successfully.'
        }
      }
    }
  },
  methods: {
    checkInput () {
      let errors = 0
      // Validate password
      if (this.fields.npassword.value.length > 0) {
        if (this.fields.npassword.value.length < 5) {
          this.fields.npassword.error = 'Must be at least 6'
          errors++
        } else { this.fields.npassword.error = '' }
      } else { this.fields.npassword.error = '' }
      if (this.fields.npassword.error.length === 0) {
        if (this.fields.rpassword.value === '') {
          this.fields.rpassword.error = ''
          errors++
        } else if (this.fields.rpassword.value !== this.fields.npassword.value) {
          this.fields.rpassword.error = 'Did not match'
          errors++
        } else { this.fields.rpassword.error = '' }
      }

      // Buttons logic
      if (errors === 0) {
        this.validated = true
      } else { this.validated = false }
    },
    submit () {
      if (this.validated) {
        this.loading = true
        this.disableForm()
        let data = {
          jti: this.fields.jti,
          ref: this.fields.ref,
          password: this.fields.npassword.value
        }
        this.$http.post('account/recover', data).then((response) => {
          this.loading = false
          this.enableForm()
          this.modals.message.active = true
        }).catch((response) => {
          this.loading = false
          this.enableForm()
          try {
            if (typeof response.body.error.data === 'object') {
              this.fields.email.error = response.body.error.data.email[0]
            } else {
              this.$noty.error('Unknown response')
            }
          } catch (e) {
            this.$noty.error('Unknown error has occured')
            console.log(e)
          }
        })
      }
    },
    switch_password_icon (name) {
      let field = this.fields[name]
      let icon = 'fa-eye'
      if (field.type === 'text') {
        icon = 'fa-eye-slash'
      }
      return icon
    },
    switch_password_visibility (name) {
      let field = this.fields[name]
      if (field.type === 'text') {
        field.type = 'password'
      } else {
        field.type = 'text'
      }
    },
    fetch () {
      let token = this.$route.params.token.replace(/~/g, '.')
      let url = 'account/recover/' + token
      this.$http.get(url).then((response) => {
        this.loading = false
        let data = response.body.data
        this.fields.jti = data.jti
        this.fields.ref = data.ref
      }).catch((response) => {
        this.$router.push('/signin')
      })
    },
    finish () {
      this.$router.push('/signin')
    }
  },
  components: { BusyBox }
}
</script>

<style scoped>
  p.notice {
    padding: 5px;
    margin-bottom: 10px;
  }
  ul.recovery-method {
    padding-left: 15px;
  }
</style>