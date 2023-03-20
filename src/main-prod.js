import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import echarts from 'echarts'

// 引入全局样式文件
import './assets/css/global.less'

// 引入字体文件
import './assets/font/iconfont.css'

// 引入 socket_service
// import SocketService from './utils/socket_service'
// SocketService.Instance.connect()
// Vue.prototype.$socket = SocketService.Instance

// axios 配置接口默认路径
//axios.defaults.baseURL = 'https://www.bookbook.cc/api/data-view' // 使用接口数据 可把后端仓库拉下来 改成 http://127.0.0.1:8801/api
//将axios挂载到Vue的原型对象上，别的组件中通过this.$http来得到axios对象，从而发起ajax请求

axios.defaults.baseURL = 'https://www.bookbook.cc/api/data-view'  //http://39.107.97.152:8077/
Vue.prototype.$http = axios

// 把echarts挂载到 Vue原型上，以便在全局访问，使用时直接this.$echarts
Vue.prototype.$echarts = echarts
// 引入主题
import './assets/lib/theme/chalk'
import './assets/lib/theme/westeros'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
