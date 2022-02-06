import Vue from 'vue';
import App from './App';
import {  MdToolbar } from 'vue-material/dist/components';

Vue.use(MdToolbar);

global.browser = require('webextension-polyfill');
Vue.prototype.$browser = global.browser;

/* eslint-disable no-new */
let popup = new Vue({
  el: '#app',

  render: h => h(App)
});
