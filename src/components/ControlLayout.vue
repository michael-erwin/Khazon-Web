<template>
  <div id="portal_wrapper">
    <header>
      <nav class="navbar" role="navigation">
        <div class="container">
          <div class="navbar-brand">
            <span class="navbar-item" style="font-size:1.8rem">
              <router-link to="/">
                <object data="/static/logo.svg" type="image/svg+xml" class="logo-icon" />
                <span class="logo-text">Khazon</span>
              </router-link>
            </span>
            <div class="navbar-burger" :class="{'is-active':menu_active}" @click="menu_active=!menu_active">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="navbar-menu" :class="{'is-active':menu_active}" @click="menu_active=!menu_active">
            <div class="navbar-start">
              <NavMenuAuth v-if="auth||auth===null"></NavMenuAuth>
            </div>
            <div class="navbar-end">
              <!-- <slot name="nav-right"></slot> -->
              <NavAccountAuth v-if="auth||auth===null" slot="nav-right"></NavAccountAuth>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <div class="header-spacer"></div>
    <main>
      <router-view />
    </main>
    <footer>
      <div class="container">
        <div class="content has-text-centered">
          Khazon Inc. &copy; {{year}}
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
  .navbar-item {
    padding-top:0;
    padding-bottom:0;
  }
  .navbar-item .logo-icon {
    width: 32px;
    height: 32px;
    opacity: 0.8;
    display: inline-block;
    position: relative;
    top: 5px;
  }
  .navbar-item .logo-text {
    display: inline-block;
    position: relative;
    top: -1px;
  }
  .table.is-hoverable.is-striped tbody tr:not(.is-selected):hover {
    background-color: #eaf8fe;
  }
  .modal-background {
    background-color: rgba(0,10,25,0.8);
  }
  .modal-card-head, .modal-card-foot {
    background-color: white;
  }
  .page-loader {
    width: 100px !important;
    height: 100px !important;
    margin-left: auto;
    margin-right: auto;
    margin-top: 100px
  }
  .panel {
    -webkit-box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.05);
    box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.05);
    animation: fadeIn 600ms;
  }
  .panel-heading,
  .panel-heading .dropdown,
  .panel-block  {
    background-color: white !important;
  }
  .mx-datepicker-popup.animated,
  .panel-heading .dropdown.animated {
    animation: fadeIn 500ms;
    -webkit-animation: fadeIn 500ms;      
  }
  .panel-heading input[type=text],
  .panel-heading .dropdown {
    border-radius: 3px;
  }
  .panel.card-box .panel-block {
    border-radius: 3px;
    border-width: 0;
    color: white;
  }
  .panel-block.block-footer {
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
  }
  .card-box.blue .panel-block {
    background: -moz-linear-gradient(-45deg, rgba(56,168,237,1) 0%, rgba(32,156,238,1) 100%);
    background: -webkit-linear-gradient(-45deg, rgba(56,168,237,1) 0%,rgba(32,156,238,1) 100%);
    background: linear-gradient(135deg, rgb(108, 196, 252) 0%,rgba(32,156,238,1) 100%);
  }
  .card-box.pink .panel-block {
    background: -moz-linear-gradient(-45deg, rgba(249,94,123,1) 0%, rgba(255,56,96,1) 100%);
    background: -webkit-linear-gradient(-45deg, rgba(249,94,123,1) 0%,rgba(255,56,96,1) 100%);
    background: linear-gradient(135deg, rgba(249,94,123,1) 0%,rgba(255,56,96,1) 100%);
  }
  .card-box.lime .panel-block {
    background: -moz-linear-gradient(-45deg, rgba(78,206,187,1) 0%, rgba(0,201,171,1) 100%);
    background: -webkit-linear-gradient(-45deg, rgba(78,206,187,1) 0%,rgba(0,201,171,1) 100%);
    background: linear-gradient(135deg, rgba(78,206,187,1) 0%,rgba(0,201,171,1) 100%);
  }
  @media(max-width: 768px) {
    .panel.card-box {
      margin-left: 5px !important;
      margin-right: 5px !important;
    }
  }
</style>

<style scoped>
  #portal_wrapper {
    background-color: #f5f5f5;
  }
  #app>div>header {
    width: 100%;
    border-bottom: 1px solid #ccc;
    position: fixed;
    top: 0; left: 0;
    z-index: 9999;
  }
  #app>div>header .navbar-brand a {
    color: #555;
  }
  #app>div>header .navbar-start,
  #app>div>header .navbar-end {
    align-items: center;
  }
  #app>div>header~.header-spacer {
    height: 65px;
  }
  #app>div>main {
    min-height: calc(100vh - 106px);
  }
  #app>div>footer {
    border-top: 1px solid #ccc;
    background-color: white;
  }
</style>

<script>
  import NavAccountAuth from '@/components/containers/NavAccountAuth'
  import NavMenuAuth from '@/components/containers/NavMenuAuth'
  export default {
    mounted () {
      this.$noty.setOptions({theme: 'sunset', timeout: 3000})
    },
    data () {
      return {
        auth: null,
        menu_active: false
      }
    },
    components: { NavAccountAuth, NavMenuAuth },
    computed: {
      year () {
        return (new Date()).getFullYear()
      }
    }
  }
</script>