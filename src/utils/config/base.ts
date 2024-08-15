export type ISettingValue = string | number | boolean;

export class InputBase {
	type: string;
	title: string;
	value: any;
	note?: string;
	constructor(type: string, title: string) {
		this.type = type;
		this.title = title;
	}
}

export class InputTextBox extends InputBase {
	value: string;
	constructor(title: string, value: string) {
		super('textbox', title);
		this.value = value;
	}
}

export class InputTextarea extends InputBase {
	rows: number;
	value: string;
	constructor(title: string, rows: number = 3, value: string = '') {
		super('textarea', title);
		this.rows = rows;
		this.value = value;
	}
}

export class InputSelect extends InputBase {
	option: Record<string, string>;
	value: string;
	constructor(title: string, option: Record<string, string>, value: string = '') {
		super('select', title);
		this.option = option;
		this.value = value === '' ? Object.keys(option)[0] : value;
	}
}

export class InputNumber extends InputBase {
	value: number;
	constructor(title: string, value: number = 0) {
		super('number', title);
		this.value = value;
	}
}

export class Settings<T extends Record<string, InputBase>> {
	private name: string;
	private actions: Actions;
	private settings: T;
	constructor(name: string, actions: Actions, settings: T) {
		this.name = name;
		this.actions = actions;
		this.settings = settings;
	}
	public async data() {
		const _data = await this.actions.get(this.name);
		for (const k in this.settings) {
			if (_data.hasOwnProperty(k)) {
				this.settings[k].value = _data[k];
			}
		}
		return this.settings;
	}
	public async save() {
		const saveData: Record<string, ISettingValue> = {};
		for (const k in this.settings) {
			saveData[k] = this.settings[k].value;
		}
		await this.actions.save(this.name, saveData);
	}
}

export interface Actions {
	get: (name: string) => Promise<Record<string, ISettingValue>>;
	save: (name: string, data: Record<string, ISettingValue>) => Promise<void>;
}
