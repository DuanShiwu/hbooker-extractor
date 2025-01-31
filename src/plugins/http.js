import axios from 'axios'

const mixin = {
  baseUrl: '/api', //url前缀
  standardFlag: true,
  timeout: 15000,
  withCredentials: false //跨域请求是否使用凭证
}

console.log("baseUrl",mixin.baseUrl)

const para = {
  app_version: '2.3.020',
  device_token: 'ciweimao_powered_by_zsakvo_with_vue'
}

axios.interceptors.response.use(
  response => {
    // console.log("response",response.config)
    // console.log("response",response.config.url)
    return response
  },
  error => {
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          error.message = '请求错误'
          break
        case 401:
          error.message = '未授权，请登录'
          break
        case 403:
          error.message = '拒绝访问'
          break
        case 404:
          error.message = '请求地址出错'
          break
        case 408:
          error.message = '请求超时'
          break
        case 500:
          error.message = '服务器内部错误'
          break
        case 501:
          error.message = '服务未实现'
          break
        case 502:
          error.message = '网关错误'
          break
        case 503:
          error.message = '服务不可用'
          break
        case 504:
          error.message = '网关超时'
          break
        case 505:
          error.message = 'HTTP版本不受支持'
          break
        default:
      }
    }
    return Promise.reject(error)
  }
)

function get(options, final) {
  //拷贝
  let params = Object.assign({}, para, options.para)

  return new Promise((resolve, reject) => {
    axios
      .get(mixin.baseUrl + options.url, {
        params: params
      })
      .then(response => {
        console.log("请求",{
          "url":mixin.baseUrl + options.url,
          "params":params
        })
        console.log("response.data",response.data)
        let data = this.$dcy(response.data.trim())
        console.log("response.data.$dcy",data)
        console.log("\n")
        var lastIndex = data.lastIndexOf('}')
        data = data.substr(0, lastIndex + 1)
        let json = JSON.parse(data)
        switch (json.code) {
          case 100000:
            // console.log("成功");
            resolve(json.data)
            break
          case 200100:
            this.$router.push('/login')
            break
          default:
            this.$Notify.error({
              title: '错误',
              message: json.tip
            })
        }
      })
      .catch(err => {
        this.$Notify.error({
          title: '错误',
          message: err.message
        })
        reject(err)
      })
      .finally(() => {
        if (final != null) final()
      })
  })
}

function post(obj, final) {
  let options = mixin
  options = Object.assign({}, options, obj)
  return new Promise((resolve, reject) => {
    axios
      .post(options.baseUrl + options.url, options.para, {
        headers: options.header,
        timeout: options.timeout,
        withCredentials: options.withCredentials
      })
      .then(
        response => {
          // console.log("request",{
          //   url: options.baseUrl + options.url,
          //   data: options.para,
          //   headers: options.header,
          //   withCredentials: options.withCredentials
          // })
          let data = this.$dcy(response.data.trim())
          var lastIndex = data.lastIndexOf('}')
          data = data.substr(0, lastIndex + 1)
          let json = JSON.parse(data)
          switch (json.code) {
            case 100000:
              resolve(json.data)
              break
            default:
              this.$Notify.error({
                title: '错误',
                message: json.tip
              })
          }
        },
        err => {
          this.$Notify.error({
            title: '错误',
            message: err.message
          })
          reject(err)
        }
      )
      .finally(() => {
        if (final != null) final()
      })
  })
}

const installHttp = {
  get,
  post
}
export default installHttp
