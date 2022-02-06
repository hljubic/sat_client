<template>
  <div class="container">
    <div class="md-layout">
      <div class="md-layout-item">
        <md-toolbar md-elevation="0">
          <div class="md-layout md-alignment-center-left">
            <img src="/icons/fpmoz_128.png" alt="Avatar">
            <h3 class="md-title">Postavke</h3>
          </div>
        </md-toolbar>
      </div>
    </div>
    <div class="inner-container">
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
    };
  },
  created () {
  },
  methods: {
    saveSettings () {
    }
  }
};
</script>

<style scoped>
  .inner-container {
    padding: 20px;
  }

  .button__container {
    display: flex;
    justify-content: flex-end;
  }

  img { width: 32px; }
</style>
