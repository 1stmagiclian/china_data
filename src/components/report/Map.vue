<template>
  <div class="com-container" @dblclick="chinaMap">
    <div class="com-chart" ref="mapRef"></div>
  </div>
</template>

<script>
import { getProvinceMapInfo } from '@/utils/map_utils'//中文城市名转成拼音
import { mapState } from 'vuex'
import axios from 'axios'

let img =document.createElement('img')
img.src=require('@/assets/images/map_bg.png')

export default {
  name: 'Map',
  data() {
    return {
      // axios实例对象
      axiosInstance: null,
      // 图表的实例对象
      chartInstance: null,
      // 中国地图数据
      chinaMapData: null,
      // 从服务器中获取的所有数据
      allData: null,
      // 获取省份矢量地图数据缓存
      cityMapData: {},
    }
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
  created() {
    this.getData()
    // this.axiosInstance = axios.create({
    //   baseURL: 'http://101.34.160.195:9997',
    // })
    // this.$socket.registerCallBack('mapData', this.getData)
  },


  //mounted挂载 执行内容 创建实例 请求数据 渲染图表 添加窗口尺寸变化的监听
  mounted() {
    this.initChart()
    this.getData()
    // this.$socket.send({
    //   action: 'getData',
    //   socketType: 'mapData',
    //   chartName: 'map',
    //   value: '',
    // })
    window.addEventListener('resize', this.screenAdapter)
    // 主动触发 响应式配置
    this.screenAdapter()
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    // this.$socket.unRegisterCallBack('stockData')
  },


  methods: {
    // 初始化图表的方法
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.mapRef, this.theme)
      // 获取中国地图的矢量数据： 可以通过发送网络请求获取,static/map/china.json 的数据
      // 由于配置了基础路径，所以不能直接 this.$http.get 来请求 static下的资源

      // if (!this.chinaMapData) {
      //   const { data: res } = await this.$http.get('/map/china')
      //   this.chinaMapData = res
      // }


      //不通过后台获取地图数据的方式就是axios.get
      const ret = await axios.get('http://localhost:8999/static/map/china.json')
      // const ret = await axios.get('http://39.107.97.152:8077/static/map/china.json')


      // 注册地图数据
      // this.$echarts.registerMap('china', this.chinaMapData)
      this.$echarts.registerMap('china', ret.data)
      

      // 初始化配置项
      const initOption = {
        backgroundColor:"rgb(22, 21, 34, 0.75)",
        // backgroundColor:{
        //   type: 'radial',
        //   x: 0.5,
        //   y: 0.5,
        //   r: 0.5,
        //   colorStops: [{
        //       offset: 0, color: 'rgb(0, 0, 255)' // 0% 处的颜色
        //   }, {
        //       offset: 1, color: 'rgb(22, 21, 34)' // 100% 处的颜色
        //   }],
        //   global: false // 缺省为 false
        // },  

        title: {
          text: '▎城市分布',
          left: 20,
          top: 20,
        },

        

        geo: {  
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          //允许拖动及缩放
          roam: true,


          // zoom: 1.1, //默认缩放比例61
          itemStyle: {         
            // normal: {
            //   areaColor: '#01215c',
            //   borderWidth: 2,//设置外层边框
            //   borderColor:'#9ffcff',
            // },
            // areaColor:{
            //   image:img,
            //   repeat:'no-repeat',
            // },

            areaColor: {
              type: "radial",
              x: 0.5,
              y: 0.5,
              r: 0.8,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(147, 235, 248, 1)", // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: "rgba(2, 99, 206, 1)", // 100% 处的颜色
                },
              ],
              globalCoord: false, // 缺省为 false
            },

            // borderWidth: 1,//设置外层边框
            // borderColor:'#9ffcff',
            // shadowColor: "#9ffcff", // 阴影颜色
            shadowOffsetX: 5, // 阴影水平方向上的偏移距离
            shadowOffsetY: 10, // 阴影垂直方向上的偏移距离
            shadowBlur: 10, // 文字块的背景阴影长度

            borderWidth: 1, // 边框大小
            borderColor: "rgba(104, 152, 190, 1)", // 边框样式
            shadowColor: "rgba(128, 217, 248, 1)", // 阴影颜色

            emphasis: {
              label: {
                color: "#ffffff",
              },
              itemStyle: {
                areaColor: "#a5d4fe",
              },
            },


          },

         
          label: {
            show: true,
            color: 'white',
            formatter: `{a}`,
          },
        },
      }
      this.chartInstance.setOption(initOption)

      // 进入省份事件函数
      this.chartInstance.on('click', async e => {
        
        // 通过工具函数拿到点击的地图对应的中文拼音(key),和拼接出需要的文件路径(path)
        const ProvinceInfo = getProvinceMapInfo(e.name)

        // 先判断是否已经存在需要请求的数据
        if (!this.cityMapData[ProvinceInfo.key]) {
          // 不存在： 发送请求,获取点击的地图的矢量数据
          const { data: res } = await this.$http.get(ProvinceInfo.path)
          // 把请求到的数据保存下来
          this.cityMapData[ProvinceInfo.key] = res
          // 注册点击的地图
          this.$echarts.registerMap(ProvinceInfo.key, res)
        }

        // 设置最新的配置项
        const changeOption = {
          geo: {
            map: ProvinceInfo.key,
            center: undefined,
          },
        }
        // 赋值给 echarts实例
        this.chartInstance.setOption(changeOption)
      })

      
      this.chartInstance.on('click',arg=>{
        //console.log(arg)
        if(arg.name=='济南'){
          window.location.href='http://localhost:8999/#/test/"济南"'
        }
        if(arg.name=='南京'){
          window.location.href='http://localhost:8999/#/test/"南京"'
        }
        if(arg.name=='苏州'){
          window.location.href='http://localhost:8999/#/test/"苏州"'
        }
        if(arg.name=='昆明'){
          window.location.href='http://localhost:8999/#/test/"昆明"'
        }
        if(arg.name=='西安'){
          window.location.href='http://localhost:8999/#/test/"西安"'
        }
        if(arg.name=='石家庄'){
          window.location.href='http://localhost:8999/#/test/"石家庄"'
        }
        if(arg.name=='太原'){
          window.location.href='http://localhost:8999/#/test/"太原"'
        }
        if(arg.name=='呼和浩特'){
          window.location.href='http://localhost:8999/#/test/"呼和浩特"'
        }
        if(arg.name=='沈阳'){
          window.location.href='http://localhost:8999/#/test/"沈阳"'
        }
        if(arg.name=='长春'){
          window.location.href='http://localhost:8999/#/test/"长春"'
        }
        if(arg.name=='哈尔滨'){
          window.location.href='http://localhost:8999/#/test/"哈尔滨"'
        }
        if(arg.name=='杭州'){
          window.location.href='http://localhost:8999/#/test/"杭州"'
        }
        if(arg.name=='合肥'){
          window.location.href='http://localhost:8999/#/test/"合肥"'
        }
        if(arg.name=='乌鲁木齐'){
          window.location.href='http://localhost:8999/#/test/"乌鲁木齐"'
        }
        if(arg.name=='福州'){
          window.location.href='http://localhost:8999/#/test/"福州"'
        }
        if(arg.name=='南昌'){
          window.location.href='http://localhost:8999/#/test/"南昌"'
        }
        if(arg.name=='郑州'){
          window.location.href='http://localhost:8999/#/test/"郑州"'
        }
        if(arg.name=='武汉'){
          window.location.href='http://localhost:8999/#/test/"武汉"'
        }
        if(arg.name=='长沙'){
          window.location.href='http://localhost:8999/#/test/"长沙"'
        }
        if(arg.name=='广州'){
          window.location.href='http://localhost:8999/#/test/"广州"'
        }
        if(arg.name=='南宁'){
          window.location.href='http://localhost:8999/#/test/"南宁"'
        }
        if(arg.name=='海口'){
          window.location.href='http://localhost:8999/#/test/"海口"'
        }
        if(arg.name=='成都'){
          window.location.href='http://localhost:8999/#/test/"成都"'
        }
        if(arg.name=='贵阳'){
          window.location.href='http://localhost:8999/#/test/"贵阳"'
        }
        if(arg.name=='拉萨'){
          window.location.href='http://localhost:8999/#/test/"拉萨"'
        }
        if(arg.name=='兰州'){
          window.location.href='http://localhost:8999/#/test/"兰州"'
        }
        if(arg.name=='西宁'){
          window.location.href='http://localhost:8999/#/test/"西宁"'
        }
        if(arg.name=='银川'){
          window.location.href='http://localhost:8999/#/test/"银川"'
        }
        if(arg.name=='深圳'){
          window.location.href='http://localhost:8999/#/test/"深圳"'
        }
        if(arg.name=='大连'){
          window.location.href='http://localhost:8999/#/test/"大连"'
        }
        if(arg.name=='宁波'){
          window.location.href='http://localhost:8999/#/test/"宁波"'
        }
        if(arg.name=='青岛'){
          window.location.href='http://localhost:8999/#/test/"青岛"'
        }
        if(arg.name=='厦门'){
          window.location.href='http://localhost:8999/#/test/"厦门"'
        }
      })


    },


    // 发送请求，获取数据
    async getData() {
      // http://101.34.160.195:8888/api/map
      // const { data: res } = await this.$http.get('/map')

      const res =      [
                          {
                              "name": "南方城市",
                              "children": [
                                  {
                                      "name": "苏州",
                                      "value": [120.619585, 31.299379]
                                  },{
                                      "name": "南京",
                                      "value": [118.767413, 32.041544]
                                  },{
                                      "name": "昆明",
                                      "value": [102.73,25.04]
                                  },{
                                      "name": "杭州",
                                      "value": [120.153576, 30.287459]
                                  },{ 
                                      "name": "福州",
                                      "value": [119.3,26.08]
                                  },{ 
                                      "name": "南昌",
                                      "value": [115.892151, 28.676493]
                                  },{ 
                                      "name": "武汉",
                                      "value": [114.298572, 30.584355]
                                  },{ 
                                      "name": "长沙",
                                      "value": [113,28.21]
                                  },{ 
                                      "name": "广州",
                                      "value": [113.280637, 23.125178]
                                  },{ 
                                      "name": "南宁",
                                      "value": [108.320004,22.82402]
                                  },{ 
                                      "name": "海口",
                                      "value": [110.35,20.02]
                                  },{ 
                                      "name": "成都",
                                      "value": [104.065735,30.659462]
                                  },{ 
                                      "name": "贵阳",
                                      "value": [106.713478, 26.578343]
                                  },{ 
                                      "name": "深圳",
                                      "value": [114.085947, 22.547]
                                  },{ 
                                      "name": "厦门",
                                      "value": [118.1,24.46]
                                  }
                                  
                              ]
                          },
                          {
                              "name": "北方城市",
                              "children": [
                                  {
                                      "name": "济南",
                                      "value": [117,36.65]
                                  },{                                  
                                      "name": "西安",
                                      "value": [108.948024,34.263161]
                                  },{                                  
                                      "name": "石家庄",
                                      "value": [114.48,38.03]
                                  },{                                  
                                      "name": "太原",
                                      "value": [112.53,37.87]
                                  },{                                  
                                      "name": "呼和浩特",
                                      "value": [111.670801, 40.818311]
                                  },{                                  
                                      "name": "沈阳",
                                      "value": [123.429096, 41.796767]
                                  },{                                  
                                      "name": "长春",
                                      "value": [125.3245, 43.886841]
                                  },{                                  
                                      "name": "哈尔滨",
                                      "value": [126.63,45.75]
                                  },{                                  
                                      "name": "合肥",
                                      "value": [117.283042, 31.86119]
                                  },{                                  
                                      "name": "乌鲁木齐",
                                      "value": [87.617733,43.792818]
                                  },{ 
                                      "name": "郑州",
                                      "value": [113.665412,34.757975]
                                  },{ 
                                      "name": "拉萨",
                                      "value": [91.132212,29.660361]
                                  },{ 
                                      "name": "兰州",
                                      "value": [103.823557,36.058039]
                                  },{ 
                                      "name": "西宁",
                                      "value": [101.778916, 36.623178]
                                  },{ 
                                      "name": "银川",
                                      "value": [106.27,38.47]
                                  },{ 
                                      "name": "大连",
                                      "value": [121.618622, 38.91459]
                                  },{ 
                                      "name": "宁波",
                                      "value": [121.549792, 29.868388]
                                  },{ 
                                      "name": "青岛",
                                      "value": [120.33,36.07]
                                  }
                                  
                              ]
                          }
                      ]

      //console.log(res)
      this.allData = res

      this.updateChart()
    },


    // 更新图表配置项
    updateChart() {
      // 图例的数据
      const legendArr = this.allData.map(item => {
        return item.name
      })
      // 散点图的数据
      const seriesArr = this.allData.map(item => {
        // return 一个类别下的所有散点数据
        return {
          type: 'effectScatter',
          // 图例的name需要与series的name相同
          name: item.name,   //黄金用户、白金用户
          data: item.children,

          // 让散点图使用地图坐标系统
          coordinateSystem: 'geo',
          // 涟漪动画效果配置
          rippleEffect: {
            // 涟漪效果直径
            scale: 6,
            // 空心的涟漪动画效果
            brushType: 'stroke',
          },
        }
      })

      // 数据配置项
      const dataOption = {

        color:['#e705ef', '#550cde'],
        //左下角的图例效果
        legend: {
          left: '2%',
          bottom: '5%',
          // 图例的方向
          orient: 'verticle',
          data: legendArr.reverse(),
        },
        
        series: seriesArr
      }

      this.chartInstance.setOption(dataOption)
    },


    // 不同分辨率的响应式
    screenAdapter() {
      // 当前比较合适的字体大小
      const titleFontSize = (this.$refs.mapRef.offsetWidth / 100) * 3.6

      // 响应式的配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: 25,
          },
        },
        legend: {
          // 图例宽度
          itemWidth: titleFontSize / 2,
          // 图例高度
          itemHeight: titleFontSize / 2,
          // 间隔
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2,
          },
        },
      }

      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },

    // 回到中国地图
    chinaMap() {
      const chinaMapOption = {
        geo: {
          map: 'china',
        },
      }
      this.chartInstance.setOption(chinaMapOption)
    },
  },
}
</script>

<style lang="less" scoped></style>
