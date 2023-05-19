<template>
  <div class="com-container">
    <select v-model="selectedValue" @click="handleSelectChange">
      <option>2020</option>
      <option>2021</option>
    </select>
    <div class="com-chart" ref="hotRef"></div>
  </div>
</template>


<script>
import { mapState } from 'vuex'
import "echarts-wordcloud"
import "echarts-wordcloud/dist/echarts-wordcloud"
import "echarts-wordcloud/dist/echarts-wordcloud.min"
import axios from 'axios'


export default {
  name: 'Hot',
  data() {
    return {
      selectedValue: 2020, // 设置默认选中的值
      // 图表的实例对象
      chartInstance: null,
      // 从服务器中获取的所有数据
      allData: null,
      // 当前显示的一级分类数据类型
      // currentIndex: 0,
      // 字体响应式大小
      // titleFontSize: null,
    }
  },
  created() {
    // this.getData()
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
    handleSelectChange() {
      console.log(this.selectedValue)
      // 根据下拉框的值发送请求给后端接口，并获取数据
      this.screenAdapter()
      this.getData()
      // 更新图表
      this.updateChart()
    },
    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hotRef, this.theme)

      const initOption = {
        backgroundColor:"rgb(22, 21, 34, 0.75)",
        title: {
          text: '▎城市单一指标对比',
          left: 20,
          top: 20,
        },
        tooltip: {
          show: true,
        },
      }
      this.chartInstance.setOption(initOption)
    },
    // 发送请求，获取数据
    async getData() {
      const { data: res } = await axios.get('http://127.0.0.1:5000/wordcloud',{params:{year:this.selectedValue}})
      // const res = [
      //       {
      //         name: "国防白皮书",
      //         value: 6500
      //       },
      //       {
      //         name: "创新",
      //         value: 6000
      //       },
      //       {
      //         name: "民主革命",
      //         value: 4500
      //       },
      //       {
      //         name: "从严治党",
      //         value: 1900
      //       },
      //       {
      //         name: "现代化经济体系",
      //         value: 1800
      //       },           
      //     ]
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
            type: "wordCloud",
            gridSize: 20,
            rotationRange: [0, 0],
            shape: 'circle',
            textStyle: {
              normal: {
                fontFamily: 'Impact, sans-serif',
                fontWeight: 'bold',
                color: function() {
                  return 'rgb(' +
                    Math.round(Math.random() * 255) +
                    ',' +
                    Math.round(Math.random() * 255) +
                    ',' +
                    Math.round(Math.random() * 255) +
                    ')';
                }
              }
            },
            left: 'center',
            top: '16%',
            // width: '90%',
            // height: '70%',
            drawOutOfBound: true,
            data: this.allData
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    //不同分辨率的响应式
    screenAdapter() {
      const titleFontSize = (this.$refs.hotRef.offsetWidth / 100) * 4

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: 25,
          },
        },
        series: [
          {
            width: titleFontSize*25,
            // height: titleFontSize*60,
            // gridSize: titleFontSize*0.5,     
            sizeRange: [titleFontSize, titleFontSize*3],    
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
  },
}
</script>

<style lang="less" scoped>
select {
  /* 调整下拉框的样式 */
  z-index: 1;
  width: 100px; /* 设置宽度 */
  height: 30px; /* 设置高度 */
  padding: 5px; /* 设置内边距 */
  font-size: 14px; /* 设置字体大小 */
  border: 1px solid #ccc; /* 设置边框样式 */
  border-radius: 4px; /* 设置边框圆角 */
  position: absolute; /* 设置绝对定位 */
  top: 20px; /* 设置相对于父容器的顶部偏移量 */
  right: 60px; /* 设置相对于父容器的右侧偏移量 */
  
  // color: black; /* 设置字体颜色 */
  background-color: #23E5E5; /* 设置背景色 */
}
</style>