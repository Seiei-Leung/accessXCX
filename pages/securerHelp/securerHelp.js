//index.js
//获取应用实例
const app = getApp();
var T1, T2, T3, T4;

Page({
  data: {
    visitorName: "",
    dialogTitle: "",
    dialogTxt: "",
    iconType: 0,
    funcType: 0,
    userInfo: {},
    visitResultArray: [" ", "业务", "工程", "拜访", "快递", "面试", "送货", "提货"],
    visitResultindex: 0,
    numOfPeopleArray: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    numOfPeopleIndex: 0,
    imgUrl: "",
    plateNumber: "",
    company: "",
    interviewee: "",
    intervieweeDept: "",
    isSelectPlateNumber: false,
    isSelectCompany: false,
    isSelectinterviewee: false,
    isSelectintervieweeDept: false,
    plateNumberResultList: [],
    companyResultList: [],
    intervieweeResultList: [],
    intervieweeDeptResultList: [],
    guard: "",
    openid: "",
    isLoading: false,
    peopleNum: "",
    isScan: false,
    iscloseImgReload: false
  },
  onReady: function () {
    this.dialog = this.selectComponent("#dialog");
  },
  onLoad: function (query) {
    if (app.globalData.openid) {
      console.log("不是通过 openidReadyCallback 回调");
      this.setData({
        openid: app.globalData.openid
      });
    } else {
      app.openidReadyCallback = res => {
        console.log("通过 openidReadyCallback 回调");
        // 这里的 this 是指向当前页面的this
        this.setData({
          openid: res.data.openid
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
  },
  getUserInfo: function (e) {
    console.log(e);
    var that = this;
    wx.getSetting({
      success: function (res) {
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
      var data = {};
      data.openid = "通伟门卫";
      data.wechatnick = this.data.userInfo.nickName;
      data.mobile = "123456";
      data.platenum = this.data.plateNumber;
      data.company = this.data.company;
      data.interviewee = this.data.interviewee;
      data.interviewee_dept = this.data.intervieweeDept;
      data.cause = this.data.visitResultArray[this.data.visitResultindex];
      data.guard = this.data.guard;
      data.numofp = this.data.numOfPeopleArray[this.data.numOfPeopleIndex];
      data.visitorname = this.data.visitorName;
      if (!data.interviewee.trim()) {
        that.setData({
          dialogTitle: "提示",
          dialogTxt: "受访人不能为空！",
          iconType: 0,
          funcType: 0
        });
        that.dialog.showModal();
        return;
      }
      if (!data.interviewee_dept.trim()) {
        that.setData({
          dialogTitle: "提示",
          dialogTxt: "受访部门不能为空！",
          iconType: 0,
          funcType: 0
        });
        that.dialog.showModal();
        return;
      }
      if (that.data.visitResultindex == 0) {
        that.setData({
          dialogTitle: "提示",
          dialogTxt: "来访事由不能为空！",
          iconType: 0,
          funcType: 0
        });
        that.dialog.showModal();
        return;
      }
      wx.request({
        url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/InsertData_Guard',
        method: "GET",
        data: data,
        success: function (res) {
          console.log(res);
          if (res.data.result == "SUCCESS") {
            that.setData({
              dialogTitle: "提示",
              dialogTxt: "登记成功",
              iconType: 1,
              funcType: 1
            });
            that.dialog.showModal();
          }
        }
      });
  },
  visitResultPickerChange: function (e) {
    this.setData({
      visitResultindex: e.detail.value
    })
  },
  numOfPeoplePickerChange: function (e) {
    this.setData({
      numOfPeopleIndex: e.detail.value
    })
  },
  uploadimg: function () {
    var that = this;
    this.setData({
      isLoading: true,
      iscloseImgReload: true
    });
    wx.chooseImage({
      sizeType: ['compressed'],
      success: function (res) {
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
                'authorization': JSON.parse(res1.data).authorization
              },
              method: 'POST',
              data: {
                appid: '1256597016',
                url: JSON.parse(res1.data).filename
              },
              success: function (res2) {
                console.log(res2.data);
                if (res2.data.data && res2.data.data.items && res2.data.data.items[0] && res2.data.data.items[0].itemstring) {
                  console.log(res2.data.data.items[0].itemstring);
                  that.setData({
                    "isLoading": false,
                    "iscloseImgReload": false,
                    "plateNumber": res2.data.data.items[0].itemstring
                  })
                } else {
                  that.setData({
                    isLoading: false,
                    iscloseImgReload: false,
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
                  iscloseImgReload: false,
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
              iscloseImgReload: false,
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
          isLoading: false,
          iscloseImgReload: false,
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
    this.closeAllSelectWrapper();
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
  showInterviewee: function () {
    var that = this;
    this.closeAllSelectWrapper();
    if (this.data.intervieweeDept.trim() == "") {
      that.setData({
        isLoading: false,
        iscloseImgReload: false,
        dialogTitle: "提示",
        dialogTxt: "请先输入来访部门",
        iconType: 0,
        funcType: 0
      });
      that.dialog.showModal();
      return;
    } else {
      var url = app.globalData.twUrl + '/estapi/api/VisitCheckIn/SelectEmployee?dept=' + this.data.intervieweeDept;
      wx.request({
        url: url,
        method: "GET",
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.length > 0) {
            that.setData({
              isSelectinterviewee: true,
              intervieweeResultList: res.data
            });
          } else {
            that.setData({
              isSelectinterviewee: true
            });
          }
        }
      })
    }
  },
  intervieweeChange: function (e) {
    this.closeAllSelectWrapper();
    var url = "";
    if (this.data.intervieweeDept.trim() == "") {
      url = app.globalData.twUrl + '/estapi/api/VisitCheckIn/SearchStaff?keyword=' + e.detail.value;
    } else {
      url = app.globalData.twUrl + '/estapi/api/VisitCheckIn/SearchEmployee?dept=' + this.data.intervieweeDept + "&keyword=" + e.detail.value;
    }
    this.setData({
      isSelectinterviewee: true,
      interviewee: e.detail.value,
      interviewee: ""
    });
    var that = this;
    clearTimeout(T3);
    T3 = setTimeout(() => {
      wx.request({
        url: url,
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
  showIntervieweeDept: function () {
    this.closeAllSelectWrapper();
    var that = this;
    wx.request({
      url: app.globalData.twUrl + "/estapi/api/VisitCheckIn/SelectDept",
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.length > 0) {
          that.setData({
            isSelectintervieweeDept: true,
            intervieweeDeptResultList: res.data
          });
        } else {
          that.setData({
            isSelectintervieweeDept: true
          });
        }
      }
    })
  },
  intervieweeDeptChange: function (e) {
    this.closeAllSelectWrapper();
    this.setData({
      isSelectintervieweeDept: true,
      intervieweeDept: e.detail.value,
      interviewee: ""
    });
    var that = this;
    clearTimeout(T4);
    T4 = setTimeout(() => {
      wx.request({
        url: app.globalData.twUrl + '/estapi/api/VisitCheckIn/SearchDept?keyword=' + e.detail.value,
        method: "GET",
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.length > 0) {
            that.setData({
              intervieweeDeptResultList: res.data
            });
          } else {
            that.setData({
              isSelectintervieweeDept: false
            });
          }
        }
      })
    }, 1500);
  },
  closeShowBlock: function () {
    this.setData({
      isSelectPlateNumber: false,
      isSelectCompany: false,
      isSelectinterviewee: false,
      isSelectintervieweeDept: false
    })
  },
  selectCompany: function (e) {
    this.setData({
      company: e.currentTarget.dataset.company,
      isSelectCompany: false
    })
  },
  selectPlateNumber: function (e) {
    console.log(e.currentTarget.dataset.platenumber)
    this.setData({
      plateNumber: e.currentTarget.dataset.platenumber,
      isSelectPlateNumber: false
    })
  },
  selectinterviewee: function (e) {
    this.setData({
      interviewee: e.currentTarget.dataset.interviewee,
      isSelectinterviewee: false
    });
    if (!(e.currentTarget.dataset.intervieweedept.trim() == "")) {
      this.setData({
        intervieweeDept: e.currentTarget.dataset.intervieweedept
      });
    }
  },
  selectintervieweeDept: function (e) {
    this.setData({
      intervieweeDept: e.currentTarget.dataset.intervieweedept,
      isSelectintervieweeDept: false,
      interviewee: ""
    })
  },
  test: function () {
    var that = this;
    wx.request({
      url: app.globalData.twUrl + "/estapi/api/VisitCheckIn/SearchCurrentCheckIn?openid=" + that.data.openid,
      method: "GET",
      success: function (res) {
        console.log(res);
      }
    });
  },
  closeImgReload: function () {
    this.setData({
      isLoading: false,
      iscloseImgReload: false
    })
  },
  closeAllSelectWrapper: function () {
    this.setData({
      isSelectinterviewee: false,
      isSelectintervieweeDept: false,
      isSelectCompany: false,
      isSelectPlateNumber: false
    })
  },
  visitorChange: function (e) {
    this.closeAllSelectWrapper();
    this.setData({
      visitorName: e.detail.value
    });
  }
})