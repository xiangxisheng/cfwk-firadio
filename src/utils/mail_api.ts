import { EmailSettingsType, EmailApiType } from '@/utils/config/email';

export class MailApi {
	/*
	邮件发送类的使用方法
	const mailApi = new MailApi(emailSettings);
	mailApi.setRecipient("username@domain.com");
	mailApi.setSubject("邮件主题");
	mailApi.setTextPlain("邮件内容");
	await mailApi.send();
	//*/
	private api_url: string = '';
	private api_token: string;
	private jsonData = {
		from: {
			email: '',
			name: '',
		},
		to: [
			{
				email: '',
			},
		],
		subject: '',
		text: '',
	};

	constructor(emailSettings: EmailSettingsType) {
		if (emailSettings.api_type.value === EmailApiType.mailersend) {
			this.api_url = 'https://api.mailersend.com/v1/email';
		}
		this.api_token = emailSettings.api_token.value;
		this.jsonData.from.name = emailSettings.from_name.value;
		this.jsonData.from.email = emailSettings.from_email.value;
	}

	public setRecipient(_mail_to: string): void {
		this.jsonData.to[0].email = _mail_to;
	}

	public setSubject(_subject: string): void {
		this.jsonData.subject = _subject;
	}

	public setTextPlain(_text: string): void {
		this.jsonData.text = _text;
	}

	public async send(): Promise<boolean> {
		if (this.api_url === '') {
			throw new Error('发信API的URL未设置');
		}
		// 使用 fetch 发送 JSON 数据到目标 API
		const response = await fetch(this.api_url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.api_token}`, // 如果需要身份验证
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(this.jsonData),
		});
		if (response.status === 202) {
			return true;
		}
		throw new Error(await response.text());
	}
}
