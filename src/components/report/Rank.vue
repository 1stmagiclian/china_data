<template>
  <div class="com-container">
    <div class="com-chart" ref="rankRef"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  // 地区销量排行
  name: 'Rank',
  data() {
    return {
      // 图表的实例对象
      chartInstance: null,
      // 从服务器中获取的所有数据
      allData: null,
      // 柱形图 区域缩放起点值
      startValue: 0,
      // 柱形图结 区域缩放终点值
      endValue: 9,
      // 定时器
      timerId: null
    }
  },
  //在组件创建完成之后进行回调函数的注册
  created() {
    // this.$socket.registerCallBack('rankData', this.getData)
  },
  computed: {
    ...mapState(['theme'])
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
    }
  },
  mounted() {
    this.initChart()
    this.getData()

    //在原来获取数据的位置改为发送数据给服务器！！！！！！！
    // this.$socket.send({
    //   action: 'getData',
    //   socketType: 'rankData',
    //   chartName: 'rank',
    //   value: ''
    // })

    window.addEventListener('resize', this.screenAdapter)
    // 主动触发 响应式配置
    this.screenAdapter()
  },

  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timerId)
    //在组件销毁之后，进行回调函数的取消
    // this.$socket.unRegisterCallBack('rankData')
  },

  methods: {
    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.rankRef, this.theme)

      const initOption = {
        title: {
          text: '▎散点图',
          left: 20,
          top: 20
        },

        //图标的位置设置
        grid: {
          top: '20%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          // 把x轴和y轴纳入 grid
          containLabel: true
        },

        tooltip: {
          show: true,
          trigger:'item',
          formatter:(params) => {  // params就是数据，这里可以打印一下看看
              // return 出去什么，鼠标移入就显示什么,marker就是提示前面蓝色的圆点
              return `${params.data[2]}</br>${params.marker}横坐标:${params.data[0]}</br>纵坐标:${params.data[1]}`
          }

        },
        //让横纵坐标均显示数值，所以不适用'category'，而使用'value'
        xAxis: {
          type: 'value',
          scale: true
        },
        yAxis: {
          value: 'value',
          scale: true
        },

        //对展示的数据进行样式设置
        series: [
          {
            symbolSize: 15,
            type: 'scatter',
            label: {
              formatter: '{@value}',
              show: true,
              position: 'right',
              color: 'white',
              rotate: 30
            }
          }
        ]
      }

      this.chartInstance.setOption(initOption)

      // 鼠标经过关闭 动画效果
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      // 鼠标离开 开启动画效果
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },

    // 发送请求，获取数据
    async getData() {
      // const { data: res } = await this.$http.get('/rank')

      const res = [
            [0.25,0.07,'北京'],[0.25,0.17,'昆明'],[0.19,0.11,'成都'],
            [0.26,0.12,'武汉'],[0.42,0.18,'西安'],[0.53,0.59,'天津'],
            [0.52,0.45,'上海'],[0.51,0.47,'深圳'],[0.63,0.74,'南京']
      ]

      this.allData = res

      this.updateChart()
      // 开始自动切换
      this.startInterval()
    },

    
    // 更新图表配置项
    updateChart() {
      
      console.log(this.allData)

      const dataOption = {
      
        dataZoom: {
          // 区域缩放组件
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            data: this.allData,
            symbol:
        'path://M51.911,16.242C51.152,7.888,45.239,1.827,37.839,1.827c-4.93,0-9.444,2.653-11.984,6.905 c-2.517-4.307-6.846-6.906-11.697-6.906c-7.399,0-13.313,6.061-14.071,14.415c-0.06,0.369-0.306,2.311,0.442,5.478 c1.078,4.568,3.568,8.723,7.199,12.013l18.115,16.439l18.426-16.438c3.631-3.291,6.121-7.445,7.199-12.014 C52.216,18.553,51.97,16.611,51.911,16.242z'

          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },


    // 根据图标容器的宽度 计算各属性、标签、元素的大小
    screenAdapter() {
      const titleFontSzie = (this.$refs.rankRef.offsetWidth / 100) * 3.6

      const adapterOption = {
        title: {  
          textStyle: {
            fontSize: titleFontSzie
          }
        },
        series: [
          {
            barWidth: titleFontSzie,
            itemStyle: {
              barBorderRadius: [titleFontSzie / 2, titleFontSzie / 2, 0, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },

    // 改变柱形图 区域缩放起始与终点值的函数
    startInterval() {
      // 如果存在则关闭
      this.timerId && clearInterval(this.timerId)

      this.timerId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 20000)
    }
  }
}
</script>

<style lang="less" scoped></style>
