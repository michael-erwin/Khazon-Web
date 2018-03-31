<template>
  <div class="form-box animated fadeIn" :class="{busy:disabled}">
    <slot></slot>
    &nbsp;
    <div class="no-interact"></div>
  </div>
</template>

<style scoped>
  input {
    -webkit-transition: background 700ms, border 700ms;
    transition: background 800ms, border 800ms;
    background-color: rgba(50,50,50,0.35) !important;
    color: white;
  }
  input:disabled {
    border-color: #7a7a7a;
  }
  input:focus {
    background-color: rgba(30,30,30,0.5) !important;
  }
  input:focus:not(.is-danger) {
    border-color: rgb(62, 168, 255);
  }
  input:focus ~ .icon.is-left>i:before {
    color: rgb(62, 168, 255);
  }
  input::placeholder {
    color: rgba(255,255,255,0.5);
  }
  a:not([disabled]):not(.button):hover {
    color: rgb(62, 168, 255);
  }
  .box-footer {
    margin-right: -15px;
    margin-bottom: -40px;
    margin-left: -15px;
    background-color: rgba(0,0,0,0.45);
    padding: 5px;
    position: relative;
  }
  .box-footer:before {
    content: "";
    display: block;
    width: 100%;
    position: absolute;
    top: -1px; left: 0;
    border-bottom: 1px solid rgba(255,255,255,0.25);
    border-top: 1px solid rgba(0,0,0,1);
  }
  .box-footer>p {
    padding-left: 8px;
    padding-right: 8px;
  }
  .has-addons .button {
    background-color: rgba(255,255,255, 0.5) !important;
  }
  .has-addons a.button:hover {
    color: #222;
    border-color: white;
  }
  .title {
    color: white;
    font-weight: normal;
  }
  .tickers:hover input[type=checkbox]:not([disabled]):not(:checked) ~ .mark {
    border-color: white !important;
  }
  .tickers {
    color: rgba(255,255,255,0.5);
  }
  .tickers input:checked ~ *,
  .tickers:hover input:not([disabled]):not(:checked) ~ *,
  .checkbox:hover, .radio:hover {
    color: rgba(255,255,255,1) !important;
  }
  .form-box {
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    background-color: rgba(50,50,50,0.35);
    padding: 15px;
    border: 1px solid #f0f0f0;
    margin-top: 15px;
    border-radius: 4px;
    color: white;
  }
  @media (max-width: 430px) {
    .form-box {
      margin-left: calc(0.75rem + 5px);
      margin-right: calc(0.75rem + 5px);
    }
  }
</style>

<script>
  export default {
    props: {
      disabled: false
    }
  }
</script>