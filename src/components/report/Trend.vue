<template>
  <div class="com-container">
    <select v-model="selectedValue" @click="handleSelectChange">
      <option>生态禀赋</option>
      <option>文化资源</option>
      <option>政策地位</option>
      <option>经济规模</option>
      <option>交通规模</option>
      <option>创新能力</option>
      <option>基本社保</option>
      <option>生活水平</option>
      <option>主流评价</option>
      <option>教育服务</option>
      <option>医疗服务</option>
      <option>文化服务</option>
      <option>主流媒体</option>
      <option>网络接入</option>
      <option>舆情干预</option>
      <option>媒体影响</option>
      <option>群体情绪</option>
      <option>城市标签</option>
      <option>就业吸引</option>
      <option>就学吸引</option>
      <option>旅游吸引</option>
      <option>外资吸引</option>
      <option>会展竞争</option>
    </select>
    <div class="com-chart" ref="trendRef"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  // 地区销量排行
  name: 'Trend',
  data() {
    return {
      selectedValue: '生态禀赋', // 设置默认选中的值
      // 图表的实例对象
      chartInstance: null,
      // 从服务器中获取的所有数据
      allData: null,
      // 柱形图 区域缩放起点值
      startValue: 0,
      // 柱形图结 区域缩放终点值
      endValue: 9,
      // 定时器
      timerId: null,
    }
  },
  created() {
    // this.$socket.registerCallBack('rankData', this.getData)
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
    }
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
    clearInterval(this.timerId)
    // this.$socket.unRegisterCallBack('rankData')
  },
  methods: {
    handleSelectChange() {
      // 根据下拉框的值发送请求给后端接口，并获取数据
      this.screenAdapter()
      this.getData()
      // 更新图表
      this.updateChart()
    },
    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trendRef, this.theme)

      const initOption = {

        backgroundColor:"rgb(22, 21, 34, 0.75)",

        title: {
          text: '▎城市软实力数据指标分析',
          left: 20,
          top: 20
        },
        grid: {
          top: '29%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          // 把x轴和y轴纳入 grid
          containLabel: true
        },
        tooltip: {
          trigger:'axis',
          show: true,
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          } 
        },
        // legend: {
        //   data: ['data', 'rank']
        // },
        xAxis: {
          type: 'category',
          axisPointer: {
            type: 'shadow'
          },
          axisLabel: {
            interval: 0, // 横坐标不间隔显示
          },
        },
        
        // yAxis: {
        //   value: 'value'
        // },
        yAxis: [
          {
            type: 'value',
            name: 'data',
            min: 0,
            max: 1,
            interval: 0.1,
            axisLabel: {
              formatter: '{value} '
            }
          },
          {
            type: 'value',
            name: 'rank',
            inverse: true,
            min: 1,
            max: 33,
            interval: 5,
            axisLabel: {
              formatter: '第{value} 名'
            }
          }
        ],

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
      
      const { data: res } = await axios.get('http://127.0.0.1:5000/softpower',{params:{data_index:this.selectedValue}})

      this.allData = res
      // 对数据进行排序(大到小)
      // this.allData.sort((a, b) => b.value - a.value)

      
      this.updateChart()

      //额外添加
      this.screenAdapter()

      // 开始自动切换
      this.startInterval()
      
    },
    // 更新图表配置项
    updateChart() {
      // 渐变色数组
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
    
      // 所有省份组成的数组
      const provinceInfo = this.allData.map(item => item.name)
      // 所有省份对应的销售金额
      const dataArr = this.allData.map(item => item.data)
      const rankArr = this.allData.map(item => item.rank)


      const dataOption = {
        xAxis: {
          data: provinceInfo
        },
        dataZoom: {
          // 区域缩放组件
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            name:'data',
            type:'bar',
            data: dataArr,
            itemStyle: {
              color: arg => {
                let targetColorArr = null

                if (arg.value > 0.8) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 0.5) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }

                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  // 0%
                  { offset: 0, color: targetColorArr[0] },
                  // 100%
                  { offset: 1, color: targetColorArr[1] }
                ])
              }
            }
          },
          {
            name:'rank',
            type:'line',
            smooth:false,
            lineStyle:{
              color:'#23E5E5'
            },
            yAxisIndex: 1,
            data: rankArr,
            Symbol:'circle',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' 名';
              }
            },
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 根据图标容器的宽度 计算各属性、标签、元素的大小
    screenAdapter() {
      const titleFontSzie = (this.$refs.trendRef.offsetWidth / 100) * 2.5

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
      }, 3000)
    }
  }
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
  right: 200px; /* 设置相对于父容器的右侧偏移量 */
  
  // color: black; /* 设置字体颜色 */
  background-color: #23E5E5; /* 设置背景色 */
}
</style>