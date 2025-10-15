import VERTC, {
	WTNStreamEventsTypes,
	VideoRenderMode,
	StreamIndex,
} from '@volcengine/rtc';
import {
	upload
} from '@/api/request.js'
import {
	serverTime
} from '@/api/user/index.js'

export default class WTN {
	wtn
	wtnconfig
	soundSwitch
	constructor(option) {
		this.soundSwitch = option.soundSwitch
		this.trcengine = null
		this.wtnconfig = option.wtnconfig
		this.dom = option.dom
		this.roomId = option.roomId
		this.create()
	}

	async create() {
		VERTC.setParameter('ENABLE_PLAY_AFTER_CLICK', true);
		this.trcengine = VERTC.createEngine(this.wtnconfig.app_id);
		this.wtn = this.trcengine.getWTNStreamManager();
		this.wtn.on(WTNStreamEventsTypes.onWTNPlayStateChanged, e => {
			console.group('onWTNPlayStateChanged')
			console.log(1, 'appId==>', this.wtnconfig.app_id);
			console.log(2, 'roomId==>', this.roomId);
			console.groupEnd()
			this.sound(this.soundSwitch)
		});
		this.wtn.setWTNRemoteVideoPlayer(this.roomId, {
			renderDom: this.dom,
			renderMode: VideoRenderMode.RENDER_MODE_FIT
			// renderMode: VideoRenderMode.RENDER_MODE_FILL
		})
		this.wtn.startPlayWTN(null, this.roomId, false, false);
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
		this.wtn.setWTNRemoteAudioPlaybackVolume(
			this.roomId,
			bool ? 100 : 0
		);
	}

	async exitRoom() {
		if (!this.wtn) return
		await this.wtn.stopPlayWTN(this.roomId);
	}
}