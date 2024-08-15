import { generateRandom } from '@/utils/string';

class OtpInfo {
	// 验证码生成后间隔60秒才能再次生成
	private getnew_interval = 60 * 1000;
	// 验证码生成后在5分钟(300秒)内验证有效
	private code_validity = 300 * 1000;
	private lastGetNewTime: number = 0;
	private otpExpired: Record<string, number> = {};
	public getNew(): string {
		// 生成新的OTP
		const getnew_remain = this.lastGetNewTime + this.getnew_interval - Date.now();
		if (getnew_remain > 0) {
			throw new Error(`请在 ${Math.ceil(getnew_remain / 1000)} 秒后再次【获取验证码】`);
		}
		this.lastGetNewTime = Date.now();
		const code = generateRandom(6, '0123456789');
		this.otpExpired[code] = Date.now() + this.code_validity;
		return code;
	}
	public verify(otp: string): void {
		// 校验OTP
		if (!this.otpExpired[otp]) {
			throw new Error(`您输入的验证码不正确`);
		}
		if (Date.now() > this.otpExpired[otp]) {
			throw new Error(`验证码已失效，请【获取验证码】`);
		}
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
