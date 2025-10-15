import LibGenerateTestUserSig from './lib-generate-test-usersig.min.js';

function genTestUserSig(SDKAPPID, SECRETKEY) {
	/**
	 * 签名过期时间，建议不要设置的过短
	 * <p>
	 * 时间单位：秒
	 * 默认时间：7 x 24 x 60 x 60 = 604800 = 7 天
	 */
	const EXPIRETIME = 604800;
	const generator = new LibGenerateTestUserSig(parseInt(SDKAPPID), SECRETKEY, EXPIRETIME);
	const userID = uni.getStorageSync('userId').toString()
	const userSig = generator.genTestUserSig(userID);
	return {
		sdkAppID: SDKAPPID,
		userSig
	};
}

export {
	genTestUserSig
}