<template>
  <div class="com-container">
    <select v-model="selectedValue" @click="handleSelectChange">
      <option>2020</option>
      <option>2021</option>
    </select>
    <!-- <button @click="gotolink" class="btn btn-success">返回</button> -->
    <div class="com-chart" ref="stockRef">
      <!-- <button @click="gotolink" class="btn btn-success">返回</button> -->
    </div>
  </div>
</template>   

<script>
import { mapState } from 'vuex'
import axios from 'axios'


export default {
  // 库存和销量分析
  name: 'Stock',
  data() {
    return {
      selectedValue: 2020, // 设置默认选中的值
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

  //用于页面初始化数据
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

    handleSelectChange() {
      console.log(this.selectedValue)
      // 根据下拉框的值发送请求给后端接口，并获取数据
      this.screenAdapter()
      this.getData()
      // 更新图表
      this.updateChart()
    },

    gotolink(){

      //点击跳转至上次浏览页面
      this.$router.go(-1)
    },

    //雷达图中鼠标浮现的空格样式调整：数值和rank之间的空格数
    getKonggenum(s){
      // let len = s.length
      // console.log(len)
      // if(len==4){ //0.22
      //   return '&#8194&#8194&#8194&#8194&#8194'
      // }else if(len==3){  //0.2
      //   return '&#8194&#8194&#8194&#8194&#8194&#8194'
      // }else{ //1
      //   return '&#8194&#8194&#8194&#8194&#8194&#8194&#8194&#8194'
      // }
     
      return '&#8194&#8194&#8194&#8194&#8194';
    },

    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.stockRef, this.theme)
      const initOption = {
        // backgroundColor:"rgb(221, 221, 221)",

        title: {
          text: '▎城市雷达图',
          left: 20,
          top: 20,
        },
        name: {
            textStyle: {
                color: '#fff',
                fontSize: 16
            },
        },
        

        toolbox:{

          top: "5%",
          right: "5%",
          iconStyle: {
            borderColor: "white",  // 图标默认颜色
          },
          emphasis: {
            iconStyle: {
              borderColor: "#54C3F1",  // 图标hover颜色
            },
          },
          itemSize: 50, // 设置图标大小
          feature: {  
            myTool1: {  
                show: true,  
                title: '返回',  
                icon: 'path://M742.4 0h-358.4C199.68 0 51.2 148.48 51.2 332.8v358.4C51.2 875.52 199.68 1024 384 1024h358.4C926.72 1024 1075.2 875.52 1075.2 691.2v-358.4C1075.2 148.48 926.72 0 742.4 0z m-83.626667 863.573333H296.96c-20.48 0-37.546667-10.24-37.546667-30.72 0-20.48 17.066667-27.306667 37.546667-27.306666h360.106667c92.16 0 192.853333-117.76 192.853333-209.92s-100.693333-197.973333-192.853333-197.973334H317.44l100.693333 93.866667c15.36 15.36 30.72 39.253333 15.36 54.613333-15.36 15.36-35.84 15.36-49.493333 0l-155.306667-157.013333c-11.946667-11.946667-11.946667-30.72-1.706666-42.666667l155.306666-158.72c15.36-15.36 35.84-15.36 49.493334 0 15.36 15.36 0 39.253333-15.36 54.613334L319.146667 341.333333h339.626666c136.533333 0 247.466667 119.466667 247.466667 254.293334 0 138.24-110.933333 267.946667-247.466667 267.946666z',  
                onclick: function (){  
                  window.location.href='http://localhost:8999/#/home'
                }  
            }, 
            myTool2: {  
                show: true,  
                title: 'todo_list',  
                icon: 'path://M196.383562 1011.375342c-23.846575 0-49.09589-5.610959-72.942466-15.430137-11.221918-4.208219-18.235616-14.027397-21.041096-25.249315-2.805479-11.221918 1.40274-22.443836 9.819178-30.860274l65.928767-65.928767-23.846575-23.846575-67.331507 67.331507c-8.416438 8.416438-19.638356 11.221918-30.860274 9.819178-11.221918-1.40274-21.041096-9.819178-25.249315-19.638356C0 837.435616 14.027397 754.673973 68.734247 701.369863c42.082192-42.082192 102.4-60.317808 159.912328-50.49863l347.879452-347.879452c-22.443836-77.150685-1.40274-161.315068 56.109589-220.230137 65.928767-65.928767 162.717808-84.164384 246.882192-46.290411 11.221918 4.208219 18.235616 14.027397 21.041096 25.249315 2.805479 11.221918-1.40274 22.443836-9.819178 30.860274l-92.580822 92.580822 44.887671 44.887671 93.983562-93.983562c8.416438-8.416438 19.638356-11.221918 30.860274-9.819178 11.221918 1.40274 21.041096 9.819178 25.249315 19.638357 39.276712 84.164384 21.041096 185.161644-44.887671 251.09041-58.915068 58.915068-144.482192 79.956164-224.438356 54.70685l-347.879452 350.684931c8.416438 56.109589-9.819178 115.024658-50.498631 155.70411-35.068493 35.068493-81.358904 53.30411-129.052054 53.304109z m-40.679452-246.882191c8.416438 0 18.235616 2.805479 25.249315 9.819178l74.345205 74.345205c14.027397 14.027397 14.027397 36.471233 0 49.095891l-42.082192 42.082191c23.846575-2.805479 46.290411-14.027397 63.123288-32.263013 28.054795-28.054795 39.276712-70.136986 28.054795-108.010959-4.208219-14.027397 1.40274-29.457534 14.027397-37.873973l374.531507-374.531507c9.819178-9.819178 25.249315-12.624658 39.276712-7.013698 57.512329 25.249315 124.843836 12.624658 169.731507-32.263014 32.263014-32.263014 47.693151-75.747945 44.887671-119.232877l-75.747945 75.747946c-12.624658 12.624658-36.471233 12.624658-49.095891 0l-98.19178-93.983562c-14.027397-14.027397-14.027397-36.471233 0-49.095891l72.942465-72.942465c-42.082192-1.40274-82.761644 14.027397-113.621917 44.887671-43.484932 43.484932-57.512329 109.413699-33.665754 166.926027 5.610959 12.624658 2.805479 28.054795-7.013698 37.873973L263.715068 715.39726c-9.819178 9.819178-22.443836 12.624658-35.068493 8.416439-39.276712-12.624658-81.358904-1.40274-110.816438 28.054794-18.235616 18.235616-29.457534 43.484932-32.263014 67.331507l44.887672-44.887671c7.013699-7.013699 15.430137-9.819178 25.249315-9.819178z',  
                onclick: function (){  
                  alert("未来还有功能会上线，敬请期待！")
                }  
            }, 
        }  
        },

        radar: {
          // shape: 'circle',
          indicator: [
            { name: '生态禀赋', max: 1 },
            { name: '文化资源', max: 1 },
            { name: '政策地位', max: 1 },
            { name: '经济规模', max: 1 },
            { name: '交通规模', max: 1 },
            { name: '创新能力', max: 1 },
            { name: '基本保障', max: 1 },
            { name: '生活水平', max: 1 },
            { name: '主流评价', max: 1 },
            { name: '教育服务', max: 1 },
            { name: '医疗服务', max: 1 },
            { name: '文化服务', max: 1 },
            { name: '主流媒体', max: 1 },
            { name: '网络接入', max: 1 },
            { name: '舆情干预', max: 1 },
            { name: '媒体影响', max: 1 },
            { name: '群体情绪', max: 1 },
            { name: '城市标签', max: 1 },
            { name: '就学吸引', max: 1 },
            { name: '就业吸引', max: 1 },
            { name: '旅游吸引', max: 1 },
            { name: '外资吸引', max: 1 },
            { name: '会展竞争', max: 1 },
          ],
        
          //雷达图背景的颜色，在这儿随便设置了一个颜色，完全不透明度为0，就实现了透明背景

          axisLine: { //指向外圈文本的分隔线样式
            lineStyle: {
                // color: '#013A3F'
                width:0.1
            }
          },
          splitArea: {
              show: false,
              areaStyle: {
                  color: "rgba(255,0,0,0)", // 图表背景的颜色
              },
          },
          splitLine: {
              show: true,
              lineStyle: {
                  width: 1,  // 分隔线线宽
                  color: "#47EDFC", // 设置网格的颜色【分隔线颜色】
              },
          },


      },

        //todo：格式化输出样式
        tooltip: {
          show: true,
          trigger:'item',
          position: ['75%','18%'],
          // backgroundColor:"#",
          textStyle:{
            // align:'left'
          },
          formatter:(params) => {  // params就是数据，这里可以打印一下看看
              // return 出去什么，鼠标移入就显示什么,marker就是提示前面蓝色的圆点
              return `城市名：${params.data['name']}${this.getKonggenum(params.data['value'][0])}&#8194&#8194&#8194排名</br>
                      ${params.marker}生态禀赋:${params.data['value'][0]} ${this.getKonggenum(params.data['value'][0])} ${params.data['rank'][0]}</br>
                      ${params.marker}文化资源:${params.data['value'][1]} ${this.getKonggenum(params.data['value'][1])} ${params.data['rank'][1]}</br>
                      ${params.marker}政策地位:${params.data['value'][2]} ${this.getKonggenum(params.data['value'][2])} ${params.data['rank'][2]}</br>
                      ${params.marker}经济规模:${params.data['value'][3]} ${this.getKonggenum(params.data['value'][3])} ${params.data['rank'][3]}</br>
                      ${params.marker}交通规模:${params.data['value'][4]} ${this.getKonggenum(params.data['value'][4])} ${params.data['rank'][4]}</br>
                      ${params.marker}创新能力:${params.data['value'][5]} ${this.getKonggenum(params.data['value'][5])} ${params.data['rank'][5]}</br>
                      ${params.marker}基本保障:${params.data['value'][6]} ${this.getKonggenum(params.data['value'][6])} ${params.data['rank'][6]}</br>
                      ${params.marker}生活水平:${params.data['value'][7]} ${this.getKonggenum(params.data['value'][7])} ${params.data['rank'][7]}</br>
                      ${params.marker}主流评价:${params.data['value'][8]} ${this.getKonggenum(params.data['value'][8])} ${params.data['rank'][8]}</br>
                      ${params.marker}教育服务:${params.data['value'][9]} ${this.getKonggenum(params.data['value'][9])} ${params.data['rank'][9]}</br>
                      ${params.marker}医疗服务:${params.data['value'][10]} ${this.getKonggenum(params.data['value'][10])} ${params.data['rank'][10]}</br>
                      ${params.marker}文化服务:${params.data['value'][11]} ${this.getKonggenum(params.data['value'][11])} ${params.data['rank'][11]}</br>
                      ${params.marker}主流媒体:${params.data['value'][12]} ${this.getKonggenum(params.data['value'][12])} ${params.data['rank'][12]}</br>
                      ${params.marker}网络接入:${params.data['value'][13]} ${this.getKonggenum(params.data['value'][13])} ${params.data['rank'][13]}</br>
                      ${params.marker}舆情干预:${params.data['value'][14]} ${this.getKonggenum(params.data['value'][14])} ${params.data['rank'][14]}</br>
                      ${params.marker}媒体影响:${params.data['value'][15]} ${this.getKonggenum(params.data['value'][15])} ${params.data['rank'][15]}</br>
                      ${params.marker}群体情绪:${params.data['value'][16]} ${this.getKonggenum(params.data['value'][16])} ${params.data['rank'][16]}</br>
                      ${params.marker}城市标签:${params.data['value'][17]} ${this.getKonggenum(params.data['value'][17])} ${params.data['rank'][17]}</br>
                      ${params.marker}就学吸引:${params.data['value'][18]} ${this.getKonggenum(params.data['value'][18])} ${params.data['rank'][18]}</br>
                      ${params.marker}就业吸引:${params.data['value'][19]} ${this.getKonggenum(params.data['value'][19])} ${params.data['rank'][19]}</br>
                      ${params.marker}旅游吸引:${params.data['value'][20]} ${this.getKonggenum(params.data['value'][20])} ${params.data['rank'][20]}</br>
                      ${params.marker}外资吸引:${params.data['value'][21]} ${this.getKonggenum(params.data['value'][21])} ${params.data['rank'][21]}</br>
                      ${params.marker}会展竞争:${params.data['value'][22]} ${this.getKonggenum(params.data['value'][22])} ${params.data['rank'][22]}</br>
                      `
              // return `城市名：${params.data['name']}${this.getKonggenum(params.data['value'][0])}&#8194&#8194&#8194排名</br>
              //         ${params.marker}生态禀赋:${params.data['value'][0]} ${this.getKonggenum(params.data['value'][0])} ${params.data['rank'][0]}</br>
              //         ${params.marker}文化资源:${params.data['value'][1]} ${this.getKonggenum(params.data['value'][1])} ${params.data['rank'][1]}</br>
              //         ${params.marker}政策地位:${params.data['value'][2]} ${this.getKonggenum(params.data['value'][2])} ${params.data['rank'][2]}</br>
              //         ${params.marker}经济规模:${params.data['value'][3]} ${this.getKonggenum(params.data['value'][3])} ${params.data['rank'][3]}</br>`
          }
        },

        //雷达图数据样式图
        series:[
          {
            type:'radar',
            areaStyle: {
              color: "rgba(71,237,252,.3)" 
            },
            lineStyle: {
              color: "#47EDFC",
              // 阴影折线宽度
              width: 5
            },
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

      console.log(this.$route.params.city_name)
      const { data: res } = await axios.get('http://127.0.0.1:5000/radar',{params:{city_name:this.$route.params.city_name,year:this.selectedValue}})
      // console.log(data)

      
      //后端返回数据注意格式
      // const res=[{"name":"济南",
      //             "value":['0.12','0.36','0.8','0.35','0.15','0.69','0.38','0.87','1','0.59','0.83','0.42','0.27','0.44','0.5','0.19','0.09','0.81','0.46','0.65','0.3','0.1','0.52'],
      //             "rank":[23,8,3,12,22,12,11,2,1,6,11,8,15,12,20,15,26,10,14,8,19,17,12]},


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
  top: 60px; /* 设置相对于父容器的顶部偏移量 */
  right: 400px; /* 设置相对于父容器的右侧偏移量 */
  
  // color: black; /* 设置字体颜色 */
  background-color: #23E5E5; /* 设置背景色 */
}
</style>