import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import uView from 'uview-ui';


import dayjs from './common/js/dayjs.min.js'

Vue.use(uView);
Vue.config.productionTip = false

Vue.prototype.BaseFileURL = "https://kr.cctv13.eu.org/api/v2/files/"

//设置全局过滤器
Vue.filter('timeFormate', function(value) {
  return dayjs(value).format('YYYY年MM月DD日 HH:mm:ss');
});

//引用公用组件  uni-nav-bar
import uniNavBar from "@/uni_modules/zhouWei-navBar/components/zhouWei-navBar/zhouWei-navBar.vue"
Vue.component('uni-nav-bar', uniNavBar)

//引用公用组件  uni-nav-bar
import login from "@/components/login"
Vue.component('login', login)

//引用公用组件  gotoShare
import gotoShare from "@/components/gotoShare/gotoShare"
Vue.component('goto-share', gotoShare)

//引用vuex store
import store from "@/store"

App.mpType = 'app'
const app = new Vue({
  ...App,
  store,
})

// http拦截器，将此部分放在new Vue()和app.$mount()之间，才能App.vue中正常使用
import httpInterceptor from '@/common/http.interceptor.js'
Vue.use(httpInterceptor, app)

// http接口API集中管理引入部分
import httpApi from '@/common/http.api.js'
Vue.use(httpApi, app)

app.$mount()
// #endif

// #ifdef VUE3
import {
  createSSRApp
} from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif