//index.js
//获取应用实例
const app = getApp()
var server = 'https://en.chenzhicheng.com';
// var server = 'http://localhost:3000/';

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
    duration: 1000,
    innerAudioContext: null,
    recorderManager: null,
    recording: false,
    mic: './mic_h.png',
    voice: './voice_h.png',
    recordText: '',
    text: '',
    courses:null,
    courseIndex: 0
  },
  onLoad: function () {
    var x = 10;
    var y = 65 + 85;
    var self = this;
    
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.onEnded(() => {
      console.log('开始播放')
      self.setData({
        rippleStyle: '',
        voice: './voice_h.png'
      });
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onPlay(() => {
      console.log('停止播放');
      self.setData({
        rippleStyle: 'animation:ripple 1s infinite linear;',
      });
    })
    this.setData({ innerAudioContext: innerAudioContext })

    const recorderManager = wx.getRecorderManager()
    recorderManager.onStart(() => {
      console.log('recorder start')
    })
    recorderManager.onPause(() => {
      console.log('recorder pause')
    })
    recorderManager.onStop((res) => {
      console.log('recorder stop', res.tempFilePath)
      const { tempFilePath } = res
      this.data.innerAudioContext.src = res.tempFilePath
      this.data.innerAudioContext.play();
      self.setData({
        recordText: 'checking'
      })
      var urls = server + '/upload';
      wx.uploadFile({
        url: urls,
        filePath: res.tempFilePath,
        name: 'file',
        header: {
          'content-type': 'multipart/form-data'
        },
        success: function (res) {
          var str = res.data;
          var data = JSON.parse(str);
          if (data && 
          data.results && 
          data.results[0] && 
          data.results[0].alternatives && 
          data.results[0].alternatives[0] && 
          data.results[0].alternatives[0].transcript) {
            self.setData({
              recordText: data.results[0].alternatives[0].transcript
            })
          } else {
            console.log(data);
            self.setData({
              recordText: 'failed'
            })
          }
        },
        fail: function (res) {
          console.log(res);
          wx.showModal({
            title: '提示',
            content: "网络请求失败，请确保网络是否正常",
            showCancel: false,
            success: function (res) {

            }
          });
          wx.hideToast();
        }
      });
    })
    recorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    })
    this.setData({ recorderManager: recorderManager })
    var self = this;
    wx.request({
      url: server + '/liulishuo.json', 
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json' 
      },
      success: function (res) {
        var courses = res.data['Level 1'][0]['Unit 1'][0].courses;
        console.log(res.data);
        self.setData({ 
          courses: courses,
          text: courses[0]
          })
      }
    })
  },
  read: function () {
    var cdnserver = 'http://pm5hzrwn2.bkt.clouddn.com';
    var self = this;
    var index = self.data.courseIndex;
    var video = self.data.courses[index].toLowerCase().replace(/ /g, '_').replace(/\W/g, '');
    this.data.innerAudioContext.src = cdnserver + '/' + video+'.wav'
    this.data.innerAudioContext.play();
    self.setData({
      voice: './voice.png',
      recordText: ''
    });
  },
  next: function() {
    var index = this.data.courseIndex;
    var courses = this.data.courses;
    if (index < courses.length-1) {
      this.setData({
        courseIndex: index + 1,
        text: courses[index + 1]
      });
    }
  },
  prev: function() {
    var index = this.data.courseIndex;
    var courses = this.data.courses;
    if (index>0) {
      this.setData({
        courseIndex: index - 1,
        text: courses[index - 1]
      });
    }
  },
  back: function() {
    wx.navigateBack({
      
    });
  },
  record: function () {
    var self = this;
    const options = {
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 24000,
      format: 'mp3',
      frameSize: 50
    }
    if (this.data.recording) {
      this.data.recorderManager.stop()
      self.setData({
        rippleStyleRecord: '',
        mic: './mic_h.png'
      });
    } else {
      this.data.recorderManager.start(options)
      self.setData({
        rippleStyleRecord: 'animation:ripple 1s infinite linear;',
        mic: './mic.png'        
      });
    }
    this.setData({ recording: !this.data.recording })
  },
  containerTap:function(res){
    
  } 
})
