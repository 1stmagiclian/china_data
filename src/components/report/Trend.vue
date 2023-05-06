<template>
  <div class="com-container">
    <div class="com-chart" ref="trendRef"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  // 地区销量排行
  name: 'Trend',
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
    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trendRef, this.theme)

      const initOption = {

        backgroundColor:"rgb(22, 21, 34,0.5)",

        title: {
          text: '▎城市软实力指标排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '30%',
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
          }
        },
        // yAxis: {
        //   value: 'value'
        // },
        yAxis: [
          {
            type: 'value',
            name: 'data',
            min: 0,
            max: 250,
            interval: 50,
            axisLabel: {
              formatter: '{value} 分'
            }
          },
          {
            type: 'value',
            name: 'rank',
            min: 1,
            max: 33,
            interval: 5,
            axisLabel: {
              formatter: '第{value} 名'
            }
          }
        ],

        // series: [
        //   {
        //     type: 'bar',
        //     label: {
        //       show: true,
        //       position: 'top',
        //       color: 'white',
        //       rotate: 30
        //     }
        //   }
        // ]
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
      const res = [
          {
            "name": "广东",
            "data": 230,
            "rank": 16
          },
          {
            "name": "福建",
            "data": 168,
            "rank": 23
          },
          {
            "name": "浙江",
            "data": 203,
            "rank": 10
          },
          {
            "name": "上海",
            "data": 310,
            "rank": 13
          },
          {
            "name": "北京",
            "data": 289,
            "rank": 25
          },
          {
            "name": "江苏",
            "data": 207,
            "rank": 24
          },
          {
            "name": "四川",
            "data": 189,
            "rank": 8
          },
          {
            "name": "重庆",
            "data": 195,
            "rank": 23
          },
          {
            "name": "陕西",
            "data": 160,
            "rank": 17
          },
          {
            "name": "湖南",
            "data": 140,
            "rank": 26
          },
          {
            "name": "河北",
            "data": 170,
            "rank": 2
          },
          {
            "name": "辽宁",
            "data": 106,
            "rank": 10
          },
          {
            "name": "湖北",
            "data": 120,
            "rank": 25
          },
          {
            "name": "江西",
            "data": 99,
            "rank": 19
          },
          {
            "name": "天津",
            "data": 107,
            "rank": 6
          },
          {
            "name": "吉林",
            "data": 143,
            "rank": 10
          },
          {
            "name": "青海",
            "data": 65,
            "rank": 23
          },
          {
            "name": "山东",
            "data": 166,
            "rank": 21
          },
          {
            "name": "山西",
            "data": 134,
            "rank": 16
          },
          {
            "name": "云南",
            "data": 87,
            "rank": 11
          },
          {
            "name": "安徽",
            "data": 79,
            "rank": 16
          }
        ]
      this.allData = res
      // 对数据进行排序(大到小)
      this.allData.sort((a, b) => b.value - a.value)

      this.updateChart()
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

                if (arg.value > 300) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 200) {
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
      const titleFontSzie = (this.$refs.trendRef.offsetWidth / 100) * 3.6

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
      }, 2000)
    }
  }
}
</script>

<style lang="less" scoped></style>