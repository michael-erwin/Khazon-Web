<template>
  <div class="navbar-item has-dropdown" :class="{'is-active':dropdown_active}">
    <a class="navbar-link" tabindex="1" @focus="dropdown_active=true" @blur="dropdown_active=false">
      <i class="fa fa-user-circle" aria-hidden="true"></i>&nbsp;&nbsp;{{user.name}}
    </a>
    <div class="navbar-dropdown animated">
      <a to="settings" class="navbar-item" @mousedown="settings()">
        <i class="fa fa-wrench"></i>&nbsp;&nbsp;Settings
      </a>
      <a class="navbar-item" @mousedown="signout()">
        <i class="fa fa-sign-out"></i>&nbsp;&nbsp;Signout
      </a>
    </div>
  </div>
</template>

<script>
export default {
  beforeMount: function () {
    this.$store.commit('updateUser')
  },
  data () {
    return {
      'dropdown_active': false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  methods: {
    signout () {
      this.$router.push('/signout')
    },
    settings () {
      this.$router.push('/account/settings')
    }
  }
}
</script>

<style scoped>
  .navbar-link:focus {
    outline: none;
  }
  .navbar-item.has-dropdown:hover .navbar-link,
  .navbar-item.has-dropdown.is-active .navbar-link {
    color: #0a0a0a;
    background-color: white !important;
  }
  .navbar-item.has-dropdown.is-active .navbar-link:after {
    border-color: #3273dc;
  }
  @media (min-width: 1024px) {
    .navbar-dropdown {
      border: 1px solid #d9d9d9;
      border-radius: 4px !important;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
    }
    .navbar-dropdown:before,
    .navbar-dropdown:after {
      display: block;
      content: "";
      border: 10px solid transparent;
      position: absolute; right: 11px;
      border-bottom-color: white !important;
    }
    .navbar-dropdown:before {
      top: -21px;
      border-bottom-color: #d5d5d5 !important;
      z-index: 1;
    }
    .navbar-dropdown:after {
      top: -20px;
      border-bottom-color: white !important;
      z-index: 2;
    }
    .navbar-dropdown.animated {
      animation: fadeIn 500ms;
      -webkit-animation: fadeIn 500ms;      
    }
  }
</style>
