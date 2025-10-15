<template>
	<view>
		<!-- 游戏内容 scale(1.78) -->
		<view :id="DOMID" ref="videoDom" class="video_dom" v-if="routeroptions.did==1007" :style="{
			bottom:'calc(550rpx + env(safe-area-inset-bottom))',
			transform: 'rotate(90deg) scale(1.5)'
		}" />
		<view :id="DOMID" ref="videoDom" class="video_dom" v-else-if="routeroptions.did==1107" :style="{
			bottom:'env(safe-area-inset-bottom)',
			transform:'rotate(90deg) scale(1.4,1.8)'
		}" />
		<view :id="DOMID" ref="videoDom" class="video_dom" v-else-if="routeroptions.did==1207||routeroptions.did==1307||routeroptions.did==1407" :style="{
			bottom:'env(safe-area-inset-bottom)',
			transform:'rotate(90deg)scale(1.6,1.8)'
		}" />
		<view :id="DOMID" ref="videoDom" class="video_dom" v-else :style="{
			transform: routeroptions.did==1004&&isSitPNum > 2 ? 'rotate(180deg)':'rotate(0deg)',
		}" />
	</view>
</template>

<script>
	import WTN from './WTN/index.js'
	import TrtcVideo from './TRTC/index.js'
	import QuicklyLive from './QuicklyLive/index.js'
	import RtcVideo from './RTC/index.js'
	export default {
		props: {
			soundSwitch: {
				type: Boolean,
				default: true
			},
			isSitPNum: {
				type: Number,
				default: -1
			},
			routeroptions: {
				type: Object,
				default: () => ({})
			}
		},
		data() {
			return {
				DOMID: 'showtrtc',
				userId: '',
				video: null
			}
		},
		watch: {
			routeroptions: {
				deep: true,
				handler(val) {
					this.$nextTick(() => {
						this.userId = uni.getStorageSync('userInfo').user_id && uni.getStorageSync('userInfo')
							.user_id
							.toString()
						this.init()
					})
				}
			},
		},
		methods: {
			init() {
				if (this.routeroptions.push_button == 1) { // trtc直播
					this.video = new TrtcVideo({
						domId: this.DOMID,
						userId: this.userId,
						roomId: this.routeroptions.id,
						sdkAppSecret: this.routeroptions.live_config.sdkAppSecret,
						sdkAppid: this.routeroptions.live_config.sdkAppid,
					})
				} else if (this.routeroptions.push_button == 2) { // 快直播
					this.video = new QuicklyLive({
						domId: this.DOMID,
						playurl: this.routeroptions.playurl,
						android: this.routeroptions.android
					})
				} else if (this.routeroptions.push_button == 3) { // rtc直播
					this.video = new RtcVideo({
						dom: this.$refs.videoDom.$el,
						userId: this.userId,
						roomId: this.routeroptions.id,
						rtc: this.routeroptions.rtc
					})
				} else if (this.routeroptions.push_button == 5) { // 火山 wtn
					this.video = new WTN({
						dom: this.$refs.videoDom.$el,
						roomId: this.routeroptions.id,
						wtnconfig: this.routeroptions.wtn_live_config,
						soundSwitch: this.soundSwitch
					})
				}
				this.sound(this.soundSwitch)
			},
			// 断开连接
			exitRoom() {
				this.video.exitRoom()
			},
			// 获取图片
			async getImageUrl() {
				return this.video.getImage()
			},
			// 打开/关闭声音  true打开，false关闭
			sound(bool) {
				this.video.sound(bool)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.video_dom {
		width: 100%;
		height: 100%;
		position: fixed;
		inset: 0;
		margin: auto;
		background: #000;
		z-index: -2;
	}
</style>