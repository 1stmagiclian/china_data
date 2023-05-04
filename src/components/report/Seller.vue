<template>
  <div class="com-container">
    <div class="com-chart" ref="sellerRef"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from 'utils/theme_utils'
import axios from 'axios'

export default {
  // 商家销售统计
  name: 'Seller',
  data() {
    return {
      // echarts 实例对象
      chartInstance: null,
      // 服务器返回的数据
      allData: null,
      // 当前显示的页数
      curretnPage: 1,
      // 总页数
      totalPage: 0,
      // 定时器标识
      timerId: null,
      // 当鼠标移入axis(坐标轴)时展示 底层的背景色
      PointerColor: this.axisPointerColor,
    }
  },
  created() {
    // this.$socket.registerCallBack('sellerData', this.getData)
  },
  computed: {
    ...mapState(['theme']),
    axisPointerColor() {
      return getThemeValue(this.theme).sellerAxisPointerColor
    },
  },
  watch: {
    theme() {
      // 销毁当前的图表
      this.chartInstance.dispose()
      // 以最新主题初始化图表对象
      this.initChart()
      // 屏幕适配
      this.screenAdapter()
      // 渲染数据
      this.updateChart()
    },
  },
  
  mounted() {
    // 由于初始化 使用到了DOM元素，因此需要在 mounted生命周期内调用
    this.initChart()
    this.getData()
    // this.$socket.send({
    //   action: 'getData',
    //   socketType: 'sellerData',
    //   chartName: 'seller',
    //   value: '',
    // })
    // 在界面加载完成时，主动对屏幕进行适配
    this.screenAdapter()
    window.addEventListener('resize', this.screenAdapter)
  },


  // 实例销毁后触发
  destroyed() {
    clearInterval(this.timeID)
    // 在组件销毁的时候，把监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    // this.$socket.unRegisterCallBack('sellerData')
  },


  methods: {
    // 初始化 echartsInstance 对象
    initChart() {//该方法需要在mounted里面进行调用
      this.chartInstance = this.$echarts.init(this.$refs.sellerRef, this.theme)//初始化操作
      // 对图表初始化的配置
      const initOption = {

        backgroundColor:"rgb(22, 21, 34,0.5)",

        title: {
          text: '▎各地区总得分',
          left: 20,
          top: 20,
        },
        //柱状图坐标轴在页面的位置
        grid: {
          top: '10%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          // 默认grid不包含坐标轴文字，改为true
          containLabel: true,
        },
        xAxis: {
          axisLine: {
              lineStyle: {
                  color: "#fff",
              }
          },
          type: 'value',
        },
        yAxis: {
          axisLine: {
              lineStyle: {
                  color: "#fff",
              }
          },
          type: 'category',
        },

        // 当鼠标移入axis(坐标轴)时展示 底层的背景色
        tooltip: {
          trigger: 'axis',//触发时机：鼠标移到坐标轴时
          axisPointer: {
            // 展示的类型是线条类型
            type: 'line',
            lineStyle: {
              color: this.axisPointerColor,
            },
            // 相等于 z-index 将层级调低
            z: 0,  //保证背景不挡住柱状图
          },
        },

        series: [
          {
            type: 'bar',
            label: {
              show: true,   //展示柱形图上的数字
              position: 'right',//显示在右边
              textStyle: {
                color: 'white',
              },
            },
            // 每一个柱的样式
            itemStyle: {
              //设置柱状图的渐变颜色

              // new 出 echarts 全局对象的一个线性渐变方法
              // 指明方向(第四象限坐标轴),不同百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [  //0010表示从左往右的方向
                // 0% 状态时的颜色
                { offset: 0, color: '#2E72BF' }, //#5052EE
                // 100% 的颜色
                { offset: 1, color: '#23E5E5' },//#AB6EE5
              ]),
            },
          },
        ],
      }

      this.chartInstance.setOption(initOption)

      // 对图表进行鼠标事件的监听【目的是当鼠标指向图表时图表不会再变化】
      this.chartInstance.on('mouseover', () => {
        this.timerId && clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },


    // 获取服务器数据
    async getData() {
      // http://101.34.160.195:8888/api/seller
      // const { data: res } = await this.$http.get('/seller')  //发起Ajax请求
      // const res = await this.$http.get('/') 

      
      // const res=[{"name":"广州","value":0.7},
      //            {"name":"杭州","value":0.69},
      //            {"name":"郑州","value":0.45},
      //            {"name":"武汉","value":0.62},
      //            {"name":"西安","value":0.53},
      //            {"name":"成都","value":0.68},
      //            {"name":"呼和浩特","value":0.27},
      //            {"name":"济南","value":0.51},
      //            {"name":"昆明","value":0.4},
      //            {"name":"兰州","value":0.3},
      //            {"name":"南京","value":0.64},
      //            {"name":"深圳","value":0.56},
      //            {"name":"大连","value":0.39},
      //            {"name":"贵阳","value":0.32},
      //            {"name":"太原","value":0.37},
      //            {"name":"海口","value":0.33},
      //            {"name":"青岛","value":0.52},
      //            {"name":"苏州","value":0.59},
      // ]

      const {data : res} = await axios.get('http://127.0.0.1:5000/')


      console.log(res)
      this.allData = res
      // 对数组排序 从小到大进行排序
      this.allData.sort((a, b) => a.value - b.value)
      // 每五个元素显示一页 计算出总页数【向上取整】
      this.totalPage = Math.ceil(this.allData.length / 9)

      // 开始第一次渲染
      this.updateChart()
      // 开启定时器 开始动态渲染
      this.startInterval()
    },


    // 更新图表
    updateChart() {
      // 动态从数组中取出5条数据
      // const start = (this.curretnPage - 1) * 33 // 0、10、20
      // const end = this.curretnPage * 33  //10、20、30
      // const showData = this.allData.slice(start, end)

      const showData = this.allData

      // y轴上的数据
      const sellerNames = showData.map(item => item.name)
      // x轴上的数据
      const sellerValues = showData.map(item => item.value)

      // 当拿到数据后，准备数据的配置项
      const dataOption = {
        yAxis: {
          data: sellerNames,
        },
        series: [
          {
            data: sellerValues,
          },
        ],
      }

      // 设置数据
      this.chartInstance.setOption(dataOption)
    },

    
    // 开启动态渲染的定时器
    startInterval() {
      // 一般使用定时器都有一个保险操作,先关闭再开启
      this.timerId && clearInterval(this.timerId)

      this.timerId = setInterval(() => {//每隔5s执行一次，对currentPage数量进行逐渐增加
      this.curretnPage++
      // 当超出最大页数时,回滚到第一页
      if (this.curretnPage > this.totalPage) this.curretnPage = 1

      this.updateChart()//更新完currentPage之后需要重新执行updateChart方法
      }, 5000)
    },


    // 当浏览器窗口大小发生变化，完成屏幕适配
    screenAdapter() {
      const titleFontSize = (this.$refs.sellerRef.offsetWidth / 100) * 3
      // 浏览器分辨率大小相关的配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: 30,
          },
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize*0.3,
            },
          },
        },
        series: [
          {
            barWidth: titleFontSize*0.3,//柱形图的宽度
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],  //圆柱形的半圆弧度角
            },
          },
        ],
      }
      this.chartInstance.setOption(adapterOption)
      // 手动调用图表的 resize 才能产生效果
      this.chartInstance.resize()
    },
  },
}
</script>

<style lang="less" scoped></style>
