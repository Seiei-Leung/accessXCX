const app = getApp();

Page({
  data: {
    dialogTitle: "",
    dialogTxt: "",
    iconType: 0,
    funcType: 0,
    openid: "",
    platenum: "",
    interviewee: ""
  },
  onReady: function () {
    this.dialog = this.selectComponent("#dialog");
  },
  onLoad: function (query) {
    const scene = decodeURIComponent(query.scene).split(":")[1];
    var that = this;
    wx.getStorage({
      key: 'platenum',
      success(res) {
        that.setData({
          platenum: res.data
        });
      }
    });
    wx.getStorage({
      key: 'interviewee',
      success(res) {
        that.setData({
          interviewee: res.data
        });
      }
    });
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      });
      wx.request({
        url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/CheckOut',
        method: "GET",
        data: {
          openid: that.data.openid,
          guard: scene
        },
        success: function(res1) {
          if (res1.data.result == "SUCCESS") {
            var senddata = {};
            senddata.openId = app.globalData.openid;
            senddata.plate = that.data.platenum;
            senddata.interviewee = that.data.interviewee;
            senddata.state = 0;
            wx.request({
              url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/SendMPTemp',
              data: senddata,
              success: function (res2) {
                that.setData({
                  dialogTitle: "提示",
                  dialogTxt: "成功放行",
                  iconType: 1,
                  funcType: 1
                });
                that.dialog.showModal();
              },
              fail: function (res2) {
                that.setData({
                  dialogTitle: "提示",
                  dialogTxt: "成功放行，但消息模板接口调用错误",
                  iconType: 1,
                  funcType: 1
                });
                that.dialog.showModal();
              }
            })
          } else if (res1.data.result == "找不到对应的登记记录！") {
            that.setData({
              dialogTitle: "提示",
              dialogTxt: "没有入厂登记记录，请扫描入厂二维码",
              iconType: 0,
              funcType: 1
            });
            that.dialog.showModal();
          } else {
            this.setData({
              dialogTitle: "提示",
              dialogTxt: "放行失败，请重试",
              iconType: 0,
              funcType: 1
            });
            this.dialog.showModal();
          }
        },
        fail: function (res) {
          this.setData({
            dialogTitle: "提示",
            dialogTxt: "放行失败，请重试",
            iconType: 0,
            funcType: 1
          });
          this.dialog.showModal();
        }
      });
    } else {
      app.openidReadyCallback = res => {
        // 这里的 this 是指向当前页面的this
        this.setData({
          openid: res.data.openid
        });
        wx.request({
          url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/CheckOut',
          method: "GET",
          data: {
            openid: that.data.openid,
            guard: scene
          },
          success: function (res1) {
            if (res1.data.result == "SUCCESS") {
              var senddata = {};
              senddata.openId = app.globalData.openid;
              senddata.plate = that.data.platenum;
              senddata.state = 0;
              wx.request({
                url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/SendMPTemp',
                data: senddata,
                success: function (res2) {
                  that.setData({
                    dialogTitle: "提示",
                    dialogTxt: "成功放行",
                    iconType: 1,
                    funcType: 1
                  });
                  that.dialog.showModal();
                },
                fail: function (res2) {
                  that.setData({
                    dialogTitle: "提示",
                    dialogTxt: "成功放行，但消息模板接口调用错误",
                    iconType: 1,
                    funcType: 1
                  });
                  that.dialog.showModal();
                }
              })
            } else if (res1.data.result == "找不到对应的登记记录！") {
              that.setData({
                dialogTitle: "提示",
                dialogTxt: "没有入厂登记记录，请扫描入厂二维码",
                iconType: 0,
                funcType: 1
              });
              that.dialog.showModal();
            } else {
              this.setData({
                dialogTitle: "提示",
                dialogTxt: "放行失败，请重试",
                iconType: 0,
                funcType: 1
              });
              this.dialog.showModal();
            }
          },
          fail: function (res) {
            this.setData({
              dialogTitle: "提示",
              dialogTxt: "放行失败，请重试",
              iconType: 0,
              funcType: 1
            });
            this.dialog.showModal();
          }
        });
      }
    }
  }
})