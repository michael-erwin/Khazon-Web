<template>
  <div v-show="active" class="qr-scanner">
    <div class="qr-screen">
      <QrcodeReader v-if="active" @init="onInit" @decode="onDecode" class="qr-camera"></QrcodeReader>
      <div v-show="!init" class="camera-status-box">
        <div class="camera-status-text">{{status_text}}</div>
      </div>
      <div v-show="init" class="scan-mark">
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>
        <div class="redline"></div>
      </div>
    </div>
    <div class="qr-controls">
      <a class="button is-gradient" @click="cancelScan()">
        Cancel
      </a>
    </div>
  </div>
</template>

<script>
import { QrcodeReader } from 'vue-qrcode-reader'
export default {
  props: {
    active: null
  },
  data () {
    return {
      init: false,
      status_text: 'Initializing...',
      paused: false
    }
  },
  methods: {
    async onInit (promise) {
      this.status_text = 'Initializing...'
      this.init = false
      try {
        await promise
        // successfully initialized
        this.status_text = 'Init success'
        this.init = true
      } catch (error) {
        this.status_text = error.message
      } finally {
        // hide loading indicator
      }
    },
    onDecode (data) {
      this.$emit('decoded', data)
    },
    cancelScan () {
      this.$emit('canceled')
    }
  },
  components: { QrcodeReader }
}
</script>

<style>
.qrcode-reader__camera {
  display: inline-block;
  max-width: 540px !important;
}
</style>

<style scoped>
.qr-scanner {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0; left: 0;
  z-index: 9999;
  background-color: black;
}
.qr-screen {
  display: table;
  width: 100%;
  height: 100%;
}
.qr-camera {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}
.qr-controls {
  position: absolute;
  bottom: 0px;
  text-align: center;
  display: block;
  width: 100%;
  padding: 25px;
}
.camera-status-text {
  color: white;
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}
.camera-status-box {
  display: table;
}
.camera-status-box,
.scan-mark {
  width: 220px;
  height: 220px;
  position: absolute;
  top: calc(50% - 110px);
  left: calc(50% - 110px);
}
.scan-mark .redline {
  position: relative;
  top: 50%;
  width: 100%;
  height: 0;
  border-top: 1px solid #ff2000;
  animation: blinker 1s linear infinite;
}
.scan-mark .corner {
  width: 50px; height: 50px;
  position: absolute;
  border-width: 4px;
  border-color: transparent;
  border-style: solid;
}
.scan-mark .corner.tl {
  top: 0px; left: 0px;
  border-top-color: lime !important;
  border-left-color: lime;
}
.scan-mark .corner.tr {
  top: 0px; right: 0px;
  border-top-color: lime;
  border-right-color: lime;
}
.qr-scanner .scan-mark .corner.bl {
  bottom: 0px; left: 0px;
  border-bottom-color: lime;
  border-left-color: lime;
}
.qr-scanner .scan-mark .corner.br {
  bottom: 0px; right: 0px;
  border-bottom-color: lime;
  border-right-color: lime;
}
@keyframes blinker {
  0% { opacity: 0; }
  45% { opacity: 0; }
  50% { opacity: 1; }
  55% { opacity: 0; }
  100% { opacity: 0; }  
}
</style>

