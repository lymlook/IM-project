// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Api from './router/Api'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import qs from 'qs'
import axios from 'axios'
import VueAxios from "vue-axios"
import VueCookies from 'vue-cookies'
import loginOut from './common/loginOut'


Vue.config.productionTip = false
Vue.prototype.Api = Api.serverUrl // 注册全局api
Vue.use(ElementUI)
Vue.use(VueAxios, axios)
Vue.use(VueCookies)
Vue.prototype.$axios = axios;
Vue.prototype.$qs = qs
axios.defaults.withCredentials = true // 设置允许携带cookie
Vue.use(loginOut)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
