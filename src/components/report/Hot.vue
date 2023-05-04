<template>
  <div class="com-container">
    <div class="com-chart" ref="hotRef"></div>
  </div>
</template>


<script>
import { mapState } from 'vuex'
import { getThemeValue } from 'utils/theme_utils'
import _ from 'lodash'

export default {
  name: 'Hot',
  data() {
    return {
      // 图表的实例对象
      chartInstance: null,
      // 从服务器中获取的所有数据
      allData: null,
      // 当前显示的一级分类数据类型
      // currentIndex: 0,
      // 字体响应式大小
      titleFontSize: null,
    }
  },
  created() {
    this.getData()
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
    window.addEventListener('resize', this.screenAdapter)
    // 主动触发 响应式配置
    this.screenAdapter()
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    // this.$socket.unRegisterCallBack('hotData')
  },
  methods: {
    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hotRef, this.theme)

      const initOption = {
        backgroundColor:"rgb(22, 21, 34,0.5)",
        title: {
          text: '▎城市单一指标对比',
          left: 20,
          top: 20,
        },
        legend: {
          top: '15%',
          // 图标类型 圆形
          icon: 'circle',
        },
        tooltip: {
          show: true,
          
        },
        series: [
          {
            type: 'pie',
            // label: {
            //   show: true,
            //   formatter:`{b}{d}%`
            // },
            // 高亮状态下的样式
            emphasis: {
              labelLine: {
                // 连接文字的线条
                show: true,
              },
            },
          },
        ],
      }
      this.chartInstance.setOption(initOption)
    },
    // 发送请求，获取数据
    async getData() {
      const res = [
        { value: 1048, name: '北京' },
        { value: 735, name: '昆明' },
        { value: 580, name: '南京' },
        { value: 484, name: '苏州' },
        { value: 300, name: '济南' },
        { value: 500, name: '海南' },
      ]
      this.allData = res
      this.updateChart()
    },
    // 更新图表配置项
    updateChart() {

      console.log(this.allData)
    
      const dataOption = {
        // legend: {
        //   data: legenDateArr,
        // },
        series: [
          {
            data: this.allData,
          },
        ],
      }
      this.chartInstance.setOption(dataOption)
    },
    // 不同分辨率的响应式
    screenAdapter() {
      this.titleFontSize = (this.$refs.hotRef.offsetWidth / 100) * 3.6

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          // 图例的间隔
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 1.2,
          },
        },
        series: [
          {
            // 饼图的大小 半径
            radius: this.titleFontSize * 4.5,
            // 控制饼图的位置 x,y
            center: ['50%', '60%'],
          },
        ],
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
  },
}
</script>

<style lang="less" scoped></style>