<template>
  <div class="container">
    <div class="columns">
      <div class="column">
        <BusyBox :disabled="loading" v-show="!modals.message.active&&!modals.prompt.active">
          <h1 class="title has-text-centered is-size-5" style="margin-bottom:10px">[ Reset Password ]</h1>
          <div style="margin-bottom:10px">Enter one email associated with your account.</div>
          <form @submit.prevent="submit">
            <!-- Email -->
            <div class="field">
              <p class="control has-icons-left has-icons-right" style="width:100%">
                <input class="input" type="email" placeholder="Email*"
                  :class="{'is-danger':fields.email.error.length>0}"
                  v-model="fields.email.value" @keyup="checkinput()"
                  @paste="checkinput()"
                  @cut="checkinput()"
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
            <div class="field">
              Choose method:
              <ul class="recovery-method">
                <li>
                  <label class="tickers radio">
                    <input type="radio" name="method" value="link" v-model="fields.method.value" />
                    <span class="mark"></span> <small>Email reset link</small>
                  </label>
                </li>
                <li>&nbsp;</li>
                <li>
                  <label class="tickers radio">
                    <input type="radio" name="method" value="cqa" v-model="fields.method.value" />
                    <span class="mark"></span> <small>Challenge question</small>
                  </label>
                </li>
              </ul>
            </div>
            <!-- Buttons -->
            <div class="field">
              <div class="columns">
                <div class="column is-hidden-mobile"></div>
                <div class="column is-half-desktop is-three-quarters-tablet">
                  <a class="button is-primary is-bold is-block" :class="{'is-loading':loading}" :disabled="!validated" @click="submit()">Submit</a>
                </div>
                <div class="column is-hidden-mobile"></div>
              </div>
            </div>
          </form>
          <div style="padding-bottom:15px"></div>
          <div class="box-footer has-text-centered">
            <p @click="modals.prompt.active=true">
              <small><router-link to="signin">Sign-in <i class="fa fa-arrow-right"></i></router-link></small>
            </p>
          </div>
        </BusyBox>
        <BusyBox :disabled="loading" v-show="modals.message.active">
          <p class="title has-text-centered is-size-5">[ Info ]</p>
          <div class="columns is-mobile">
            <div class="column">
              <span class="has-text-success" style="flex:2">
                <i style="font-size:3rem" class="fa fa-info-circle"></i>
              </span>
            </div>
            <div class="column" style="flex:8">
              {{modals.message.text}}
            </div>
          </div>
          <div class="columns is-mobile" style="margin-bottom: -30px">
            <div class="column is-hidden-mobile"></div>
            <div class="column is-half-desktop is-three-quarters-tablet">
              <router-link to="signin" class="button is-primary is-bold is-block">
                Ok
              </router-link>
            </div>
            <div class="column is-hidden-mobile"></div>
          </div>
        </BusyBox>
        <BusyBox :disabled="loading" v-show="modals.prompt.active" >
          <p class="title has-text-centered is-size-5">[ Challenge ]</p>
          <div class="info-text">{{modals.prompt.text}}</div>
          <div>
            <form @submit.prevent="ok_prompt()">
              <!-- Question -->
              <div class="field has-addons">
                <p class="control has-icons-left has-icons-right" style="width:100%">
                  <input class="input" ref="prompt_value_focus"
                    :type="modals.prompt.field.type"
                    :class="{'is-danger':modals.prompt.field.error.length>0}"
                    :placeholder="modals.prompt.field.placeholder"
                    :disabled="modals.prompt.loading"
                    v-model="modals.prompt.field.value"
                    @keyup="checkinput_prompt()"
                    @paste="checkinput_prompt()"
                    @cut="checkinput_prompt()"
                      />
                  <span class="icon is-small is-left">
                    <i :class="modals.prompt.field.icon"></i>
                  </span>
                  <span class="icon is-small is-right" :class="{'is-hidden':modals.prompt.field.error.length===0}">
                    <i class="fa fa-warning"></i>
                  </span>
                </p>
                <div class="control">
                  <a class="button" title="Switch visibility" @click="switch_answer_visibility()">
                    <i class="fa" :class="switch_answer_icon()"></i>
                  </a>
                </div>
                <p class="help is-danger" :class="{'is-active':modals.prompt.field.error.length>0}">{{modals.prompt.field.error}}</p>
              </div>
              <!-- Buttons -->
              <div class="field" style="margin-bottom: -30px">
                <div class="columns is-mobile">
                  <div class="column">
                    <a class="button is-bold is-block" @click="modals.prompt.active=false">Cancel</a>
                  </div>
                  <div class="column has-text-right">
                    <a class="button is-primary is-bold is-block" :class="{'is-loading':modals.prompt.loading==true}" 
                    :disabled="modals.prompt.loading==true || modals.prompt.input_valid==false" @click="ok_prompt()">Submit</a>
                  </div>
                </div>
              </div>
            </form>
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
      loading: false,
      fields: {
        email: { value: '', error: '' },
        method: { value: 'link', error: '' }
      },
      cqa: {
        qid: 0,
        question: ''
      },
      modals: {
        message: {
          active: false,
          text: 'A reset link has been sent to your email. Please check your inbox for instruction.'
        },
        prompt: {
          active: false,
          input_valid: false,
          loading: false,
          text: '',
          field: {
            icon: 'fa fa-key',
            value: '',
            error: '',
            placeholder: 'Answer',
            type: 'password'
          }
        }
      }
    }
  },
  methods: {
    checkinput () {
      // Validate email
      if (this.fields.email.value.length > 0) {
        if (!this.regex.email.test(this.fields.email.value)) {
          this.fields.email.error = 'Format is invalid'
        } else { this.fields.email.error = '' }
      } else { this.fields.email.error = '' }

      // Buttons logic
      if (this.fields.email.value.length > 0) {
        if (this.fields.email.error.length === 0) {
          this.validated = true
        } else { this.validated = false }
      } else { this.validated = false }
    },
    checkinput_prompt () {
      let errors = 0
      let modal = this.modals.prompt
      let field = modal.field
      if (field.value === '') {
        field.error = ''
        errors++
      } else if (field.value.length < 6) {
        field.error = 'Too short'
        errors++
      } else {
        field.error = ''
      }
      if (errors === 0) {
        modal.input_valid = true
      } else {
        modal.input_valid = false
      }
    },
    envoke_prompt () {
      let _self = this.modals.prompt
      _self.text = this.cqa.question
      _self.field.value = ''
      _self.error = ''
      _self.active = true
      this.checkinput_prompt()
    },
    submit () {
      if (this.validated) {
        this.loading = true
        this.disableForm()
        let data = {
          params: {
            email: this.fields.email.value,
            method: this.fields.method.value
          }
        }
        this.$http.get('account/recover', data).then((response) => {
          this.loading = false
          this.enableForm()
          if (this.fields.method.value === 'link') {
            this.modals.message.active = true
          } else {
            try {
              let data = response.body.data
              this.cqa.qid = data.qid
              this.cqa.question = data.question
              this.envoke_prompt()
            } catch (e) {
              this.$noty.error('Unknown response')
            }
          }
        }).catch((response) => {
          this.loading = false
          this.enableForm()
          try {
            if (typeof response.body.error.data === 'object') {
              this.fields.email.error = response.body.error.data.email[0]
            }
          } catch (e) {
            this.$noty.error('Unknown error has occured')
            console.log(e)
          }
        })
      }
    },
    switch_answer_icon () {
      let modal = this.modals.prompt
      let icon = 'fa-eye'
      if (modal.field.type === 'text') icon = 'fa-eye-slash'
      return icon
    },
    switch_answer_visibility () {
      let modal = this.modals.prompt
      if (modal.field.type === 'text') {
        modal.field.type = 'password'
      } else {
        modal.field.type = 'text'
      }
    },
    ok_message () {
      this.$router.push('/signin')
    },
    ok_prompt () {
      let _self = this.modals.prompt
      if (_self.input_valid) {
        _self.loading = true
        this.disableForm()
        let data = {
          qid: this.cqa.qid,
          answer: _self.field.value
        }
        this.$http.post('account/recover/check_answer', data).then((response) => {
          this.loading = false
          _self.loading = false
          this.enableForm()
          if (typeof response.body.data.token === 'string') {
            let token = response.body.data.token.replace(/\./g, '~')
            this.$router.push('/reset-password/' + token)
          } else {
            this.$noty.error('Unknown response')
          }
        }).catch((response) => {
          this.loading = false
          _self.loading = false
          this.enableForm()
          _self.field.error = 'Incorrect'
        })
      }
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
    text-align: center;
  }
  ul.recovery-method li {
    display: inline-block;
  }
  .info-text {
    margin-bottom: 15px;
  }
</style>