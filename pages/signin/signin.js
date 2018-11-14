//index.js
//获取应用实例
const app = getApp();
var T1,T2,T3;

Page({
  data: {
    dialogTitle: "",
    dialogTxt: "",
    iconType: 0,
    funcType: 0,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    sizeArray: ["","业务","工程","拜访","快递", "面试", "送货"],
    sizeindex: 0,
    imgUrl: "",
    plateNumber: "",
    company: "",
    interviewee: "",
    intervieweeDept: "",
    isSelectPlateNumber: false,
    isSelectCompany: false,
    isSelectinterviewee: false,
    plateNumberResultList: [],
    companyResultList: [],
    intervieweeResultList: [],
    guard: "",
    openid: "",
    isLoading: false
  },
  onReady: function () {
    this.dialog = this.selectComponent("#dialog");
  },
  onLoad: function (query) {
    var that = this;
    const scene = decodeURIComponent(query.scene).split(":")[1];
    console.log("扫码识别保安编号：" + scene);
    wx.request({
      url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/SearchEmployee?code=' + scene,
      method: "GET",
      success: function(res) {
        console.log("保安名称：" + res.data.name);
        if (res.data.name) {
          that.setData({
            guard: res.data.name
          })
        }
      }
    })

    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      });
      wx.request({
        url: app.globalData.twUrl + "/estapi/api/VisitCheckIn/SearchCurrentCheckIn?openid=" + that.data.openid,
        method: "GET",
        success: function (res) {
          console.log(res);
          if (res.data.wechatnick) {
            that.setData({
              plateNumber: res.data.platenum,
              company: res.data.company,
              interviewee: res.data.interviewee,
              intervieweeDept: res.data.interviewee_dept,
              sizeindex: that.data.sizeArray.indexOf(res.data.cause)
            })
          }
        }
      });
    } else {
      app.openidReadyCallback = res => {
        // 这里的 this 是指向当前页面的this
        this.setData({
          openid: res.data.openid
        })
        wx.request({
          url: app.globalData.twUrl + "/estapi/api/VisitCheckIn/SearchCurrentCheckIn?openid=" + that.data.openid,
          method: "GET",
          success: function (res1) {
            if (res1.data.wechatnick) {
              that.setData({
                plateNumber: res1.data.platenum,
                company: res1.data.company,
                interviewee: res1.data.interviewee,
                intervieweeDept: res1.data.interviewee_dept,
                sizeindex: that.data.sizeArray.indexOf(res1.data.cause)
              })
            }
          }
        });
      }
    }


    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      // 这里的 this 是指向当前页面的this
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    } else {
      app.openidReadyCallback = res =>{
        // 这里的 this 是指向当前页面的this
        this.setData({
          openid: res.data.openid
        })
      }
    }
  },
  getUserInfo: function (e) {
    console.log(e);
    var that = this;
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          app.globalData.userInfo = e.detail.userInfo
          that.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
          })
        }
      }
    })
  },
  getPhoneNumber: function (e) {
    var that = this;
    console.log(e);
    if (e.detail.encryptedData && e.detail.iv) {
      var data = {};
      data.openid = this.data.openid;
      data.wechatnick = this.data.userInfo.nickName;
      data.mobile = "123456";
      data.platenum = this.data.plateNumber;
      data.company = this.data.company;
      data.interviewee = this.data.interviewee;
      data.interviewee_dept = this.data.intervieweeDept;
      data.cause = this.data.sizeArray[this.data.sizeindex];
      data.guard = this.data.guard;
      data.encryptedData = e.detail.encryptedData;
      data.iv = e.detail.iv;
      data.session_key = app.globalData.session_key;
      if (!data.interviewee.trim() || !data.interviewee_dept.trim() || !data.cause) {
        that.setData({
          dialogTitle: "提示",
          dialogTxt: "来访目的，受访人，受访部门不能为空！",
          iconType: 0,
          funcType: 0
        });
        that.dialog.showModal();
        return;
      }
      wx.request({
        url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/InsertData',
        method: "GET",
        data: data,
        success: function(res) {
          console.log(res);
          if (res.data.result == "SUCCESS") {
            var senddata = {};
            senddata.openId = app.globalData.openid;
            senddata.plate = data.platenum;
            wx.setStorage({
              key: "platenum",
              data: data.platenum
            })
            senddata.state = 1;
            wx.request({
              url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/SendMPTemp',
              data: senddata,
              success: function(res1){}
            })
            that.setData({
              dialogTitle: "提示",
              dialogTxt: "登记成功",
              iconType: 1,
              funcType: 0
            });
            that.dialog.showModal();
          }
        }
      })
    } else {
      this.setData({
        dialogTitle: "提示",
        dialogTxt: "登记失败",
        iconType: 0,
        funcType: 0
      });
      this.dialog.showModal();
    }
  },
  sizePickerChange: function (e) {
    this.setData({
      sizeindex: e.detail.value
    })
  },
  uploadimg: function () {
    var that = this;
    this.setData({
      isLoading: true
    });
    wx.chooseImage({
      sizeType: ['compressed'],
      success: function(res) {
        console.log(res.tempFilePaths["0"]);
        var tfp = res.tempFilePaths["0"];
        wx.uploadFile({
          url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/UploadFile',
          filePath: tfp,
          name: 'file',
          formData: {
            'user': 'test'
          },
          success(res1) {
            console.log(JSON.parse(res1.data).filename)
            wx.request({
              url: 'https://recognition.image.myqcloud.com/ocr/plate',
              header: {
                'content-type': 'application/json',
                'host': 'recognition.image.myqcloud.com',
                'authorization': '+WRUUN/cpFi3EH2RRnONEedMDfthPTEyNTY1OTcwMTYmYj0maz1BS0lERVBQTTltdlpralc4RU91YXg4OHBaRWtzdW9kTHFhekcmdD0xNTQyMDc4NDEzJmU9MTU0MjMzNzYxMyZyPTg3Nzg5ODIyNw=='
              },
              method: 'POST',
              data: {
                appid: '1256597016',
                url: JSON.parse(res1.data).filename
              },
              success: function (res2) {
                console.log(res2.data.message);
                if (res2.data.data.items[0]) {
                  console.log(res2.data.data.items[0].itemstring);
                  that.setData({
                    "isLoading": false,
                    "plateNumber": res2.data.data.items[0].itemstring
                  })
                } else {
                  that.setData({
                    isLoading: false,
                    dialogTitle: "提示",
                    dialogTxt: "图片识别失败",
                    iconType: 0,
                    funcType: 0
                  });
                  that.dialog.showModal();
                }
              },
              fail: function () {
                that.setData({
                  isLoading: false,
                  dialogTitle: "提示",
                  dialogTxt: "图片识别失败",
                  iconType: 0,
                  funcType: 0
                });
                that.dialog.showModal();
              }
            })
          },
          fail: function () {
            that.setData({
              isLoading: false,
              dialogTitle: "提示",
              dialogTxt: "图片上传失败",
              iconType: 0,
              funcType: 0
            });
            that.dialog.showModal();
          }
        })
      },
      fail: function () {
        that.setData({
          isLoading: false
        });
      }
    })
  },
  plateNumberChange: function (e) {
    this.setData({
      isSelectPlateNumber: true,
      plateNumber: e.detail.value
    });
    var that = this;
    clearTimeout(T1);
    T1 = setTimeout(() => {
      wx.request({
        url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/SearchPlate?keyword=' + e.detail.value,
        method: "GET",
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.length > 0) {
            that.setData({
              plateNumberResultList: res.data
            });
          } else {
            that.setData({
              isSelectPlateNumber: false
            });
          }
        }
      })
    }, 1500);
  },
  companyChange: function (e) {
    this.setData({
      isSelectCompany: true,
      company: e.detail.value
    });
    var that = this;
    clearTimeout(T2);
    T2 = setTimeout(() => {
      wx.request({
        url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/SearchCompany?keyword=' + e.detail.value,
        method: "GET",
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.length > 0) {
            that.setData({
              companyResultList: res.data
            });
          } else {
            that.setData({
              isSelectCompany: false
            })
          }
        }
      })
    }, 1500);
  },
  intervieweeChange: function (e) {
    this.setData({
      isSelectinterviewee: true,
      interviewee: e.detail.value
    });
    var that = this;
    clearTimeout(T3);
    T3 = setTimeout(() => {
      wx.request({
        url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/SearchStaff?keyword=' + e.detail.value,
        method: "GET",
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.length > 0) {
            that.setData({
              intervieweeResultList: res.data
            });
          } else {
            that.setData({
              isSelectinterviewee: false
            });
          }
        }
      })
    }, 1500);
  },
  closeShowBlock: function() {
    this.setData({
      isSelectPlateNumber: false,
      isSelectCompany: false,
      isSelectinterviewee: false
    })
  },
  selectCompany: function (e) {
    this.setData({
      company: e.currentTarget.dataset.company,
      isSelectCompany: false
    })
  },
  selectPlateNumber: function (e) {
    this.setData({
      plateNumber: e.currentTarget.dataset.plateNumber,
      isSelectPlateNumber: false
    })
  },
  selectinterviewee: function (e) {
    this.setData({
      interviewee: e.currentTarget.dataset.interviewee,
      intervieweeDept: e.currentTarget.dataset.intervieweedept,
      isSelectinterviewee: false
    })
  },
  test: function() {
    // wx.navigateTo({
    //   url: '../getout/getout',
    // })
  }
})
