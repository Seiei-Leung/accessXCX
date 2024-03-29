const app = getApp();

Page({
  data: {
    resultObj: {},
    openid: "",
    isLoading: true,
    isShowSecurerWrapper: true,
  },
  onLoad: function (options) {
    var that = this;
    if (app.globalData.openid) {
      console.log("不是通过 openidReadyCallback 回调");
      this.setData({
        openid: app.globalData.openid
      });
      wx.request({
        url: app.globalData.twUrl + "/estapi/api/VisitCheckIn/SearchCurrentCheckIn?openid=" + that.data.openid,
        method: "GET",
        success: function (res) {
          console.log(res);
          that.setData({
            isLoading: false
            });
          if (res.data.wechatnick) {
            // wx.reLaunch({
            //   url: '../signin/signin'
            // })
            that.setData({
              resultObj: res.data
            });
            if (res.data.wechatnick == '保安门卫') {
              that.setData({
                isShowSecurerWrapper: true
              });
            }
          }
        }
      });
    } else {
      app.openidReadyCallback = res => {
        console.log("通过 openidReadyCallback 回调");
        console.log(res);
        // 这里的 this 是指向当前页面的this
        this.setData({
          openid: res.data.openid
        })
        wx.request({
          url: app.globalData.twUrl + "/estapi/api/VisitCheckIn/SearchCurrentCheckIn?openid=" + that.data.openid,
          method: "GET",
          success: function (res1) {
            console.log(res1);
            that.setData({
              isLoading: false
            });
            if (res1.data.wechatnick) {
              // wx.reLaunch({
              //   url: '../signin/signin'
              // })
              that.setData({
                resultObj: res1.data
              });
              if (res.data.wechatnick == '保安门卫') {
                that.setData({
                  isShowSecurerWrapper: true
                });
              }
            }
          }
        });
      }
    }
  },
  gosignin: function() {
    wx.reLaunch({
      url: '../signin/signin'
    })
  },
  securerIn: function() {
    wx.navigateTo({
      url: '../securerHelp/securerHelp',
    })
  }
})