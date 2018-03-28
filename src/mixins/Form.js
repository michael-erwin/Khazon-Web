export const Form = {
  data () {
    return {
      regex: {
        fullname: /^[a-z]([-']?[a-z]+\.?)*( ([a-z]\. )?[a-z]{2}([-']?[a-z]+)*)+\.?$/i,
        email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        ethaddr: /^0x[0-9a-f]{40}$/i,
        cuk: /^[A-Z0-9]{5}(-[A-Z0-9]{5}){4}$/,
        otp: /^\d{6}$/
      },
      dirty: false,
      validated: false,
      loading: false,
      errormsg: ''
    }
  },
  methods: {
    disableForm () {
      let links = document.querySelectorAll('a[href]')
      let inputs = document.querySelectorAll('input')
      let buttonClass = document.querySelectorAll('.button')
      let buttons = document.querySelectorAll('button')
      for (let i = 0; i < links.length; i++) {
        links[i].setAttribute('style', 'color:#7a7a7a')
      }
      for (let i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true
        inputs[i].blur()
      }
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('disabled', 'disabled')
      }
      for (let i = 0; i < buttons.length; i++) {
        buttonClass[i].setAttribute('disabled', 'disabled')
      }
    },
    enableForm () {
      let links = document.querySelectorAll('a[href]')
      let inputs = document.querySelectorAll('input')
      let buttonClass = document.querySelectorAll('.button')
      let buttons = document.querySelectorAll('button')
      for (let i = 0; i < links.length; i++) {
        links[i].removeAttribute('style')
      }
      for (let i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false
      }
      for (let i = 0; i < buttonClass.length; i++) {
        buttonClass[i].removeAttribute('disabled')
      }
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].removeAttribute('disabled')
      }
    },
    resetForm (id) {
      let form = id ? document.querySelector('#' + id) : document.querySelector('form')
      for (let field in this.fields) {
        if (typeof this.fields[field] === 'object') {
          this.fields[field].value = ''
          this.fields[field].error = ''
        } else {
          this.fields[field] = false
        }
      }
      this.dirty = false
      form.reset()
    },
    getFields () {
      let data = {}
      for (let field in this.fields) {
        if (typeof this.fields[field] === 'object') {
          data[field] = this.fields[field].value
        } else {
          if (this.fields[field]) data[field] = this.fields[field]
        }
      }
      return data
    }
  }
}
