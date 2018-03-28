<template>
  <div class="container">
    <div class="columns">
      <div class="column">
        <BusyBox :disabled="loading" v-show="!modal_success.active">
          <p class="title has-text-centered is-size-5">[ Register ]</p>
          <form>
            <!-- Full Name -->
            <div class="field">
              <p class="control has-icons-left has-icons-right">
                <input class="input" type="text" placeholder="Full Name*"
                  :class="{'is-danger':fields.name.error.length>0}"
                  v-model="fields.name.value" @keyup="checkInput()"
                  @paste="checkInput()"
                  @cut="checkInput()"
                  @keyup.enter="submit">
                <span class="icon is-small is-left">
                  <i class="fa fa-user"></i>
                </span>
                <span class="icon is-small is-right" :class="{'is-hidden':fields.name.error.length===0}">
                  <i class="fa fa-warning"></i>
                </span>
              </p>
              <p class="help is-danger" :class="{'is-active':fields.name.error.length>0}">{{fields.name.error}}</p>
            </div>
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
            <!-- Wallet Address -->
            <div class="field">
              <p class="control has-icons-left has-icons-right">
                <input class="input" type="text" placeholder="Wallet Address*"
                  :class="{'is-danger':fields.address.error.length>0}"
                  v-model="fields.address.value" @keyup="checkInput()"
                  @paste="checkInput()"
                  @cut="checkInput()"
                  @keyup.enter="submit">
                <span class="icon is-small is-left">
                  <i class="fa fa-address-card"></i>
                </span>
                <span class="icon is-small is-right" :class="{'is-hidden':fields.address.error.length===0}">
                  <i class="fa fa-warning"></i>
                </span>
              </p>
              <p class="help is-danger" :class="{'is-active':fields.address.error.length>0}">{{fields.address.error}}</p>
            </div>
            <!-- CUK -->
            <div class="field">
              <p class="control has-icons-left has-icons-right">
                <input class="input" type="text" placeholder="CUK*"
                  :class="{'is-danger':fields.cuk.error.length>0}"
                  v-model="fields.cuk.value" @keyup="checkInput()"
                  @paste="checkInput()"
                  @cut="checkInput()"
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
            <!-- Upline Address -->
            <div class="field">
              <p class="control has-icons-left has-icons-right">
                <input class="input" type="text" placeholder="Guardian Wallet Address"
                  :class="{'is-danger':fields.upl_address.error.length>0}"
                  v-model="fields.upl_address.value" @keyup="checkInput()"
                  @paste="checkInput()"
                  @cut="checkInput()"
                  @keyup.enter="submit">
                <span class="icon is-small is-left">
                  <i class="fa fa-address-card-o"></i>
                </span>
                <span class="icon is-small is-right" :class="{'is-hidden':fields.upl_address.error.length===0}">
                  <i class="fa fa-warning"></i>
                </span>
              </p>
              <p class="help is-danger" :class="{'is-active':fields.upl_address.error.length>0}">{{fields.upl_address.error}}</p>
            </div>
            <!-- Buttons -->
            <div class="field">
              <div class="notification is-danger has-text-centered animated shake" v-show="errormsg.length > 0">{{errormsg}}</div>
              <div class="columns is-mobile">
                <div class="column">
                  <a class="button is-bold is-block" :disabled="!dirty" @click="resetForm()">Clear</a>
                </div>
                <div class="column has-text-right">
                  <a class="button is-primary is-bold is-block" :class="{'is-loading':loading}" :disabled="!validated" @click="submit()">Submit</a>
                </div>
              </div>
            </div>
          </form>
          <div style="padding-bottom:15px"></div>
          <div class="box-footer has-text-centered">
            <p>
              <small><router-link to="/signin"><i class="fa fa-arrow-left"></i> Sign-in</router-link></small>
            </p>
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
  data () {
    return {
      modal_success: {
        active: false,
        message: 'Modal message.'
      },
      fields: {
        name: { value: '', error: '' },
        email: { value: '', error: '' },
        password: { value: '', error: '' },
        address: { value: '', error: '' },
        cuk: { value: '', error: '' },
        upl_address: { value: '', error: '' }
      }
    }
  },
  methods: {
    checkInput () {
      // Validate name
      if (this.fields.name.value.length > 0) {
        if (/^[a-z]{2,}-?[a-z]+ ?$/i.test(this.fields.name.value)) {
          this.fields.name.error = 'Incomplete'
        } else if (!this.regex.fullname.test(this.fields.name.value)) {
          this.fields.name.error = 'Invalid'
        } else { this.fields.name.error = '' }
      } else { this.fields.name.error = '' }

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

      // Validat wallet address
      if (this.fields.address.value.length > 0) {
        if (!this.regex.ethaddr.test(this.fields.address.value)) {
          this.fields.address.error = 'Format is invalid'
        } else { this.fields.address.error = '' }
      } else { this.fields.address.error = '' }

      // Validat CUK
      if (this.fields.cuk.value.length > 0) {
        if (!this.regex.cuk.test(this.fields.cuk.value)) {
          this.fields.cuk.error = 'Format is invalid'
        } else { this.fields.cuk.error = '' }
      } else { this.fields.cuk.error = '' }

      // Validat upline address
      if (this.fields.upl_address.value.length > 0) {
        if (!this.regex.ethaddr.test(this.fields.upl_address.value)) {
          this.fields.upl_address.error = 'Format is invalid'
        } else { this.fields.upl_address.error = '' }
      } else { this.fields.upl_address.error = '' }

      // Buttons logic
      if (this.fields.name.value.length > 0 && this.fields.email.value.length > 0 && this.fields.password.value.length > 0 && this.fields.address.value.length > 0 && this.fields.cuk.value.length > 0) {
        if (this.fields.name.error.length === 0 && this.fields.email.error.length === 0 && this.fields.password.error.length === 0 && this.fields.address.error.length === 0 && this.fields.cuk.error.length === 0 && this.fields.upl_address.error.length === 0) {
          this.validated = true
        } else { this.validated = false }
      } else { this.validated = false }

      if (this.fields.name.value.length > 0 || this.fields.email.value.length > 0 || this.fields.password.value.length > 0 || this.fields.address.value.length > 0 || this.fields.cuk.value.length > 0 || this.fields.upl_address.value.length > 0) {
        this.dirty = true
      } else { this.dirty = false }
    },
    submit () {
      if (this.validated) {
        let data = this.getFields()
        this.loading = true
        this.disableForm()
        this.$http.post('account/register', data).then(response => {
          this.loading = false
          this.enableForm()
          this.modal_success.active = true
        }).catch(error => {
          this.loading = false
          this.enableForm()
          try {
            if (error.status === 429) {
              this.$router.push('/error-429')
            } else {
              let result = JSON.parse(error.bodyText)
              if (result.error && result.error.code === 'INVALID_INPUT') {
                for (let field in result.error.data) {
                  this.fields[field].error = result.error.data[field][0]
                }
              }
            }
          } catch (e) {
            this.errormsg = 'Error has occured.'
          }
        })
      }
    },
    finish () {
      this.$router.push('signin')
    }
  },
  components: { BusyBox }
}
</script>
