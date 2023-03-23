<template>
  <div class="com-container">
    <div class="com-chart" ref="stockRef"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  // 库存和销量分析
  name: 'Stock',
  data() {
    return {
      // 图表的实例对象
      chartInstance: null,
      // 从服务器中获取的所有数据
      allData: null,
      // 当前显示数据的页数
      currentIndex: 1,
      // 定时器标识
      timerId: null,
      
    }
  },
  created() {
    // this.$socket.registerCallBack('stockData', this.getData)
  },
  computed: {
    ...mapState(['theme']),
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
    this.initChart()
    this.getData()
    // this.$socket.send({
    //   action: 'getData',
    //   socketType: 'stockData',
    //   chartName: 'stock',
    //   value: '',
    // })
    window.addEventListener('resize', this.screenAdapter)
    // 主动触发 响应式配置
    this.screenAdapter()
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timerId)
    // this.$socket.unRegisterCallBack('stockData')
  },
  methods: {
    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.stockRef, this.theme)
      const initOption = {

        title: {
          text: '▎城市雷达图',
          left: 20,
          top: 20,
        },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: 'col1', max: 20 },
            { name: 'col2', max: 20 },
            { name: 'col3', max: 20 },
            { name: 'col4', max: 20 },
            { name: 'col5', max: 20 },
            { name: 'col6', max: 20 },
            { name: 'col7', max: 20 },
            { name: 'col8', max: 20 },
            { name: 'col9', max: 20 },
            { name: 'col10', max: 20 },
            { name: 'col11', max: 20 },
            { name: 'col12', max: 20 },  

          ]
        },

        tooltip: {
          trigger:'item',
          formatter:(params) => {  // params就是数据，这里可以打印一下看看
              // return 出去什么，鼠标移入就显示什么,marker就是提示前面蓝色的圆点
              return `${params.data['name']}&#8194&#8194&#8194&#8194&#8194&#8194&#8194rank</br>
                      ${params.marker}col1:${params.data['value'][0]} &#8194&#8194 ${params.data['rank'][0]}</br>
                      ${params.marker}col2:${params.data['value'][1]} &#8194&#8194 ${params.data['rank'][1]}</br>
                      ${params.marker}col3:${params.data['value'][2]} &#8194&#8194 ${params.data['rank'][2]}</br>
                      ${params.marker}col4:${params.data['value'][3]} &#8194&#8194 ${params.data['rank'][3]}</br>
                      ${params.marker}col5:${params.data['value'][4]} &#8194&#8194 ${params.data['rank'][4]}</br>
                      ${params.marker}col6:${params.data['value'][5]} &#8194&#8194 ${params.data['rank'][5]}</br>
                      ${params.marker}col7:${params.data['value'][6]} &#8194&#8194 ${params.data['rank'][6]}</br>
                      ${params.marker}col8:${params.data['value'][7]} &#8194&#8194 ${params.data['rank'][7]}</br>
                      ${params.marker}col9:${params.data['value'][8]} &#8194&#8194 ${params.data['rank'][8]}</br>
                      ${params.marker}col10:${params.data['value'][9]} &#8194&#8194 ${params.data['rank'][9]}</br>
                      ${params.marker}col11:${params.data['value'][10]} &#8194&#8194 ${params.data['rank'][10]}</br>
                      ${params.marker}col12:${params.data['value'][11]} &#8194&#8194 ${params.data['rank'][11]}</br>`
          }
        },

        series:[
          {
            type:'radar',
            // tooltip: {
            //   trigger: 'item'
            // },
            areaStyle: {},
            data:this.allData
          }
        ]
        
      }
      this.chartInstance.setOption(initOption)

      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', this.startInterval)
    },


    // 发送请求，获取数据
    async getData() {
      // const { data: res } = await this.$http.get('/stock')

      const res=[{name:"济南",value:[17, 8, 15, 8, 15, 6,7, 3, 5, 9, 15, 16],rank:[1,2,3,4,5,6,7,8,9,10,11,12]},
                //  {name:"杭州",value:[7, 3, 5, 9, 15, 16,7, 6, 12, 7, 5, 9]},
                //  {name:"郑州",value:[7, 6, 12, 7, 5, 9,17, 8, 15, 8, 15]},                
      ]

      this.allData = res

      this.updateChart()
    },



    // 更新图表配置项
    updateChart() {
      // 需要显示的原始数据   包含0，不好含


      const dataOption = {
        // tooltip: {
        //   // 这里为item 可以为内部的数据开启 单独的 tooltip
        //   trigger: 'item',
        // },
        series: [
          {
            data:this.allData
          }
        ]
      }

      this.chartInstance.setOption(dataOption)

      // 开启定时切换
      this.startInterval()
    },


    // 不同分辨率的响应式
    screenAdapter() {
      const titleFontSize = (this.$refs.stockRef.offsetWidth / 100) * 3.6

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 定时器不断切换当前页数
    startInterval() {
      this.timerId && clearInterval(this.timerId)

      this.timerId = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 2) this.currentIndex = 1
        // 在更新完数据后，需要更新页面
        this.updateChart()
      }, 5000)
    },
  },
}
</script>

<style lang="less" scoped>
</style>