<template>
  <div class="column">
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<style>
  .error-code {
    font-size: 10rem;
    line-height: 1;
  }
  .error-text {
    font-size: 2rem;
    line-height: 1;
    margin-bottom: 25px;
  }
  .error-message {
    color: white;
    padding: 1rem;
    background-color: #FE3860;
    border-radius: 5px;
    margin-bottom: 25px;
  }
  .error-code,
  .error-text,
  .error-message,
  .error-link {
    text-align: center;
  }
</style>
