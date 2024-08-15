import { InputBase, InputTextBox, InputSelect, Settings, Actions } from './base';

export enum EmailApiType {
	mailersend = 'mailersend',
}

class InputSelectApiType extends InputBase {
	value: EmailApiType;
	constructor(title: string, value: EmailApiType) {
		super('select', title);
		this.value = value;
	}
}

export interface EmailSettingsType {
	[key: string]: any;
	api_type: InputSelectApiType;
	api_token: InputTextBox;
	from_name: InputTextBox;
	from_email: InputTextBox;
}

export class EmailSettings extends Settings<EmailSettingsType> {
	// 邮件设置
	constructor(name: string, actions: Actions) {
		const settings: EmailSettingsType = {
			api_type: new InputSelectApiType('API类型', EmailApiType.mailersend),
			api_token: new InputTextBox('API密钥', 'mlsn.834af18f0e02b3dc01bac6ba8f554d032a8390a00d66de0d1e53b5b21592b9c2'),
			from_name: new InputTextBox('发信人名称', '验证码'),
			from_email: new InputTextBox('发信人邮箱', 'MS_AsXkbp@firadio.com'),
		};
		super(name, actions, settings);
	}
}
