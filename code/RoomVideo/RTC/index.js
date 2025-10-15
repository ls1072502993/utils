import VERTC, {
	RoomProfileType,
	MediaType,
	StreamIndex,
	VideoRenderMode,
	RTCAutoPlayPolicy
} from '@volcengine/rtc';
import {
	upload
} from '@/api/request.js'
import {
	serverTime
} from '@/api/user/index.js'

class RtcVideo {
	constructor(option) {
		this.trcengine = null
		this.rtcConfig = option.rtc
		this.dom = option.dom
		this.userId = option.userId.toString()
		this.roomId = option.roomId
		this.create()
	}

	async create() {
		// 创建 RTC 引擎
		VERTC.setParameter('ENABLE_PLAY_AFTER_CLICK', true);
		this.trcengine = VERTC.createEngine(this.rtcConfig.app_id, {
			// autoPlayPolicy: RTCAutoPlayPolicy.PLAY_MANUALLY
		});
		await this.trcengine.setUserVisibility(false)
		await this.trcengine.joinRoom(
			this.rtcConfig.token,
			this.roomId, {
				userId: this.userId,
			}, {
				isAutoPublish: true, // 采集音视频时自动发布到房间
				isAutoSubscribeAudio: true, // 自动订阅音频
				isAutoSubscribeVideo: true, // 自动订阅视频
			}
		)
		this.trcengine.on(VERTC.events.onUserPublishStream, async (e) => {
			await this.trcengine.setRemoteVideoPlayer(StreamIndex.STREAM_INDEX_MAIN, {
				userId: this.roomId,
				renderDom: this.dom,
				renderMode: VideoRenderMode.RENDER_MODE_FIT
			})
		});
	}

	getImage() {
		return new Promise(async (resolve, reject) => {
			// 获取远端主流视频帧
			const imgData = await this.trcengine.takeRemoteSnapshot(
				this.roomId,
				StreamIndex.STREAM_INDEX_MAIN
			)
			// 创建Canvas对象
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			canvas.width = imgData.width;
			canvas.height = imgData.height;
			ctx.putImageData(imgData, 0, 0);
			ctx.shadowOffsetX = 5;
			ctx.shadowOffsetY = 5;
			ctx.shadowBlur = 5;
			ctx.shadowColor = "#000";
			ctx.font = "40px xmjj";
			ctx.fillStyle = "#fff";
			serverTime().then(res => {
				ctx.fillText(res.data.server_time, 5, 30);
				// 将Canvas转为图片
				var dataURL = canvas.toDataURL('image/png');
				upload('/file/insert', dataURL, {
					group_id: 40 // 对应后台“用户微信头像”文件分组
				}).then(imgres => {
					if (imgres.status == 200) {
						resolve(imgres.data.url)
					} else {
						reject('图片上传失败：' + data.message)
					}
				})
			})
		})
	}

	async sound(bool) {
		// await this.trcengine.play()
		// await this.trcengine.setPlaybackVolume(
		// 	this.roomId,
		// 	StreamIndex.STREAM_INDEX_MAIN,
		// 	100
		// );
		// return
		this.trcengine.setPlaybackVolume(
			this.roomId,
			StreamIndex.STREAM_INDEX_MAIN,
			bool ? 100 : 0
		);
	}

	async exitRoom() {
		if (!this.trcengine) return
		await this.trcengine.leaveRoom();
	}
}

export default RtcVideo