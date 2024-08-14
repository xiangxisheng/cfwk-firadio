
interface ISetting {
	title: string,
	type: 'text' | 'textarea' | 'radio',
	note?: string,
	option?: Record<string, string>,
	rows?: number,
	value: string | number,
}

class Setting {
	private data: ISetting;
	constructor(setting: ISetting) {
		this.data = setting;
	}
	get value(): string | number {
		return this.data.value;
	}
	set value(newValue: string | number) {
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
	async data() {
		const _data = await this.actions.get(this.name);
		for (const k in this) {
			if (this.hasOwnProperty(k)) {
				const v = this[k];
				if (v instanceof Setting) {
					v.value = _data[k];
				}
			}
		}
		return this;
	}
	async save() {
		const saveData: Record<string, string | number> = {};
		for (const k in this) {
			if (this.hasOwnProperty(k)) {
				const v = this[k];
				if (v instanceof Setting) {
					saveData[k] = v.value;
				}
			}
		}
		await this.actions.save(this.name, saveData);
	}
}

class EmailSettings extends Settings {
	api_type = new Setting({
		title: 'API类型',
		type: 'radio',
		option: { mailersend: 'mailersend' },
		value: 'mailersend',
	});
	api_token = new Setting({
		title: 'API密钥',
		type: 'radio',
		value: '',
	});
	from_name = new Setting({
		title: '发信人名称',
		type: 'text',
		value: '',
	});
	from_email = new Setting({
		title: '发信人邮箱',
		type: 'text',
		value: '',
	});
}

interface Actions {
	get: (name: string) => Promise<Record<string, string | number>>,
	save: (name: string, data: Record<string, string | number>) => Promise<void>,
}

export class Config {
	public email: EmailSettings;
	constructor(_actions: Actions) {
		this.email = new EmailSettings("email", _actions);
	}
}
