<template>
  <div class="com-container">
    <div class="com-chart" ref="rankRef"></div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

//散点图大小函数图
// var sizeFunction = function (x) {
//     var y = Math.sqrt(x /55) + 0.1;
//     return y * 80;
//   };


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

    //散点图颜色随机生成
    domColor(dataIndex){
      const Ary=[];
      for(let k=0;k<20;k++){
        const r=Math.floor(Math.random()*256);
        const g=Math.floor(Math.random()*256);
        const b=Math.floor(Math.random()*256);
        Ary.push(`rgb(${r},${g},${b})`);
      }
      return Ary[dataIndex];
    },


    // sizeFunction(x) {
    //     var y = Math.sqrt(x / 55) + 0.1;
    //     return y * 80;
    // },
    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.rankRef, this.theme)

      const initOption = {

        // backgroundColor:"#ccffff",

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
          trigger:'item',//item主要用在散点图上面
          formatter:(params) => {  // params就是数据，这里可以打印一下看看
              // return 出去什么，鼠标移入就显示什么,marker就是提示前面蓝色的圆点
              return `${params.data[2]}</br>${params.marker}横坐标:${params.data[0]}</br>${params.marker}纵坐标:${params.data[1]}`
          }

        },
        //让横纵坐标均显示数值，所以不适用'category'，而使用'value'
        xAxis: {
          name:"支撑性得分",
          nameGap: 18,
          nameLocation: 'middle',
          type: 'value',
          scale: true
        },
        yAxis: {
          name:"效应性得分",
          nameGap: 18,
          nameLocation: 'middle',
          value: 'value',
          scale: true
        },

        //对展示的数据进行样式设置
        series: [
          {
            
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
            [2.92,5.00,'石家庄',11235086],[3.25,5.00,'太原',5304061],[3.02,3.32,'呼和浩特',3446100],
            //[4.24,4.56,'沈阳',9070093],[3.78,4.43,'长春',9066906],[5.16,4.34,'哈尔滨',10009854],
            [7.53,6.22,'南京',9314685],[9.05,6.71,'杭州',11936010],[4.23,4.45,'合肥',9369881],
           // [4.30,4.61,'福州',8291268],[4.06,5.17,'南昌',6255007],[4.75,6.13,'济南',9202432],
            [4.50,5.84,'郑州',12600574],[7.09,6.89,'武汉',12326518],[5.85,5.83,'长沙',10047914],
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
            color:'#33ffff',
            //散点图随机颜色生成
            // itemStyle:{
            //     color:(e)=>{
            //       console.log("color--",e)
            //       this.domColor(e.dataIndex)
            //     }
            // }
        //     symbol:
        // 'path://M51.911,16.242C51.152,7.888,45.239,1.827,37.839,1.827c-4.93,0-9.444,2.653-11.984,6.905 c-2.517-4.307-6.846-6.906-11.697-6.906c-7.399,0-13.313,6.061-14.071,14.415c-0.06,0.369-0.306,2.311,0.442,5.478 c1.078,4.568,3.568,8.723,7.199,12.013l18.115,16.439l18.426-16.438c3.631-3.291,6.121-7.445,7.199-12.014 C52.216,18.553,51.97,16.611,51.911,16.242z',
            // symbolSize:this.sizeFunction(val[2]),
            
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },


    // 根据图标容器的宽度 计算各属性、标签、元素的大小
    screenAdapter() {
      const titleFontSzie = (this.$refs.rankRef.offsetWidth / 100) * 5.6

      const adapterOption = {
        title: {  
          textStyle: {
            fontSize: 25
          }
        },
        series: [
          {
            data: this.allData,
            barWidth: titleFontSzie,
            itemStyle: {
              barBorderRadius: [titleFontSzie / 2, titleFontSzie / 2, 0, 0],
              color:(e)=>{
                  console.log("color--",e)
                  this.domColor(e.dataIndex)
              }
            },
            symbolSize: function (data) {
              //调节大小
              // return Math.sqrt(data[3] / 15000) + 0.1 * 80;
              return data[3]/titleFontSzie/10000
            },
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
