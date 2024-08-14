
export type ISettingValue = string | number | boolean;

interface ISetting {
	title: string,
	type: 'text' | 'textarea' | 'radio',
	note?: string,
	option?: Record<string, string>,
	rows?: number,
	value: ISettingValue,
}

class Setting {
	private data: ISetting;
	constructor(setting: ISetting) {
		this.data = setting;
	}
	get value(): ISettingValue {
		return this.data.value;
	}
	set value(newValue: ISettingValue) {
		this.data.value = newValue;
	}
}

class Settings {
	private name: string;
	private actions: Actions;
	constructor(name: string, actions: Actions) {
		this.name = name;
		this.actions = actions;
	}
	protected async fillSettings(settings: Record<string, Setting>) {
		const _data = await this.actions.get(this.name);
		for (const k in settings) {
			if (_data.hasOwnProperty(k)) {
				settings[k].value = _data[k];
			}
		}
	}
	protected async saveSettings(settings: Record<string, Setting>) {
		const saveData: Record<string, ISettingValue> = {};
		for (const k in settings) {
			saveData[k] = settings[k].value;
		}
		await this.actions.save(this.name, saveData);
	}
}

class SiteSettings extends Settings {
	// 站点设置
	private settings = {
		title: new Setting({
			title: '网站标题',
			type: 'text',
			value: '网站标题',
		}),
	}
	async data() {
		await this.fillSettings(this.settings);
		return this.settings;
	}
	async save() {
		await this.saveSettings(this.settings);
	}
}

class EmailSettings extends Settings {
	// 邮件设置
	private settings = {
		api_type: new Setting({
			title: 'API类型',
			type: 'radio',
			option: { mailersend: 'mailersend' },
			value: 'mailersend',
		}),
		api_token: new Setting({
			title: 'API密钥',
			type: 'radio',
			value: '',
		}),
		from_name: new Setting({
			title: '发信人名称',
			type: 'text',
			value: '',
		}),
		from_email: new Setting({
			title: '发信人邮箱',
			type: 'text',
			value: '',
		}),
	};
	async data() {
		await this.fillSettings(this.settings);
		return this.settings;
	}
	async save() {
		await this.saveSettings(this.settings);
	}
}

interface Actions {
	get: (name: string) => Promise<Record<string, ISettingValue>>,
	save: (name: string, data: Record<string, ISettingValue>) => Promise<void>,
}


export interface Configs {
	site: SiteSettings,
	email: EmailSettings,
}

export class Config {
	public configs: Configs;
	constructor(_actions: Actions) {
		this.configs = {
			site: new SiteSettings("site", _actions),
			email: new EmailSettings("email", _actions),
		}
	}
}
