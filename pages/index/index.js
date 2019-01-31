//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000
  },
  onLoad: function () {
    var self = this;
    try {
      const value = wx.getStorageSync('data')
      if (value) {
        syncData({data:JOSN.parse(value.data)});
        console.log('cache');
      } else {
        getData();
      }
    } catch (e) {
      getData();
    }
    function getData() {
      console.log('net');
      wx.request({
        url: 'https://en.chenzhicheng.com/liulishuo.json',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.setStorage({
            key: 'data',
            data: JSON.stringify(res.data)
          })
          syncData(res);
        }
      })
    }
    function syncData(res) {
      self.setData({
        courses: res.data['Level 1']
      });
    }
  },
  toStudy: function(event) {
    var part = event.currentTarget.dataset.id;
    var section = event.currentTarget.dataset.idx;
    wx.navigateTo({
      url: '/pages/study/index?part='+part+'&section='+section
    })
  }
})
