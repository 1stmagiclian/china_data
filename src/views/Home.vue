<template>
  <div class="screen-container" :style="containerStyle">


    <header class="screen-header">
      <div>
        <!-- <img :src="headerSrc" alt=""> -->
        <img v-show="theme == 'chalk'" src="~@/assets/images/header_border_dark.png" alt="" />
        <img v-show="theme != 'chalk'" src="~@/assets/images/header_border_light.png" alt="" />
      </div>
      <!-- <span class="logo"> <a :style="titleColor" href="http://39.107.97.152:8007/" title="欢迎访问文化计算实验室" target="_blank">欢迎访问文化计算实验室</a> </span> -->
      <span class="title">城市软实力可视化平台</span>
      <div class="title-right">
        <!-- <img :src="themeSrc" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题"> -->
        <!-- <img v-show="theme == 'chalk'" src="~@/assets/images/qiehuan_dark.png" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题" />
        <img v-show="theme != 'chalk'" src="~@/assets/images/qiehuan_light.png" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题" /> -->
        <div class="datetime">{{ systemDateTime }}</div>
      </div>
    </header>



    <div class="screen-body">    
      <section class="screen-left">
        <div id="left-top" :class="{ fullscreen: fullScreenStatus.rank }">
          <!-- 地区销量排行图表 -->
          <Rank ref="rank"></Rank>
          <div class="resize">
            <span @click="changeSize('rank')" :class="['iconfont', fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>

        <div id="left-bottom" :class="{ fullscreen: fullScreenStatus.hot }">
          <!-- 地区销量排行图表 -->
          <Hot ref="hot"></Hot>
          <div class="resize">
            <span @click="changeSize('hot')" :class="['iconfont', fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>


      <section class="screen-middle">
        <div id="middle-top" :class="{ fullscreen: fullScreenStatus.map }">
          <!-- 商家分布图表 -->
          <single-map ref="map"></single-map>
          <div class="resize">
            <span @click="changeSize('map')" :class="['iconfont', fullScreenStatus.map ? 'icon-compress-alt' : 
            'icon-expand-alt']"></span>
          </div>
        </div>

        <div id="middle-bottom" :class="{ fullscreen: fullScreenStatus.trend }">
          <!-- 商家分布图表 -->
          <Trend ref="trend"></Trend>
          <div class="resize">
            <span @click="changeSize('trend')" :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 
            'icon-expand-alt']"></span>
          </div>
        </div>
      </section>


      <section class="screen-right">
      
        <div id="right" :class="{ fullscreen: fullScreenStatus.seller }">
          <!-- 商家销售金额图表 -->
          <Seller ref="seller"></Seller>
          <div class="resize">
            <span @click="changeSize('seller')" :class="['iconfont', fullScreenStatus.seller ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Hot from '@/components/report/Hot.vue'
import Map from '@/components/report/Map.vue'
import Rank from '@/components/report/Rank.vue'
import Seller from '@/components/report/Seller.vue'
import Stock from '@/components/report/Stock.vue'
import Trend from '@/components/report/Trend.vue'

import { mapState } from 'vuex'
// 导入自己定义的主题工具函数 用于返回不同主题下的配置对象
import { getThemeValue } from 'utils/theme_utils'

export default {
  name: 'ScreenPage',

  //组件进行注册
  components: {
    Hot,
    'single-map': Map,
    Rank,
    Seller,
    Stock,
    Trend,
  },
  data() {
    return {
      // 各组件是否全屏状态
      fullScreenStatus: {
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hot: false,
        stock: false,
      },
      // 当前的系统时间
      systemDateTime: null,
      // 用于保存当前系统日期的定时器id
      timerID: null,
    }
  },
  created() {
    // 注册服务端广播的全屏事件
    // this.$socket.registerCallBack('fullScreen', this.recvData)
    // // 注册服务器广播的主题切换事件
    // this.$socket.registerCallBack('themeChange', this.recvThemeChange)
    this.currentTime()
  },
  computed: {
    ...mapState(['theme']),
    // 头部的边框路径
    headerSrc() {
      return '/static/img/' + getThemeValue(this.theme).headerBorderSrc
    },
    // 主题图片的路径
    themeSrc() {
      return '/static/img/' + getThemeValue(this.theme).themeSrc
    },
    containerStyle() {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor,
      }
    },
    titleColor() {
      return {
        color: getThemeValue(this.theme).titleColor,
      }
    },
  },
  destroyed() {
    // 组件销毁时，销毁事件
    // this.$socket.unRegisterCallBack('fullScreen')
    // this.$socket.unRegisterCallBack('themeChange')
    clearInterval(this.timerID)
  },
  methods: {
    // 监听全屏事件
    changeSize(chartName) {
      // 1.改变fullScreenStatus
      this.fullScreenStatus[chartName] = !this.fullScreenStatus[chartName]
      // 2.手动调用每个图表中的 screenAdapter 触发响应式
      this.$nextTick(() => {
        this.$refs[chartName].screenAdapter()
      })

      // 一端操作多端同步效果
      // 将事件发送给服务端，让服务端广播事件 true全屏，false取消全屏
      // const targetValue = !this.fullScreenStatus[chartName]
      // this.$socket.send({
      //   action: 'fullScreen',
      //   socketType: 'fullScreen',
      //   chartName: chartName,
      //   value: targetValue,
      // })
    },
    // 服务端广播全屏事件的客户端响应
    recvData(data) {
      // 取出是那一个图表进行切换
      const chartName = data.chartName
      // 判断切换成什么类型[true全屏，false取消全屏]
      const targetValue = data.value

      this.fullScreenStatus[chartName] = targetValue
      this.$nextTick(() => {
        this.$refs[chartName].screenAdapter()
      })
    },
    // 主题切换事件
    handleChangeTheme() {
      this.$store.commit('changeTheme')

      // this.$socket.send({
      //   action: 'themeChange',
      //   socketType: 'themeChange',
      //   chartName: '',
      //   value: '',
      // })
    },
    // 接收到服务器切换主题事件
    // recvThemeChange() {
    //   this.$store.commit('changeTheme')
    // },
    currentTime() {
      this.systemDateTime = new Date().toLocaleString()

      this.timerID && clearInterval(this.timerID)

      this.timerID = setInterval(() => {
        this.systemDateTime = new Date().toLocaleString()
      }, 1000)
    },
  },
}
</script>
<style lang="less" scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 9999;
}

.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;
  > div {
    img {
      width: 100%;
    }
  }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 30px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);
    a {
      text-decoration: none;
    }
  }
}
.screen-body {
  background:url("../../images/3.jpg");
  // filter:brightness(105%) contrast(110%) opacity(110%);
  background-size:100% 100%;
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;
  .screen-left {
    height: 100%;
    width: 27%;
    #left-top {
      border: none;
      border-image-source: radial-gradient(66% 66% at center,transparent 1px, transparent 80%, #23E5E5 100%);
      border-image-slice: 1;
      // border-width: 3px;
      border-style: solid;
      // border-image-outset: 0cm;
      margin-bottom: 15px;
      height: 42%;
      position: relative;
    }

    // @keyframes borderAnimation {
    //   0% {
    //     border-color: #98e5e9;
    //     box-shadow: 0 0 10px #98e5e9, 0 0 20px #98e5e9, 0 0 30px #98e5e9;
    //   }
    //   50% {
    //     border-color: #23E5E5;
    //     box-shadow: 0 0 10px #23E5E5, 0 0 20px #23E5E5, 0 0 30px #23E5E5;
    //   }
    //   100% {
    //     border-color: #0b8de9;
    //     box-shadow: 0 0 10px #0b8de9, 0 0 20px #0b8de9, 0 0 30px #0b8de9;
    //   }
    // }

    #left-bottom {
      border-image-source: radial-gradient(66% 66% at center,transparent 1px, transparent 80%, #23E5E5 100%);
      border-image-slice: 1;
      border-width: 3px;
      border-style: solid;
      border-image-outset: 0cm;
      height: 44.9%;
      margin-top: 15px;
      position: relative;
      // animation: borderAnimation 10s linear infinite;
    }
  }
 
  .screen-right {
    height: 100%;
    width: 27%;
    #right {
      border-image-source: radial-gradient(66% 66% at center,transparent 1px, transparent 80%, #23E5E5 100%);
      border-image-slice: 1;
      border-width: 3px;
      border-style: solid;
      border-image-outset: 0cm;
      // border-top-left-radius: 20px;
      // border-top-right-radius: 20px;
      // border-bottom-right-radius: 20px;
      // border-bottom-left-radius: 20px;
      height: 89.3%;
      position: relative;
      // animation: borderAnimation 10s linear infinite;
    }
  }
  .screen-middle {
    height: 100%;
    width: 50%;
    #middle-top {
      border-image-source: radial-gradient(66% 66% at center,transparent 1px, transparent 80%, #23E5E5 100%);
      border-image-slice: 1;
      border-width: 3px;
      border-style: solid;
      border-image-outset: 0cm;

      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
      border-bottom-left-radius: 20px;
      height: 57.3%;
      margin-bottom: 10px;
      margin-right: 10px;
      margin-left: 10px;
      position: relative;
      // animation: borderAnimation 10s linear infinite;

    }
    #middle-bottom {
      border-image-source: radial-gradient(66% 66% at center,transparent 1px, transparent 80%, #23E5E5 100%);
      border-image-slice: 1;
      border-width: 3px;
      border-style: solid;
      border-image-outset: 0cm;

      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
      border-bottom-left-radius: 20px;
      height: 30.2%;
      // margin-bottom: 25px;
      margin-right: 10px;
      margin-left: 10px;
      position: relative;
      // animation: borderAnimation 10s linear infinite;
    }
  }
}


.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
</style>
