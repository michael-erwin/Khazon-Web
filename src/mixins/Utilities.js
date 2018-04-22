import QRCode from 'qrcode.vue'
var Qr = {
  data () {
    return {
      modals: {
        qr: {
          active: false,
          value: 'not set'
        }
      }
    }
  },
  methods: {
    show_qr (qrValue) {
      this.modals.qr.value = qrValue
      this.modals.qr.active = true
    }
  },
  components: {QRCode}
}
var FullScreenCtl = {
  data () {
    return {
      browser_prefix: ''
    }
  },
  created () {
    if (document.webkitFullscreenEnabled) {
      this.browser_prefix = 'webkit'
    } else if (document.mozFullScreenEnabled) {
      this.browser_prefix = 'moz'
    } else if (document.msFullscreenEnabled) {
      this.browser_prefix = 'ms'
    }
  },
  methods: {
    makeFullScreen (elem) {
      elem[this.browser_prefix + 'RequestFullscreen']()
    },
    exitFullScreen () {
      if (this.browser_prefix === 'mox') {
        document.mozCancelFullScreen()
      } else {
        document[this.browser_prefix + 'ExitFullscreen']()
      }
    }
  }
}
var Earnings = {
  data () {
    return {
      kta_precision: 2
    }
  },
  methods: {
    translate_code (code) {
      let translation = ''
      if (code === 'safe') {
        translation = 'safe completed'
      } else if (code === 'ref_1') {
        translation = 'referral direct'
      } else if (code === 'ref_2') {
        translation = 'referral lvl 2'
      } else if (code === 'ref_3') {
        translation = 'referral lvl 3'
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
  components: {QRCode}
}
export { Earnings, FullScreenCtl, Qr }
