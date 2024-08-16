import { generateRandom } from '@/utils/string';

class CodeInfo {
	private expired: number; // 记录有效期
	public isUsed: boolean = false; // 标记是否使用过
	constructor(code_validity: number) {
		this.expired = Date.now() + code_validity;
	}
	public isExpired() {
		return this.expired < Date.now();
	}
}

class OtpInfo {
	// 验证码可以尝试的次数限制
	private maxAttempts: number = 5;
	// 验证码生成后间隔60秒才能再次生成
	private getnew_interval = 60 * 1000;
	// 验证码生成后在5分钟(300秒)内验证有效
	private code_validity = 300 * 1000;
	private lastGetNewTime: number = 0;
	private otpExpired: Record<string, CodeInfo> = {};
	private tryCount: number = 0; //记录尝试次数
	public getNew(): string {
		// 生成新的OTP
		const getnew_remain = this.lastGetNewTime + this.getnew_interval - Date.now();
		if (getnew_remain > 0) {
			throw new Error(`请在 ${Math.ceil(getnew_remain / 1000)} 秒后再次【获取验证码】`);
		}
		this.lastGetNewTime = Date.now();
		const code = generateRandom(6, '0123456789');
		this.otpExpired[code] = new CodeInfo(this.code_validity);
		return code;
	}
	public verify(otp_code: string): void {
		// 校验OTP
		const tryRemain = this.maxAttempts - this.tryCount;
		if (tryRemain <= 0) {
			throw new Error(`验证码尝试过多，请重新【获取验证码】`);
		}
		if (!this.otpExpired[otp_code]) {
			this.tryCount++;
			throw new Error(`您输入的验证码[${otp_code}]不正确\r\n（已尝试${this.tryCount}次，还剩${this.maxAttempts - this.tryCount}次）`);
		}
		if (this.otpExpired[otp_code].isUsed) {
			throw new Error(`您输入的验证码[${otp_code}]已使用，请重新【获取验证码】`);
		}
		if (this.otpExpired[otp_code].isExpired()) {
			throw new Error(`验证码已失效，请【获取验证码】`);
		}
		// 验证成功后就标记已使用
		this.otpExpired[otp_code].isUsed = true;
	}
}

export class OtpAuth {
	private data: Record<string, OtpInfo> = {};
	getNew(account: string): string {
		// 根据account生成新的OTP
		if (!this.data[account]) {
			this.data[account] = new OtpInfo();
		}
		return this.data[account].getNew();
	}
	verify(account: string, code: string): void {
		// 根据account校验OTP
		if (!this.data[account]) {
			throw new Error(`请先【获取验证码】`);
		}
		this.data[account].verify(code);
	}
}
