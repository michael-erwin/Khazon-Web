<template>
  <div class="columns">
    <div class="column">
      <BusyBox :disabled="loading">
        <p class="title has-text-centered is-size-5">[ Sign-in ]</p>
        <form>
          <!-- Email -->
          <div class="field">
            <p class="control has-icons-left has-icons-right">
              <input class="input" type="email" placeholder="Email*"
                :class="{'is-danger':fields.email.error.length>0}"
                v-model="fields.email.value" @keyup="checkInput()"
                @paste="checkInput()"
                @cut="checkInput()"
                @keyup.enter="submit">
              <span class="icon is-small is-left">
                <i class="fa fa-envelope"></i>
              </span>
              <span class="icon is-small is-right" :class="{'is-hidden':fields.email.error.length===0}">
                <i class="fa fa-warning"></i>
              </span>
            </p>
            <p class="help is-danger" :class="{'is-active':fields.email.error.length>0}">{{fields.email.error}}</p>
          </div>
          <!-- Password -->
          <div class="field">
            <p class="control has-icons-left has-icons-right">
              <input class="input" type="password" placeholder="Password*" 
                :class="{'is-danger':fields.password.error.length>0}" 
                v-model="fields.password.value" 
                @keyup="checkInput()" 
                @paste="checkInput()" 
                @keyup.enter="submit">
              <span class="icon is-small is-left">
                <i class="fa fa-lock"></i>
              </span>
              <span class="icon is-small is-right" :class="{'is-hidden':fields.password.error.length===0}">
                <i class="fa fa-warning"></i>
              </span>
            </p>
            <p class="help is-danger" :class="{'is-active':fields.password.error.length>0}">{{fields.password.error}}</p>
          </div>
          <!-- Buttons -->
          <div class="field">
            <div class="columns is-mobile">
              <div class="column" style="line-height:36px">
                <label class="tickers checkbox">
                  <input type="checkbox" v-model="fields.remember" />
                  <span class="mark"></span> <small>Remember</small>
                </label>
              </div>
              <div class="column has-text-right">
                <a class="button is-primary is-bold is-block" :class="{'is-loading':loading}" :disabled="!validated" @click="submit()">Submit</a>
              </div>
            </div>
          </div>
        </form>
        <div style="padding-bottom:15px"></div>
        <div class="box-footer">
          <p>
            <small><router-link to="forgot-password"><i class="fa fa-arrow-left"></i> Forgot</router-link></small>
            <small style="float:right"><router-link to="register">Register <i class="fa fa-arrow-right"></i></router-link></small>
          </p>
        </div>
      </BusyBox>
    </div>
  </div>
</template>

<script>
import BusyBox from '@/components/containers/BusyBox'
import {Form} from '@/mixins/Form.js'
export default {
  mixins: [Form],
  data () {
    return {
      fields: {
        email: { value: '', error: '' },
        password: { value: '', error: '' },
        remember: false
      }
    }
  },
  methods: {
    checkInput () {
      // Clear error message
      this.errormsg = ''
      // Validate email
      if (this.fields.email.value.length > 0) {
        if (!this.regex.email.test(this.fields.email.value)) {
          this.fields.email.error = 'Format is invalid'
        } else { this.fields.email.error = '' }
      } else { this.fields.email.error = '' }

      // Validate password
      if (this.fields.password.value.length > 0) {
        if (this.fields.password.value.length < 5) {
          this.fields.password.error = 'Must be at least 6'
        } else { this.fields.password.error = '' }
      } else { this.fields.password.error = '' }

      // Buttons logic
      if (this.fields.email.value.length > 0 && this.fields.password.value.length > 0) {
        if (this.fields.email.error.length === 0 && this.fields.password.error.length === 0) {
          this.validated = true
        }
      } else { this.validated = false }
    },
    submit () {
      if (this.validated) {
        let data = this.getFields()
        this.loading = true
        this.disableForm()
        this.$http.post('account/auth', data).then(response => {
          this.loading = false
          this.enableForm()
          let userData = response.body.user
          this.$store.commit('updateUser', userData)
          this.$router.push('/')
        }).catch(error => {
          this.loading = false
          this.enableForm()
          try {
            if (error.status === 423) {
              this.$router.push('/signin/validate')
            } else if (error.status === 429) {
              this.$router.push('/error-429')
            } else {
              let result = JSON.parse(error.bodyText)
              let emailError = (typeof result.error.data.email === 'object') ? result.error.data.email[0] : ''
              let passwError = (typeof result.error.data.password === 'object') ? result.error.data.password[0] : ''
              this.fields.email.error = emailError
              this.fields.password.error = passwError
            }
          } catch (e) {
            this.errormsg = 'Error has occured.'
          }
        })
      }
    }
  },
  components: { BusyBox }
}
</script>

<style scoped>
  @media (max-width:1023px) {
    p.column {
      text-align: center;
    }
    p.column:first-child {
      padding-bottom: 5px;
    }
    p.column:last-child {
      padding-top: 0;
    }
  }
</style>
