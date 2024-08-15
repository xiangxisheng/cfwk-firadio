import { InputTextBox, Settings, Actions } from './base';

export interface SiteSettingsType {
	[key: string]: any; // 添加字符串索引签名
	title: InputTextBox;
}

export class SiteSettings extends Settings<SiteSettingsType> {
	// 站点设置
	constructor(name: string, actions: Actions) {
		const settings: SiteSettingsType = {
			title: new InputTextBox('网站标题', '网站标题'),
		};
		super(name, actions, settings);
	}
}
