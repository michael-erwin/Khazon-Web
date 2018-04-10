<template>
  <div>
    <div slot="content" class="container">
      <PageLoader class="page-loader" v-if="auth===null" color="dark"></PageLoader>
      <div class="columns is-marginless">
        <div v-if="auth" class="column">
          <BusyPanel :class="{busy:loading}">
            <div class="panel-heading">
              <b>Profile</b>
            </div>
            <div class="panel-block block-footer" style="background-color:white">
              <table class="table is-bordered-inside is-narrow is-striped is-fullwidth" style="margin-bottom:0">
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>
                      {{settings.profile.name}}
                      <span class="control-button" title="Modify" @click="invoke_prompt_verify_user('update_name')">
                        <i class="fa fa-pencil"></i>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>
                      {{settings.profile.email}}
                      <!-- <span class="control-button" title="Modify" @click="invoke_prompt_verify_user('update_email')">
                        <i class="fa fa-pencil"></i>
                      </span> -->
                    </td>
                  </tr>
                  <tr>
                    <td>Wallet Address</td>
                    <td>
                      <span class="eth-address monospace">{{settings.profile.address}}</span>
                      <!-- <span class="control-button" title="Modify" @click="invoke_prompt_verify_user('update_address')">
                        <i class="fa fa-pencil"></i>
                      </span> -->
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BusyPanel>
          <BusyPanel :class="{busy:loading}">
            <div class="panel-heading">
              <b>Security</b>
            </div>
            <div class="panel-block block-footer" style="background-color:white">
              <table class="table is-bordered-inside is-narrow is-striped is-fullwidth" style="margin-bottom:0">
                <tbody>
                  <tr>
                    <td>Password</td>
                    <td>
                      ******
                      <span class="control-button" title="Modify" @click="invoke_prompt_verify_user('update_password')">
                        <i class="fa fa-pencil"></i>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>2FA
                      <a class="tooltip"
                          title="Click for details"
                          @click="show_message('2FA','Two Factor Authentication (2FA). Enable this to add extra layer of security by requiring single use code (OTP) generated from mobile device after every correct password login.')">
                        <i class="fa fa-question-circle"></i>
                      </a>
                    </td>
                    <td>
                      {{settings.security.has_2fa==1?'enabled':'disabled'}}
                      <span class="control-button" title="Modify" @click="invoke_prompt_verify_user('invoke_2fa_ticker')">
                        <i class="fa fa-pencil"></i>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BusyPanel>
          <BusyPanel :class="{busy:loading}">
            <div class="panel-heading">
              <b>Recovery</b>
            </div>
            <div class="panel-block block-footer" style="background-color:white">
              <table class="table is-bordered-inside is-narrow is-striped is-fullwidth" style="margin-bottom:0">
                <tbody>
                  <tr>
                    <td>
                      Secondary Email
                      <a class="tooltip"
                          title="Click for details"
                          @click="show_message('Secondary Email',
                          'Use alternative email address to regain access to your account.')">
                          <i class="fa fa-question-circle"></i>
                      </a>
                    </td>
                    <td>
                      {{settings.recovery.secondary_email}}
                      <span class="control-button" title="Modify" @click="invoke_prompt_verify_user('update_email_2nd')">
                        <i class="fa fa-pencil"></i>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Challenge Questions
                      <a class="tooltip"
                          title="Click for details"
                          @click="show_message('Challenge Questions',
                          'Make your own questions with answers only known to you.')">
                          <i class="fa fa-question-circle"></i>
                      </a>
                    </td>
                    <td>
                      {{settings.recovery.cqa.status==1?'enabled':'disabled'}}
                      <span class="control-button" title="Modify" @click="invoke_prompt_verify_user('invoke_cqa_ticker')">
                        <i class="fa fa-pencil"></i>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BusyPanel>
        </div>
      </div>
    </div>
    <div slot="content" class="modal casual" :class="{'is-active':modals.two_factor_qr.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated">
        <header class="modal-card-head">
          <p class="modal-card-title">Save Key</p>
          <button class="delete is-danger" @click="modals.two_factor_qr.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column" style="text-align: center">
              <div class="info-text">Scan this QR code</div>
              <QRCode :value="modals.two_factor_qr.url" size="250"></QRCode>
              <div class="info-text" style="margin-top:15px">or manually</div>
              <p class="qr-manual">{{modals.two_factor_qr.key}}</p>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" @click="verify_otp_2fa()">Next</button>
          <button class="button is-gradient" @click="modals.two_factor_qr.active=false">Cancel</button>
        </footer>
      </div>
    </div>
    <div slot="content" class="modal casual" :class="{'is-active':modals.two_factor_ticker.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated">
        <header class="modal-card-head">
          <p class="modal-card-title">Switch 2FA</p>
          <button class="delete is-danger" :disabled="modals.two_factor_ticker.loading" @click="modals.two_factor_ticker.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              <div>
                <form @submit.prevent="submit_2fa_ticker()">
                  <div class="field">
                    <label class="tickers radio">
                        <input type="radio" name="has_2fa" 
                           :disabled="modals.two_factor_ticker.loading" value="1" 
                           v-model="modals.two_factor_ticker.input_value"
                           @change="checkinput_2fa_ticker()" />
                        <span class="mark"></span> <small>Enable</small>
                      </label>
                      <label class="tickers radio">
                        <input type="radio" name="has_2fa" value="0" 
                          :disabled="modals.two_factor_ticker.loading"
                          v-model="modals.two_factor_ticker.input_value"
                          @change="checkinput_2fa_ticker()" />
                        <span class="mark"></span> <small>Disable</small>
                      </label>
                  </div>
                  <div class="modal-paragraph" v-if="modals.two_factor_ticker.input_value==1 && modals.two_factor_ticker.input_changed">
                    <div class="notification is-danger">
                      This security feature requires Google compatible authenticator app that must be installed on your mobile device.
                      Make sure to install the mobile app first before continuing.
                    </div>
                    <div>
                      Recommended:
                      <ul>
                        <li><i class="fa fa-arrow-right"></i> Google Authenticator (<a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en" target="_blank">Android</a>) (<a href="https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8" target="_blank">iOS</a>)</li>
                        <li><i class="fa fa-arrow-right"></i> Authy (<a href="https://play.google.com/store/apps/details?id=com.authy.authy&hl=en" target="_blank">Android</a>) (<a href="https://itunes.apple.com/us/app/authy/id494168017?mt=8" target="_blank">iOS</a>)</li>
                      </ul>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" :class="{'is-loading':modals.two_factor_ticker.loading}"
            :disabled="!modals.two_factor_ticker.input_changed || modals.two_factor_ticker.loading"
            @click="submit_2fa_ticker()">{{modals.two_factor_ticker.input_value==0? 'Save' : 'Next'}}</button>
          <button class="button is-gradient" @click="modals.two_factor_ticker.active=false" :disabled="modals.two_factor_ticker.loading">Cancel</button>
        </footer>
      </div>
    </div>
    <div slot="content" class="modal casual" :class="{'is-active':modals.change_pass.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated">
        <header class="modal-card-head">
          <p class="modal-card-title">Change Password</p>
          <button class="delete is-danger" :disabled="modals.change_pass.loading" @click="modals.change_pass.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              <div class="info-text">Enter a new password.</div>
              <div>
                <form @submit.prevent="submit_update_password()">
                  <div class="field">
                    <p class="control has-icons-left has-icons-right">
                      <input class="input" type="password" ref="change_pass_focus"
                        :class="{'is-danger':modals.change_pass.npassword.error.length>0}"
                        :placeholder="modals.change_pass.npassword.placeholder"
                        :disabled="modals.change_pass.loading"
                        v-model="modals.change_pass.npassword.value"
                        @keyup="checkinput_update_password()"
                        @keyup.enter="submit_update_password()"
                        @paste="checkinput_update_password()"
                        @cut="checkinput_update_password()"
                         />
                      <span class="icon is-small is-left">
                        <i class="fa fa-lock"></i>
                      </span>
                      <span class="icon is-small is-right" :class="{'is-hidden':modals.change_pass.npassword.error.length===0}">
                        <i class="fa fa-warning"></i>
                      </span>
                    </p>
                    <p class="help is-danger" :class="{'is-active':modals.change_pass.npassword.error.length>0}">{{modals.change_pass.npassword.error}}</p>
                  </div>
                  <div class="field">
                    <p class="control has-icons-left has-icons-right">
                      <input class="input" type="password"
                        :class="{'is-danger':modals.change_pass.rpassword.error.length>0}"
                        :placeholder="modals.change_pass.rpassword.placeholder"
                        :disabled="modals.change_pass.loading"
                        v-model="modals.change_pass.rpassword.value"
                        @keyup="checkinput_update_password()"
                        @keyup.enter="submit_update_password()"
                        @paste="checkinput_update_password()"
                        @cut="checkinput_update_password()"
                         />
                      <span class="icon is-small is-left">
                        <i class="fa fa-unlock-alt"></i>
                      </span>
                      <span class="icon is-small is-right" :class="{'is-hidden':modals.change_pass.rpassword.error.length===0}">
                        <i class="fa fa-warning"></i>
                      </span>
                    </p>
                    <p class="help is-danger" :class="{'is-active':modals.change_pass.rpassword.error.length>0}">{{modals.change_pass.rpassword.error}}</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" :class="{'is-loading':modals.change_pass.loading}"
            :disabled="!modals.change_pass.input_valid || modals.change_pass.loading"
            @click="submit_update_password()">Save</button>
          <button class="button is-gradient" @click="modals.change_pass.active=false" :disabled="modals.change_pass.loading">Cancel</button>
        </footer>
      </div>
    </div>
    <div slot="content" class="modal casual" :class="{'is-active':modals.cqa_ticker.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated">
        <header class="modal-card-head">
          <p class="modal-card-title">Switch CQA</p>
          <button class="delete is-danger" :disabled="modals.cqa_ticker.loading" @click="modals.cqa_ticker.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              <div>
                <form @submit.prevent="submit_cqa_ticker()">
                  <div class="field">
                    <label class="tickers radio">
                      <input type="radio" name="has_cqa" value="1" v-model="modals.cqa_ticker.input_value"
                      :disabled="modals.cqa_ticker.loading"
                      @change="checkinput_cqa_ticker()" />
                      <span class="mark"></span> <small>Enable</small>
                    </label>
                    <label class="tickers radio">
                      <input type="radio" name="has_cqa" value="0"
                      :disabled="modals.cqa_ticker.loading" v-model="modals.cqa_ticker.input_value"
                      @change="checkinput_cqa_ticker()" />
                      <span class="mark"></span> <small>Disable</small>
                    </label>
                  </div>
                  <div class="modal-paragraph" v-show="modals.cqa_ticker.input_value==1">
                    <div class="notification is-danger">
                      For security reason. Saved answers are not shown.
                    </div>
                  </div>
                  <div v-show="modals.cqa_ticker.input_value==1" class="cqa_ticker_inputs">
                    <table class="cqa_ticker">
                      <tr>
                        <td><span class="q-item-number">1</span></td>
                        <td>
                          <div class="field">
                            <p class="control has-icons-left has-icons-right">
                              <input class="input" type="text" ref="cqa_focus"
                                :class="{'is-danger':modals.cqa_ticker.fields.q1.q.error.length>0}"
                                :placeholder="modals.cqa_ticker.fields.q1.q.placeholder"
                                :disabled="modals.cqa_ticker.loading"
                                v-model="modals.cqa_ticker.fields.q1.q.value"
                                @keyup="checkinput_cqa_entry()"
                                @keyup.enter="submit_cqa_ticker()"
                                @paste="checkinput_cqa_entry()"
                                @cut="checkinput_cqa_entry()"
                                 />
                              <span class="icon is-small is-left">
                                <i class="fa fa-question-circle-o"></i>
                              </span>
                              <span class="icon is-small is-right" :class="{'is-hidden':modals.cqa_ticker.fields.q1.q.error.length===0}">
                                <i class="fa fa-warning"></i>
                              </span>
                            </p>
                            <p class="help is-danger" :class="{'is-active':modals.cqa_ticker.fields.q1.q.error.length>0}">{{modals.cqa_ticker.fields.q1.q.error}}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>
                          <div class="field has-addons">
                            <p class="control has-icons-left has-icons-right">
                              <input class="input" :type="modals.cqa_ticker.fields.q1.a.type"
                                :class="{'is-danger':modals.cqa_ticker.fields.q1.a.error.length>0}"
                                :placeholder="modals.cqa_ticker.fields.q1.a.placeholder"
                                :disabled="modals.cqa_ticker.loading"
                                v-model="modals.cqa_ticker.fields.q1.a.value"
                                @keyup="checkinput_cqa_entry()"
                                @keyup.enter="submit_cqa_ticker()"
                                @paste="checkinput_cqa_entry()"
                                @cut="checkinput_cqa_entry()"
                                 />
                              <span class="icon is-small is-left">
                                <i class="fa fa-key"></i>
                              </span>
                              <span class="icon is-small is-right" :class="{'is-hidden':modals.cqa_ticker.fields.q1.a.error.length===0}">
                                <i class="fa fa-warning"></i>
                              </span>
                            </p>
                            <div class="control">
                              <a class="button" title="Switch visibility" @click="switch_answer_visibility('q1')">
                                <i class="fa" :class="switch_answer_icon('q1')"></i>
                              </a>
                            </div>
                            <p class="help is-danger" :class="{'is-active':modals.cqa_ticker.fields.q1.a.error.length>0}">{{modals.cqa_ticker.fields.q1.a.error}}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <table class="cqa_ticker">
                      <tr>
                        <td><span class="q-item-number">2</span></td>
                        <td>
                          <div class="field">
                            <p class="control has-icons-left has-icons-right">
                              <input class="input" type="text" ref="cqa_focus"
                                :class="{'is-danger':modals.cqa_ticker.fields.q2.q.error.length>0}"
                                :placeholder="modals.cqa_ticker.fields.q2.q.placeholder"
                                :disabled="modals.cqa_ticker.loading"
                                v-model="modals.cqa_ticker.fields.q2.q.value"
                                @keyup="checkinput_cqa_entry()"
                                @keyup.enter="submit_cqa_ticker()"
                                @paste="checkinput_cqa_entry()"
                                @cut="checkinput_cqa_entry()"
                                 />
                              <span class="icon is-small is-left">
                                <i class="fa fa-question-circle-o"></i>
                              </span>
                              <span class="icon is-small is-right" :class="{'is-hidden':modals.cqa_ticker.fields.q2.q.error.length===0}">
                                <i class="fa fa-warning"></i>
                              </span>
                            </p>
                            <p class="help is-danger" :class="{'is-active':modals.cqa_ticker.fields.q2.q.error.length>0}">{{modals.cqa_ticker.fields.q2.q.error}}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>
                          <div class="field has-addons">
                            <p class="control has-icons-left has-icons-right">
                              <input class="input" :type="modals.cqa_ticker.fields.q2.a.type"
                                :class="{'is-danger':modals.cqa_ticker.fields.q2.a.error.length>0}"
                                :placeholder="modals.cqa_ticker.fields.q2.a.placeholder"
                                :disabled="modals.cqa_ticker.loading"
                                v-model="modals.cqa_ticker.fields.q2.a.value"
                                @keyup="checkinput_cqa_entry()"
                                @keyup.enter="submit_cqa_ticker()"
                                @paste="checkinput_cqa_entry()"
                                @cut="checkinput_cqa_entry()"
                                 />
                              <span class="icon is-small is-left">
                                <i class="fa fa-key"></i>
                              </span>
                              <span class="icon is-small is-right" :class="{'is-hidden':modals.cqa_ticker.fields.q2.a.error.length===0}">
                                <i class="fa fa-warning"></i>
                              </span>
                            </p>
                            <div class="control">
                              <a class="button" title="Switch visibility" @click="switch_answer_visibility('q2')">
                                <i class="fa" :class="switch_answer_icon('q2')"></i>
                              </a>
                            </div>
                            <p class="help is-danger" :class="{'is-active':modals.cqa_ticker.fields.q2.a.error.length>0}">{{modals.cqa_ticker.fields.q2.a.error}}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <table class="cqa_ticker">
                      <tr>
                        <td><span class="q-item-number">3</span></td>
                        <td>
                          <div class="field">
                            <p class="control has-icons-left has-icons-right">
                              <input class="input" type="text" ref="cqa_focus"
                                :class="{'is-danger':modals.cqa_ticker.fields.q3.q.error.length>0}"
                                :placeholder="modals.cqa_ticker.fields.q3.q.placeholder"
                                :disabled="modals.cqa_ticker.loading"
                                v-model="modals.cqa_ticker.fields.q3.q.value"
                                @keyup="checkinput_cqa_entry()"
                                @keyup.enter="submit_cqa_ticker()"
                                @paste="checkinput_cqa_entry()"
                                @cut="checkinput_cqa_entry()"
                                 />
                              <span class="icon is-small is-left">
                                <i class="fa fa-question-circle-o"></i>
                              </span>
                              <span class="icon is-small is-right" :class="{'is-hidden':modals.cqa_ticker.fields.q3.q.error.length===0}">
                                <i class="fa fa-warning"></i>
                              </span>
                            </p>
                            <p class="help is-danger" :class="{'is-active':modals.cqa_ticker.fields.q3.q.error.length>0}">{{modals.cqa_ticker.fields.q3.q.error}}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>
                          <div class="field has-addons">
                            <p class="control has-icons-left has-icons-right">
                              <input class="input" :type="modals.cqa_ticker.fields.q3.a.type"
                                :class="{'is-danger':modals.cqa_ticker.fields.q3.a.error.length>0}"
                                :placeholder="modals.cqa_ticker.fields.q3.a.placeholder"
                                :disabled="modals.cqa_ticker.loading"
                                v-model="modals.cqa_ticker.fields.q3.a.value"
                                @keyup="checkinput_cqa_entry()"
                                @keyup.enter="submit_cqa_ticker()"
                                @paste="checkinput_cqa_entry()"
                                @cut="checkinput_cqa_entry()"
                                 />
                              <span class="icon is-small is-left">
                                <i class="fa fa-key"></i>
                              </span>
                              <span class="icon is-small is-right" :class="{'is-hidden':modals.cqa_ticker.fields.q3.a.error.length===0}">
                                <i class="fa fa-warning"></i>
                              </span>
                            </p>
                            <div class="control">
                              <a class="button" title="Switch visibility" @click="switch_answer_visibility('q3')">
                                <i class="fa" :class="switch_answer_icon('q3')"></i>
                              </a>
                            </div>
                            <p class="help is-danger" :class="{'is-active':modals.cqa_ticker.fields.q3.a.error.length>0}">{{modals.cqa_ticker.fields.q3.a.error}}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" :disabled="cqa_unsubmittable"
          @click="submit_cqa_ticker()">Save</button>
          <button class="button is-gradient" :disabled="modals.cqa_ticker.loading"
          @click="modals.cqa_ticker.active=false">Cancel</button>
        </footer>
      </div>
    </div>
    <div slot="content" class="modal casual" :class="{'is-active':modals.prompt_value.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated">
        <header class="modal-card-head">
          <p class="modal-card-title">{{modals.prompt_value.title}}</p>
          <button class="delete is-danger" :disabled="modals.prompt_value.loading" @click="modals.prompt_value.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              <div class="info-text">{{modals.prompt_value.body}}</div>
              <div>
                <form @submit.prevent="submit_prompt_value()">
                  <div class="field">
                    <p class="control has-icons-left has-icons-right">
                      <input class="input" ref="prompt_value_focus"
                        :type="modals.prompt_value.field.type"
                        :class="{'is-danger':modals.prompt_value.field.error.length>0}"
                        :placeholder="modals.prompt_value.field.placeholder"
                        :disabled="modals.prompt_value.loading"
                        v-model="modals.prompt_value.field.value"
                        @keyup="checkinput_prompt_value()"
                        @paste="checkinput_prompt_value()"
                        @cut="checkinput_prompt_value()"
                         />
                      <span class="icon is-small is-left">
                        <i :class="modals.prompt_value.field.icon"></i>
                      </span>
                      <span class="icon is-small is-right" :class="{'is-hidden':modals.prompt_value.field.error.length===0}">
                        <i class="fa fa-warning"></i>
                      </span>
                    </p>
                    <p class="help is-danger" :class="{'is-active':modals.prompt_value.field.error.length>0}">{{modals.prompt_value.field.error}}</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" :class="{'is-loading':modals.prompt_value.loading}"
            :disabled="!modals.prompt_value.input_valid || modals.prompt_value.loading"
            @click="submit_prompt_value()">{{modals.prompt_value.button_text}}</button>
          <button class="button is-gradient" @click="modals.prompt_value.active=false" :disabled="modals.prompt_value.loading">Cancel</button>
        </footer>
      </div>
    </div>
    <div slot="content" class="modal casual" :class="{'is-active':modals.prompt_otp.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated">
        <header class="modal-card-head">
          <p class="modal-card-title">{{modals.prompt_otp.title}}</p>
          <button class="delete is-danger" :disabled="modals.prompt_otp.loading" @click="close_prompt_otp()"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              <div class="info-text">{{modals.prompt_otp.body}}</div>
              <div>
                <form @submit.prevent="submit_prompt_otp()">
                  <div class="field has-addons">
                    <p class="control has-icons-left has-icons-right">
                      <input class="input" ref="prompt_otp_focus"
                        :type="modals.prompt_otp.field.type"
                        :class="{'is-danger':modals.prompt_otp.field.error.length>0}"
                        :placeholder="modals.prompt_otp.field.placeholder"
                        :disabled="modals.prompt_otp.loading"
                        v-model="modals.prompt_otp.field.value"
                        @keyup="checkinput_prompt_value('prompt_otp')"
                        @paste="checkinput_prompt_value('prompt_otp')"
                        @cut="checkinput_prompt_value('prompt_otp')"
                         />
                      <span class="icon is-small is-left">
                        <i :class="modals.prompt_otp.field.icon"></i>
                      </span>
                      <span class="icon is-small is-right" :class="{'is-hidden':modals.prompt_otp.field.error.length===0}">
                        <i class="fa fa-warning"></i>
                      </span>
                    </p>
                    <p class="control">
                      <a class="button is-static">
                        waiting ({{modals.prompt_otp.countdown.count}})
                      </a>
                    </p>
                    <p class="help is-danger" :class="{'is-active':modals.prompt_otp.field.error.length>0}">{{modals.prompt_otp.field.error}}</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" :class="{'is-loading':modals.prompt_otp.loading}"
            :disabled="!modals.prompt_otp.input_valid || modals.prompt_otp.loading"
            @click="submit_prompt_otp()">{{modals.prompt_otp.button_text}}</button>
          <button class="button is-gradient" @click="close_prompt_otp()" :disabled="modals.prompt_otp.loading">Cancel</button>
        </footer>
      </div>
    </div>
    <div slot="content" class="modal casual" :class="{'is-active':modals.prompt_verify_user.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated">
        <header class="modal-card-head">
          <p class="modal-card-title">Verify User</p>
          <button class="delete is-danger" :disabled="modals.prompt_verify_user.loading" @click="close_prompt_verify_user()"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              <div class="info-text">Verify that this is you. Please enter your password.</div>
              <div>
                <form @submit.prevent="submit_prompt_verify_user()">
                  <div class="field">
                    <p class="control has-icons-left has-icons-right">
                      <input class="input" ref="prompt_verify_user_focus" type="password" placeholder="Password" 
                        :class="{'is-danger':modals.prompt_verify_user.field.error.length>0}"
                        :disabled="modals.prompt_verify_user.loading"
                        v-model="modals.prompt_verify_user.field.value"
                        @keyup="checkinput_prompt_value('prompt_verify_user')"
                        @paste="checkinput_prompt_value('prompt_verify_user')"
                        @cut="checkinput_prompt_value('prompt_verify_user')"
                         />
                      <span class="icon is-small is-left">
                        <i class="fa fa-unlock-alt"></i>
                      </span>
                      <span class="icon is-small is-right" :class="{'is-hidden':modals.prompt_verify_user.field.error.length===0}">
                        <i class="fa fa-warning"></i>
                      </span>
                    </p>
                    <p class="help is-danger" :class="{'is-active':modals.prompt_verify_user.field.error.length>0}">{{modals.prompt_verify_user.field.error}}</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" :class="{'is-loading':modals.prompt_verify_user.loading}"
            :disabled="!modals.prompt_verify_user.input_valid || modals.prompt_verify_user.loading"
            @click="submit_prompt_verify_user()">{{modals.prompt_verify_user.button_text}}</button>
          <button class="button is-gradient" @click="close_prompt_verify_user()" :disabled="modals.prompt_verify_user.loading">Cancel</button>
        </footer>
      </div>
    </div>
    <div slot="content" class="modal casual" :class="{'is-active':modals.message.active}">
      <div class="modal-background"></div>
      <div class="modal-card animated">
        <header class="modal-card-head">
          <p class="modal-card-title">{{modals.message.title}}</p>
          <button class="delete is-danger" aria-label="close" @click="modals.message.active=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column">
              {{modals.message.body}}
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <button class="button is-gradient" @click="modals.message.active=false">Close</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
  import PageLoader from '@/components/etc/PageLoaderArcs'
  import BusyPanel from '@/components/containers/BusyPanel'
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
        auth: null,
        loading: false,
        last_function_name: false,
        last_modal_name: false,
        regex: {
          address: /^0x[0-9a-f]{40}$/i,
          fullname: /^[a-z]([-']?[a-z]+\.?)*( ([a-z]\. )?[a-z]{2}([-']?[a-z]+)*)+\.?$/i,
          email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        },
        settings: {
          profile: {},
          security: {},
          recovery: {}
        },
        token: null,
        token_exp: 0,
        temp_value: '',
        modals: {
          change_pass: {
            active: false,
            loading: false,
            input_valid: false,
            npassword: {
              placeholder: 'Password',
              value: '',
              error: ''
            },
            rpassword: {
              placeholder: 'Retype Password',
              value: '',
              error: ''
            }
          },
          cqa_ticker: {
            active: false,
            input_touched: true,
            input_value: '0',
            input_valid: false,
            input_changed: false,
            loading: false,
            regex: {
              q: /[0-9a-z_\-()+=%$#@ ]{3,}\?/i,
              a: /.{6,}/
            },
            fields: {
              q1: {q: {placeholder: 'Question', value: '', error: ''}, a: {placeholder: 'Answer', value: '', error: '', type: 'password'}},
              q2: {q: {placeholder: 'Question', value: '', error: ''}, a: {placeholder: 'Answer', value: '', error: '', type: 'password'}},
              q3: {q: {placeholder: 'Question', value: '', error: ''}, a: {placeholder: 'Answer', value: '', error: '', type: 'password'}}
            }
          },
          message: {
            active: false,
            title: 'Message',
            body: 'undefined'
          },
          prompt_otp: {
            active: false,
            title: 'Prompt',
            body: 'undefined',
            method: 'put',
            loading: false,
            input_valid: false,
            field: {
              name: 'email',
              icon: 'fa fa-key',
              placeholder: '1234567',
              value: '',
              error: '',
              type: 'number',
              regex: /^[0-9]{7}$/i,
              regex_error: 'invalid format'
            },
            email: '',
            countdown: {
              limit: 60,
              count: 60,
              timer: null
            },
            button_text: 'Ok'
          },
          prompt_value: {
            active: false,
            title: 'Prompt',
            body: 'undefined',
            method: 'put',
            loading: false,
            input_valid: false,
            field: {
              icon: 'fa fa-comment-o',
              placeholder: 'Password',
              value: '',
              error: '',
              type: 'text'
            },
            button_text: 'Save',
            success_callback: false
          },
          prompt_verify_user: {
            active: false,
            input_valid: false,
            loading: false,
            next_method: null,
            next_method_params: null,
            field: {
              value: '',
              error: '',
              regex: /.{6,}/,
              regex_error: 'too short'
            },
            button_text: 'Submit'
          },
          two_factor_qr: {
            active: false,
            url: '',
            key: ''
          },
          two_factor_ticker: {
            active: false,
            loading: false,
            input_changed: false,
            input_value: null
          }
        }
      }
    },
    computed: {
      cqa_unsubmittable () {
        let _self = this.modals.cqa_ticker
        let unsubmittable = true
        if (!_self.loading && _self.input_touched && _self.input_valid) unsubmittable = false
        return unsubmittable
      }
    },
    methods: {
      fetch () {
        this.loading = true
        this.$http.get('settings').then((response) => {
          this.auth = true
          this.settings = response.body
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
      checkinput_update_password () {
        let errors = 0
        let _self = this.modals.change_pass
        if (_self.npassword.value.length === 0) {
          _self.npassword.error = ''
          errors++
        } else if (_self.npassword.value.length < 6) {
          _self.npassword.error = 'Too short'
          errors++
        } else {
          _self.npassword.error = ''
        }
        if (_self.rpassword.value.length === 0) {
          _self.rpassword.error = ''
          errors++
        } else if (_self.rpassword.value !== _self.npassword.value) {
          _self.rpassword.error = 'Missmatch'
          errors++
        } else {
          _self.rpassword.error = ''
        }
        if (errors > 0) {
          _self.input_valid = false
        } else {
          _self.input_valid = true
        }
      },
      checkinput_cqa_entry () {
        let modal = this.modals.cqa_ticker
        let errors = 0
        for (let key in modal.fields) {
          let qtn = modal.fields[key].q
          let ans = modal.fields[key].a
          // Validate question
          if (qtn.value.length === 0) {
            qtn.error = ''
            errors++
          } else if (!modal.regex.q.test(qtn.value)) {
            qtn.error = 'invalid format'
            errors++
            modal.input_changed = true
          } else {
            qtn.error = ''
          }
          // Validate answer
          if (ans.value.length === 0) {
            ans.error = ''
            errors++
          } else if (!modal.regex.a.test(ans.value)) {
            ans.error = 'too short'
            errors++
            modal.input_changed = true
          } else {
            ans.error = ''
          }
          // Validate all input
          if (errors > 0) {
            modal.input_valid = false
          } else {
            modal.input_valid = true
          }
          modal.input_touched = true
        }
      },
      checkinput_cqa_ticker () {
        let _self = this.modals.cqa_ticker
        if (_self.input_value !== this.settings.recovery.cqa.status) {
          _self.input_changed = true
          if (_self.input_value === '0') {
            _self.input_touched = true
            _self.input_valid = true
          } else {
            this.checkinput_cqa_entry()
          }
        } else {
          _self.input_changed = false
          this.checkinput_cqa_entry()
        }
      },
      checkinput_prompt_value (modalName) {
        let errors = 0
        let _self = this.modals.prompt_value
        if (modalName) _self = this.modals[modalName]
        if (_self.field.value.length === 0) {
          _self.field.error = ''
          errors++
        } else if (!_self.field.regex.test(_self.field.value)) {
          _self.field.error = _self.field.regex_error
          errors++
        } else {
          _self.field.error = ''
        }
        if (errors > 0) {
          _self.input_valid = false
        } else {
          _self.input_valid = true
        }
      },
      checkinput_2fa_ticker () {
        if (this.modals.two_factor_ticker.input_value !== this.settings.security.has_2fa) {
          this.modals.two_factor_ticker.input_changed = true
        } else {
          this.modals.two_factor_ticker.input_changed = false
        }
      },
      close_prompt_otp () {
        let _self = this.modals.prompt_otp
        _self.active = false
        clearInterval(_self.countdown.timer)
        _self.countdown.timer = null
      },
      close_prompt_verify_user () {
        this.modals.prompt_verify_user.active = false
        this.close_prompt_otp()
      },
      invoke_cqa_ticker (params = false, reauth = false) {
        this.last_function_name = 'invoke_cqa_ticker'
        this.last_modal_name = 'cqa_ticker'
        let _self = this.modals.cqa_ticker
        if (params) {
          if (params.input_value === '1') {
            _self.fields.q1.q.value = params.fields.q1.q
            _self.fields.q2.q.value = params.fields.q2.q
            _self.fields.q3.q.value = params.fields.q3.q
            _self.fields.q1.a.value = params.fields.q1.a
            _self.fields.q2.a.value = params.fields.q2.a
            _self.fields.q3.a.value = params.fields.q3.a
            this.checkinput_cqa_entry()
          } else {
            for (let item in _self.fields) {
              _self.fields[item].q.value = ''
              _self.fields[item].a.value = ''
              _self.fields[item].a.type = 'password'
            }
            _self.input_valid = true
          }
        } else {
          let settings = this.settings.recovery.cqa
          _self.input_value = this.settings.recovery.cqa.status
          if (settings.status === '0') {
            for (let item in _self.fields) {
              _self.fields[item].q.value = ''
              _self.fields[item].a.value = ''
              _self.fields[item].a.type = 'password'
            }
          } else {
            _self.fields.q1.q.value = settings.data.q1.q
            _self.fields.q2.q.value = settings.data.q2.q
            _self.fields.q3.q.value = settings.data.q3.q

            _self.fields.q1.a.value = settings.data.q1.a
            _self.fields.q2.a.value = settings.data.q2.a
            _self.fields.q3.a.value = settings.data.q3.a
          }
          _self.input_touched = false
          _self.input_changed = false
          _self.input_valid = false
        }
        _self.active = true
        if (reauth) setTimeout(this.submit_cqa_ticker, 320)
      },
      invoke_prompt_otp (value = '', reauth = false) {
        let _self = this.modals.prompt_otp
        _self.loading = false
        _self.field.value = value
        this.checkinput_prompt_value('prompt_otp')
        _self.active = true
        this.last_function_name = 'invoke_prompt_otp'
        let ticker = function () {
          let countdown = this.modals.prompt_otp.countdown
          if (countdown.count > 0) {
            countdown.count--
          } else {
            this.close_prompt_otp()
            this.modals.prompt_verify_user.active = false
          }
        }
        if (!_self.countdown.timer && !reauth) {
          _self.countdown.count = _self.countdown.limit
          this.modals.prompt_otp.countdown.timer = setInterval(ticker.bind(this), 1000)
        }
        if (reauth) {
          setTimeout(() => this.submit_prompt_otp(), 320)
        } else {
          setTimeout(() => this.$refs.prompt_otp_focus.focus(), 200)
        }
      },
      invoke_prompt_value (config = false, reauth = false) {
        let _self = this.modals.prompt_value
        _self.loading = false
        _self.field.value = ''
        _self.field.error = ''
        _self.input_valid = false
        _self.route = null
        _self.method = 'put'
        _self.button_text = 'Save'
        _self.extra_data = null
        _self.input_name = null
        _self.replace_value_key = false
        _self.submit_function = null
        _self.success_callback = null
        if (config) {
          _self.title = config.title
          _self.body = config.body
          _self.field.icon = config.icon
          _self.field.placeholder = config.field_placeholder
          _self.field.regex = config.field_regex
          _self.field.regex_error = config.field_regex_error
          _self.field.name = config.field_name
          _self.field.type = config.field_type
          if (config.route) _self.route = config.route
          if (config.method) _self.method = config.method
          if (config.button_text) _self.button_text = config.button_text
          if (config.extra_data) _self.extra_data = config.extra_data
          if (config.field_value) _self.field.value = config.field_value
          if (config.input_name) _self.input_name = config.input_name
          if (config.replace_value_key) _self.replace_value_key = true
          if (config.success_callback) _self.success_callback = config.success_callback
          if (config.submit_function) _self.submit_function = config.submit_function
        }
        _self.active = false
        setTimeout(() => { _self.active = true; this.checkinput_prompt_value() }, 10)
        setTimeout(() => this.$refs.prompt_value_focus.focus(), 200)
        if (reauth) setTimeout(() => this.submit_prompt_value(), 320)
      },
      invoke_prompt_verify_user (callback = null, params = null, reauth = false) {
        if (this.last_modal_name) this.modals[this.last_modal_name].active = false
        let _self = this.modals.prompt_verify_user
        let now = Math.round((new Date()).getTime() / 1000)
        if (now > this.token_exp) {
          _self.field.value = ''
          _self.next_method = callback
          _self.next_method_params = params
          _self.next_method_submit = reauth
          _self.active = true
          this.checkinput_prompt_value('prompt_verify_user')
          setTimeout(() => this.$refs.prompt_verify_user_focus.focus(), 200)
        } else {
          this[callback](params, reauth)
        }
      },
      invoke_update_email_2nd (value) {
        this.last_modal_name = 'prompt_value'
        let config = {
          method: 'post',
          route: 'account/email_verify',
          icon: 'fa fa-envelope',
          title: 'Secondary Email',
          body: 'Enter a secondary email.',
          field_placeholder: 'user@example.com',
          field_regex: this.regex.email,
          field_regex_error: 'invalid address',
          field_type: 'email',
          button_text: 'Next',
          extra_data: {type: 'secondary'},
          callback: function (response) {
            this.secret = response.body.secret
            this.modals.prompt_value.active = false
            setTimeout(() => this.update_email_2nd(), 1)
          }
        }
        this.last_function_name = 'invoke_update_email_2nd'
        if (value) config.field_value = value
        this.invoke_prompt_value(config)
      },
      invoke_2fa_qr (url, key) {
        this.last_modal_name = 'two_factor_qr'
        let _self = this.modals.two_factor_qr
        _self.url = url
        _self.key = key
        _self.active = true
      },
      invoke_2fa_ticker (snapshot = false, reauth = false) {
        this.last_modal_name = 'two_factor_ticker'
        if (snapshot) {
          this.modals.two_factor_ticker.input_changed = snapshot.input_changed
          this.modals.two_factor_ticker.input_value = snapshot.input_value
        } else {
          this.modals.two_factor_ticker.input_changed = false
          this.modals.two_factor_ticker.input_value = this.settings.security.has_2fa
        }
        this.checkinput_2fa_ticker()
        this.modals.prompt_value.active = false
        this.modals.two_factor_ticker.active = true
        if (reauth) setTimeout(this.submit_2fa_ticker, 200)
      },
      show_message (title, body) {
        this.modals.message.title = title
        this.modals.message.body = body
        this.modals.message.active = true
      },
      submit_update_password () {
        let _self = this.modals.change_pass
        if (_self.input_valid) {
          _self.loading = true
          let data = {
            token: this.token,
            value: _self.npassword.value
          }
          this.$http.put('settings/password', data).then(response => {
            _self.loading = false
            _self.active = false
            this.$store.commit('updateUser', response.body.user)
            this.$noty.success('New password saved.')
            this.fetch()
          }).catch(response => {
            _self.loading = false
            try {
              if (response.status === 401) {
                this.token_exp = 0
                let params = {
                  npassword: _self.npassword.value,
                  rpassword: _self.rpassword.value
                }
                this.invoke_prompt_verify_user('update_password', params, true)
              } else {
                _self.npassword.error = response.body.error.data.value[0]
              }
            } catch (e) {
              this.$noty.error('Unknown error has occured')
              console.log(e)
            }
          })
        }
      },
      submit_cqa_ticker () {
        let _self = this.modals.cqa_ticker
        if (_self.input_valid) {
          let data = {
            token: this.token,
            value: {
              status: _self.input_value,
              data: {
                q1: {}, q2: {}, q3: {}
              }
            }
          }
          if (data.value.status === '1') {
            for (let item in _self.fields) {
              data.value.data[item].q = _self.fields[item].q.value
              data.value.data[item].a = _self.fields[item].a.value
            }
          }
          _self.loading = true
          this.$http.put('settings/cqas', data).then(response => {
            _self.loading = false
            _self.active = false
            this.$noty.success('Challenge questions updated.')
            this.fetch()
          }).catch(response => {
            _self.loading = false
            try {
              if (response.status === 401) {
                this.token_exp = 0
                let params = { fields: data.value.data, input_touched: _self.input_touched, input_changed: _self.input_changed, input_value: _self.input_value }
                this.invoke_prompt_verify_user(this.last_function_name, params, true)
              } else {
                if (typeof response.body.error.data === 'object') {
                  for (let errorItem in response.body.error.data) {
                    _self.fields[errorItem].q.error = response.body.error.data[errorItem][0]
                    _self.fields[errorItem].a.error = response.body.error.data[errorItem][1]
                  }
                } else {
                  this.$noty.error('Unknown response')
                }
              }
            } catch (e) {
              this.$noty.error('Unknown error has occured')
              console.log(e)
            }
          })
        }
      },
      submit_2fa_ticker () {
        if (this.modals.two_factor_ticker.input_changed) {
          this.modals.two_factor_ticker.loading = true
          if (this.modals.two_factor_ticker.input_value === '0') {
            let data = {
              token: this.token,
              value: {key: '', status: '0'}
            }
            this.$http.put('settings/has_2fa', data).then(response => {
              this.modals.two_factor_ticker.loading = false
              this.modals.two_factor_ticker.active = false
              this.$noty.success('2FA is now disabled.')
              this.fetch()
            }).catch(response => {
              this.modals.two_factor_ticker.loading = false
              try {
                if (response.status === 401) {
                  let snapshot = {
                    input_changed: true,
                    input_value: '0'
                  }
                  this.token_exp = 0
                  this.invoke_prompt_verify_user('invoke_2fa_ticker', snapshot, true)
                } else {
                  if (response.body.error) {
                    this.$noty.error('Unknown error occured')
                  }
                }
              } catch (e) {
                this.$noty.error('Unexpected response')
                console.log(e)
              }
            })
          } else {
            this.$http.get('settings/new_2fa').then(response => {
              this.modals.two_factor_ticker.loading = false
              this.modals.two_factor_ticker.active = false
              this.invoke_2fa_qr(response.body.url, response.body.key)
            }).catch(response => {
              this.modals.two_factor_ticker.loading = false
              try {
                if (response.status === 401) {
                  let snapshot = {
                    input_changed: true,
                    input_value: 0
                  }
                  this.token_exp = 0
                  this.invoke_prompt_verify_user('invoke_2fa_qr', snapshot, true)
                } else {
                  if (response.body.error) {
                    this.$noty.error('Unknown error occured')
                  }
                }
              } catch (e) {
                this.$noty.error('Unexpected response')
                console.log(e)
              }
            })
          }
        }
      },
      submit_prompt_otp () {
        let _self = this.modals.prompt_otp
        if (_self.input_valid) {
          _self.loading = true
          let data = { token: this.token, value: _self.email, otp: _self.field.value }
          this.$http.put('settings/' + _self.field.name, data).then(response => {
            try {
              _self.loading = false
              _self.active = false
              if (typeof response.body.user !== 'undefined') this.$store.commit('updateUser', response.body.user)
              this.$noty.success('New email saved.')
              this.fetch()
            } catch (e) {
              console.log(e)
            }
          }).catch(response => {
            _self.loading = false
            try {
              if (response.status === 401) {
                _self.active = false
                this.token_exp = 0
                this.invoke_prompt_verify_user(this.last_function_name, _self.field.value, true)
              } else {
                try {
                  for (let errorItem in response.body.error.data) {
                    _self.field.error = response.body.error.data[errorItem][0]
                    break
                  }
                } catch (e) {
                  this.$noty.error('Unknown error occurred.')
                }
              }
            } catch (e) {
              this.$noty.error('Unknown error occurred.')
              console.log(e)
            }
          })
        }
      },
      submit_prompt_value () {
        let _self = this.modals.prompt_value
        if (_self.input_valid) {
          if (_self.submit_function) {
            _self.submit_function.call(this)
          } else {
            _self.loading = true
            let route = _self.route ? _self.route : 'settings/' + _self.field.name
            let data = {token: this.token}
            let method = _self.method
            if (_self.extra_data) data = Object.assign(data, _self.extra_data)
            if (_self.input_name) {
              if (_self.replace_value_key) {
                data[_self.input_name] = _self.field.value
              } else {
                data.value[_self.input_name] = _self.field.value
              }
            } else {
              data.value = _self.field.value
            }
            this.$http[method](route, data).then(response => {
              let field = _self.field.name
              _self.loading = false
              _self.active = false
              try {
                if (typeof response.body.user !== 'undefined') this.$store.commit('updateUser', response.body.user)
                if (_self.success_callback) {
                  _self.success_callback.call(this, response)
                } else {
                  this.$noty.success('New ' + field + ' saved.')
                  this.fetch()
                }
              } catch (e) {
                console.log('Error occurred inside success block.')
                console.log(e)
              }
            }).catch(response => {
              _self.loading = false
              try {
                if (response.status === 401) {
                  this.token_exp = 0
                  this.invoke_prompt_verify_user(this.last_function_name, _self.field.value, 'yes')
                } else {
                  for (let errorItem in response.body.error.data) {
                    _self.field.error = response.body.error.data[errorItem][0]
                    break
                  }
                }
              } catch (e) {
                this.$noty.error('Unknown error occurred.')
                console.log(e)
              }
            })
          }
        }
      },
      submit_prompt_verify_user () {
        let _self = this.modals.prompt_verify_user
        _self.loading = true
        this.$http.post('settings/auth', { password: _self.field.value }).then(response => {
          _self.loading = false
          _self.active = false
          this.token = response.body.token
          this.token_exp = Math.round((new Date()).getTime() / 1000) + (60 * 3)
          this[_self.next_method](_self.next_method_params, _self.next_method_submit)
        }).catch(response => {
          _self.loading = false
          try {
            for (let errorItem in response.body.error.data) {
              _self.field.error = response.body.error.data[errorItem][0]
              break
            }
          } catch (e) {
            this.$noty.error('Unexpected response.')
            console.log(e)
          }
        })
      },
      switch_answer_visibility (qn) {
        let modal = this.modals.cqa_ticker
        if (modal.fields[qn].a.type === 'text') {
          modal.fields[qn].a.type = 'password'
        } else {
          modal.fields[qn].a.type = 'text'
        }
      },
      switch_answer_icon (qn) {
        let modal = this.modals.cqa_ticker
        let icon = 'fa-eye'
        if (modal.fields[qn].a.type === 'text') {
          icon = 'fa-eye-slash'
        }
        return icon
      },
      // update_address (value = false, reauth = false) {
      //   let config = {
      //     icon: 'fa fa-address-card',
      //     title: 'Change Address',
      //     body: 'Enter a new address.',
      //     field_placeholder: this.settings.profile.address,
      //     field_regex: this.regex.address,
      //     field_regex_error: 'invalid address',
      //     field_name: 'address',
      //     field_type: 'text'
      //   }
      //   this.last_function_name = 'update_address'
      //   this.last_modal_name = 'prompt_value'
      //   if (value) config.field_value = value
      //   this.invoke_prompt_value(config, reauth)
      // },
      // update_email (value = false, reauth = false) {
      //   let config = {
      //     method: 'post',
      //     route: 'account/email_verify',
      //     icon: 'fa fa-envelope',
      //     title: 'Change Email',
      //     body: 'Enter a new email.',
      //     field_placeholder: this.settings.profile.email,
      //     field_regex: this.regex.email,
      //     field_regex_error: 'invalid format',
      //     field_type: 'email',
      //     extra_data: {type: 'primary'},
      //     success_callback: function (response) {
      //       this.verify_otp_email(response)
      //     }
      //   }
      //   this.last_function_name = 'update_email'
      //   this.last_modal_name = 'prompt_value'
      //   if (value) config.field_value = value
      //   this.invoke_prompt_value(config, reauth)
      // },
      update_email_2nd (value = false, reauth = false) {
        let config = {
          method: 'post',
          route: 'account/email_verify',
          icon: 'fa fa-envelope',
          title: 'Secondary Email',
          body: 'Enter a new email.',
          field_placeholder: 'user@example.com',
          field_regex: this.regex.email,
          field_regex_error: 'invalid format',
          field_type: 'email',
          extra_data: {type: 'secondary'},
          success_callback: function (response) {
            this.verify_otp_email_2nd(response)
          }
        }
        this.last_function_name = 'update_email_2nd'
        this.last_modal_name = 'prompt_value'
        if (value) config.field_value = value
        this.invoke_prompt_value(config, reauth)
      },
      update_name (value = false, reauth = false) {
        let config = {
          icon: 'fa fa-user',
          title: 'Change Name',
          body: 'Enter a new name. Full name is required.',
          field_placeholder: this.settings.profile.name,
          field_regex: this.regex.fullname,
          field_regex_error: 'not a fullname',
          field_name: 'name',
          field_type: 'text'
        }
        this.last_function_name = 'update_name'
        this.last_modal_name = 'prompt_value'
        if (value) config.field_value = value
        this.invoke_prompt_value(config, reauth)
      },
      verify_otp_email (response = null, reauth = false) {
        let _self = this.modals.prompt_otp
        _self.title = 'Verify Email'
        _self.body = 'Enter the 7 digit verification number sent to new email.'
        _self.field.name = 'email'
        if (typeof response.body.data.email === 'string' && response.body.data.expiry) {
          _self.email = response.body.data.email
          _self.countdown.limit = response.body.data.expiry
        } else {
          _self.email = ''
          _self.countdown.limit = 60
        }
        this.last_function_name = 'verify_otp_email'
        this.invoke_prompt_otp('', reauth)
      },
      verify_otp_email_2nd (response = null, reauth = false) {
        let _self = this.modals.prompt_otp
        _self.title = 'Verify Email'
        _self.body = 'Enter the 7 digit verification number sent to new email.'
        _self.field.name = 'secondary_email'
        if (typeof response.body.data.email === 'string') {
          this.modals.prompt_otp.email = response.body.data.email
        } else {
          this.modals.prompt_otp.email = ''
        }
        this.last_function_name = 'verify_otp_email_2nd'
        this.invoke_prompt_otp('', reauth)
      },
      verify_otp_2fa (value = false, reauth = false) {
        let config = {
          icon: 'fa fa-key',
          title: 'Verify OTP',
          body: 'Enter the 6 digit OTP.',
          field_placeholder: '123456',
          field_regex: /^[0-9]{6}$/i,
          field_regex_error: 'invalid format',
          field_name: 'has_2fa',
          field_type: 'number',
          extra_data: {
            value: {
              key: this.modals.two_factor_qr.key,
              status: '1'
            }
          },
          input_name: 'otp'
        }
        this.last_function_name = 'verify_otp_2fa'
        this.last_modal_name = 'prompt_value'
        if (value) config.field_value = value
        this.modals.two_factor_qr.active = false
        this.invoke_prompt_value(config, reauth)
      },
      update_password (params = false, reauth = false) {
        this.last_function_name = 'update_password'
        this.last_modal_name = 'change_pass'
        let _self = this.modals.change_pass
        _self.loading = false
        if (params) {
          if (params.npassword) _self.npassword.value = params.npassword
          if (params.rpassword) _self.rpassword.value = params.rpassword
        } else {
          _self.npassword.value = ''
          _self.rpassword.value = ''
        }
        this.modals.prompt_value.active = false
        _self.active = true
        this.checkinput_update_password()
        setTimeout(() => this.$refs.change_pass_focus.focus(), 200)
        if (reauth) {
          setTimeout(() => this.submit_update_password(), 200)
        }
      }
    },
    components: { PageLoader, BusyPanel }
  }
</script>

<style scoped>
  @media (max-width:768px) {
    .eth-address {
      display: none;
    }
  }
  .button.is-gradient {
    min-width: 73px;
  }
  .control.has-icons-left {
    width: 100%;
  }
  .cqa_ticker_inputs {
    padding-left: 1px;
  }
  .cqa_ticker_inputs table.cqa_ticker:last-child {
    margin-bottom: 0px;
  }
  table.cqa_ticker {
    width: 100%;
    margin-bottom: 10px;
  }
  table.cqa_ticker td {
    vertical-align: middle;
    padding-bottom: 8px;
  }
  table.cqa_ticker td:first-child {
    width: 32px;
  }
  .control-button {
    border: 1px solid #ccc;
    padding: 0px 5px;
    margin-left: 5px;
    border-radius: 4px;
    float: right;
    cursor: pointer;
    opacity: 0.75;
  }
  .control-button:hover {
    border-color: #bbb;
    background: white;
    opacity: 1;
  }
  .modal.casual .modal-card {
    max-width: 430px;
  }
  .modal-paragraph ul {
    padding-left: 15px;
  }
  .notification {
    padding: 8px 15px;
    margin-bottom: 10px;
  }
  .qr-manual {
    border: 2px dashed #555;
    padding: 2px 5px;
    font-size: 1.2rem;
    font-family:monospace,monospace;
    font-weight: bold
  }
  .tooltip {
    float: right;
  }
  .info-text {
    margin-bottom: 15px;
    line-height: 1;
  }
  .is-bordered-inside tr:first-child td {
    border-top-style: none;
  }
  .q-item-number {
    color: white;
    display: inline-block;
    background-color: #3273dc;
    padding: 2px 6px;
    line-height: 1;
    border-radius: 50%;
  }
  td:first-child {
    width: 30%;
  }
</style>
