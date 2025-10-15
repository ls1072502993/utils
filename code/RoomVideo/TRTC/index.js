import {
	upload
} from '@/api/request.js'
import {
	serverTime
} from '@/api/user/index.js'
import TRTC from 'trtc-sdk-v5';
import {
	genTestUserSig
} from './getTrtcData';

class TrtcVideo {
	constructor(option) {
		this.trtc = null
		this.trtcUserId = null
		this.domId = option.domId
		this.userId = option.userId || 'guest'
		this.roomId = option.roomId
		const trtcData = genTestUserSig(option.sdkAppid, option.sdkAppSecret)
		this.userSig = trtcData.userSig;
		this.sdkAppId = Number(trtcData.sdkAppID)
		this.create()
	}

	async create() {
		this.trtc = TRTC.create();
		// 在进房前监听
		this.trtc.on(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, event => {
			const userId = event.userId;
			this.trtcUserId = event.userId
			const streamType = event.streamType;
			this.trtc.startRemoteVideo({
				userId,
				streamType,
				view: this.domId,
				option: {
					fillMode: 'contain'
				}
			});
		});
		try {
			await this.trtc.enterRoom({
				strRoomId: this.roomId,
				enableAutoPlayDialog: false,
				scene: 'rtc',
				role: 'audience',
				sdkAppId: this.sdkAppId,
				userId: this.userId,
				userSig: this.userSig
			});
		} catch (error) {
			console.error('error ' + error);
		}
	}

	getImage() {
		return new Promise((resolve, reject) => {
			// 获取远端主流视频帧
			let frameData = this.trtc.getVideoSnapshot({
				userId: this.trtcUserId,
				streamType: TRTC.TYPE.STREAM_TYPE_MAIN
			})
			// 创建Canvas对象
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			// 加载图片
			var img = new Image();
			img.src = frameData;
			img.onload = function() {
				// 画出图片
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);
				ctx.shadowOffsetX = 5;
				ctx.shadowOffsetY = 5;
				ctx.shadowBlur = 5;
				ctx.shadowColor = "#000";
				ctx.font = "40px xmjj";
				ctx.fillStyle = "#fff";
				serverTime().then(res => {
					ctx.fillText(res.data.server_time, 5, 30);
					// 将Canvas转为图片
					var dataURL = canvas.toDataURL();
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
			}
		})
	}

	sound(bool) {
		this.trtc.muteRemoteAudio('*', !bool);
	}

	async exitRoom() {
		if (!this.trtc) return
		// 通话结束时
		await this.trtc.exitRoom();
		// 若后续无需再使用该 trtc，则销毁 trtc，并释放引用。
		this.trtc.destroy();
		this.trtc = null;
	}
}

export default TrtcVideo