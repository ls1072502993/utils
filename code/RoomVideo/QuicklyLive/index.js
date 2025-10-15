import TCPlayer from 'tcplayer.js';
import 'tcplayer.js/dist/tcplayer.min.css';
import {
	serverTime
} from '@/api/user/index.js'
import {
	upload
} from '@/api/request.js'

class QuicklyLive {
	constructor(option) {
		this.domId = option.domId
		this.playurl = option.playurl
		this.android = option.android
		this.muted = option.android ? true : false
		this.nowTime = Date.now()
		this.create()
	}

	create() {
		const video = document.createElement("video")
		video.setAttribute("id", "video" + this.nowTime);

		video.setAttribute("style", "width:100%;height:100%;background-color:#000");

		// 	video.style.objectFit = 'fill'
		video.style.objectFit = 'contain'
		video.setAttribute('preload', "auto");
		video.setAttribute('playsinline', true) // video的属性
		video.setAttribute('webkit-playsinline', true) // video的属性
		document.getElementById(this.domId).appendChild(video); //为这个盒子中添加一个video元素

		this.player = TCPlayer("video" + this.nowTime, {
			sources: [{
				src: this.playurl,
			}],
			fakeFullscreen: true,
			muted: this.muted,
			controls: false,
			licenseUrl: 'https://license.vod2.myqcloud.com/license/v2/1325823927_1/v_cube.license', // 页面报 lack_license_url 的时候就加这个就可以了
			autoplay: true,
			controlBar: {
				playToggle: false,
				progressControl: false,
				volumePanel: false,
				currentTimeDisplay: false,
				durationDisplay: false,
				timeDivider: false,
				playbackRateMenuButton: false,
				fullscreenToggle: false,
				QualitySwitcherMenuButton: false,
			},
		});
	}

	getImage() {
		return new Promise((resolve, reject) => {
			// 调用drawImage函数绘制视频帧到canvas上，并获取绘制结果的URL
			let video = document.getElementsByTagName('video')[0]
			// 创建一个canvas元素
			const canvas = document.createElement("canvas");
			// 设置canvas的宽度和高度与视频的宽度和高度相同
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			// 获取2D绘图上下文
			const ctx = canvas.getContext("2d");
			// 在canvas上绘制视频帧
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			ctx.shadowOffsetX = 5;
			ctx.shadowOffsetY = 5;
			ctx.shadowBlur = 5;
			ctx.shadowColor = "#000";
			ctx.font = "40px xmjj";
			ctx.fillStyle = "#fff";
			serverTime().then(res => {
				ctx.fillText(res.data.server_time, 5, 30);
				canvas.toBlob((blob) => {
					upload('/file/insert', URL.createObjectURL(blob), {
						group_id: 45 // 对应后台“用户微信头像”文件分组
					}).then(imgres => {
						if (imgres.status == 200) {
							resolve(imgres.data.url)
						} else {
							reject('图片上传失败：' + data.message)
						}
					})
				});
			})
		})
	}

	sound(bool) {
		this.player.muted(!bool)
		this.player.volume(bool ? 0.9 : 0)
	}

	exitRoom() {
		if (!this.player) return
		this.player.unload()
		this.player.dispose()
		this.player = null
	}
}

export default QuicklyLive