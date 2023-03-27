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

    //雷达图中鼠标浮现的空格样式调整：数值和rank之间的空格数
    getKonggenum(s){
      let len = s.length
      console.log(len)
      if(len==4){ //0.22
        return '&#8194&#8194&#8194&#8194&#8194'
      }else if(len==3){  //0.2
        return '&#8194&#8194&#8194&#8194&#8194&#8194'
      }else{ //1
        return '&#8194&#8194&#8194&#8194&#8194&#8194&#8194&#8194'
      }
     
      // return '&#8194&#8194&#8194&#8194&#8194';
    },

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
            { name: '生态禀赋', max: 1 },
            { name: '文化资源', max: 1 },
            { name: '政策地位', max: 1 },
            { name: '经济规模', max: 1 },
            // { name: '交通规模', max: 1 },
            // { name: '创新能力', max: 1 },
            // { name: '基本保障', max: 1 },
            // { name: '生活水平', max: 1 },
            // { name: '主流评价', max: 1 },
            // { name: '教育服务', max: 1 },
            // { name: '医疗服务', max: 1 },
            // { name: '文化服务', max: 1 },
            // { name: '主流媒体', max: 1 },
            // { name: '网络接入', max: 1 },
            // { name: '舆情干预', max: 1 },
            // { name: '媒体影响', max: 1 },
            // { name: '群体情绪', max: 1 },
            // { name: '城市标签', max: 1 },
            // { name: '就学吸引', max: 1 },
            // { name: '就业吸引', max: 1 },
            // { name: '旅游吸引', max: 1 },
            // { name: '外资吸引', max: 1 },
            // { name: '会展竞争', max: 1 },
          ]
        },

        //todo：格式化输出样式
        tooltip: {
          show: true,
          trigger:'item',
          position: ['75%','18%'],
          backgroundColor:"#333399",
          textStyle:{
            align:'leftd'
          },
          formatter:(params) => {  // params就是数据，这里可以打印一下看看
              // return 出去什么，鼠标移入就显示什么,marker就是提示前面蓝色的圆点
              // return `城市名：${params.data['name']}${this.getKonggenum(params.data['value'][0])}&#8194&#8194&#8194排名</br>
              //         ${params.marker}生态禀赋:${params.data['value'][0]} ${this.getKonggenum(params.data['value'][0])} ${params.data['rank'][0]}</br>
              //         ${params.marker}文化资源:${params.data['value'][1]} ${this.getKonggenum(params.data['value'][1])} ${params.data['rank'][1]}</br>
              //         ${params.marker}政策地位:${params.data['value'][2]} ${this.getKonggenum(params.data['value'][2])} ${params.data['rank'][2]}</br>
              //         ${params.marker}经济规模:${params.data['value'][3]} ${this.getKonggenum(params.data['value'][3])} ${params.data['rank'][3]}</br>
              //         ${params.marker}交通规模:${params.data['value'][4]} ${this.getKonggenum(params.data['value'][4])} ${params.data['rank'][4]}</br>
              //         ${params.marker}创新能力:${params.data['value'][5]} ${this.getKonggenum(params.data['value'][5])} ${params.data['rank'][5]}</br>
              //         ${params.marker}基本保障:${params.data['value'][6]} ${this.getKonggenum(params.data['value'][6])} ${params.data['rank'][6]}</br>
              //         ${params.marker}生活水平:${params.data['value'][7]} ${this.getKonggenum(params.data['value'][7])} ${params.data['rank'][7]}</br>
              //         ${params.marker}主流评价:${params.data['value'][8]} ${this.getKonggenum(params.data['value'][8])} ${params.data['rank'][8]}</br>
              //         ${params.marker}教育服务:${params.data['value'][9]} ${this.getKonggenum(params.data['value'][9])} ${params.data['rank'][9]}</br>
              //         ${params.marker}医疗服务:${params.data['value'][10]} ${this.getKonggenum(params.data['value'][10])} ${params.data['rank'][10]}</br>
              //         ${params.marker}文化服务:${params.data['value'][11]} ${this.getKonggenum(params.data['value'][11])} ${params.data['rank'][11]}</br>
              //         ${params.marker}主流媒体:${params.data['value'][12]} ${this.getKonggenum(params.data['value'][12])} ${params.data['rank'][12]}</br>
              //         ${params.marker}网络接入:${params.data['value'][13]} ${this.getKonggenum(params.data['value'][13])} ${params.data['rank'][13]}</br>
              //         ${params.marker}舆情干预:${params.data['value'][14]} ${this.getKonggenum(params.data['value'][14])} ${params.data['rank'][14]}</br>
              //         ${params.marker}媒体影响:${params.data['value'][15]} ${this.getKonggenum(params.data['value'][15])} ${params.data['rank'][15]}</br>
              //         ${params.marker}群体情绪:${params.data['value'][16]} ${this.getKonggenum(params.data['value'][16])} ${params.data['rank'][16]}</br>
              //         ${params.marker}城市标签:${params.data['value'][17]} ${this.getKonggenum(params.data['value'][17])} ${params.data['rank'][17]}</br>
              //         ${params.marker}就学吸引:${params.data['value'][18]} ${this.getKonggenum(params.data['value'][18])} ${params.data['rank'][18]}</br>
              //         ${params.marker}就业吸引:${params.data['value'][19]} ${this.getKonggenum(params.data['value'][19])} ${params.data['rank'][19]}</br>
              //         ${params.marker}旅游吸引:${params.data['value'][20]} ${this.getKonggenum(params.data['value'][20])} ${params.data['rank'][20]}</br>
              //         ${params.marker}外资吸引:${params.data['value'][21]} ${this.getKonggenum(params.data['value'][21])} ${params.data['rank'][21]}</br>
              //         ${params.marker}会展竞争:${params.data['value'][22]} ${this.getKonggenum(params.data['value'][22])} ${params.data['rank'][22]}</br>
              //         `
              return `城市名：${params.data['name']}${this.getKonggenum(params.data['value'][0])}&#8194&#8194&#8194排名</br>
                      ${params.marker}生态禀赋:${params.data['value'][0]} ${this.getKonggenum(params.data['value'][0])} ${params.data['rank'][0]}</br>
                      ${params.marker}文化资源:${params.data['value'][1]} ${this.getKonggenum(params.data['value'][1])} ${params.data['rank'][1]}</br>
                      ${params.marker}政策地位:${params.data['value'][2]} ${this.getKonggenum(params.data['value'][2])} ${params.data['rank'][2]}</br>
                      ${params.marker}经济规模:${params.data['value'][3]} ${this.getKonggenum(params.data['value'][3])} ${params.data['rank'][3]}</br>`
          }
        },

        series:[
          {
            type:'radar',
            areaStyle: {},
            // data:this.allData,
            // show:true,
            // label:{
            //   position:'left'
            // }
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

      console.log(this.$route.params.cityName)
      const { data: res } = await axios.get('http://10.128.128.228:5000/radar',{params:{cityName:this.$route.params.cityName}})

      
      //后端返回数据注意格式
      // const res=[{name:"济南",
      //             value:['0.12','0.36','0.8','0.35','0.15','0.69','0.38','0.87','1','0.59','0.83','0.42','0.27','0.44','0.5','0.19','0.09','0.81','0.46','0.65','0.3','0.1','0.52'],
      //             rank:[23,8,3,12,22,12,11,2,1,6,11,8,15,12,20,15,26,10,14,8,19,17,12]},


      //           //  {name:"杭州",value:[7, 3, 5, 9, 15, 16,7, 6, 12, 7, 5, 9]},
      //           //  {name:"郑州",value:[7, 6, 12, 7, 5, 9,17, 8, 15, 8, 15]},                
      // ]

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