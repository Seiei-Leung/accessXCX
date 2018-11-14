//app.js
App({
  onLaunch: function (options) {
    console.log(options.scene);
    this.globalData.scene = options.scene;
    var that = this;
    // 登录
    wx.login({
      success: res => {
        console.log(res.code);
        wx.request({
          url: "https://www.etscn.com.cn:40443/estapi/api/VisitCheckIn/WechatOpenid",
          data: {
            jscode: res.code
          },
          success: res => {
            that.globalData.session_key = res.data.session_key;
            that.globalData.openid = res.data.openid;
            if (this.openidReadyCallback) {
              this.openidReadyCallback(res)
            }
          }
        })
      }
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow: function(options) {
  },
  onHide: function() {
    
  },
  globalData: {
    twUrl: "https://www.etscn.com.cn:40443",
    userInfo: null,
    appid: "wx54ddcf5f1a31c88d",
    secret: "391e0b02e2e3eeea682e6c7524f3ca53",
    scene: null,
    openid: null,
    session_key: null
  }
})