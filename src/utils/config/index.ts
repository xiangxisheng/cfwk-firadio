import { Actions } from './base';
import { SiteSettings } from './site';
import { EmailSettings } from './email';

export interface Configs {
	site: SiteSettings;
	email: EmailSettings;
}

export class Config {
	public configs: Configs;
	constructor(_actions: Actions) {
		this.configs = {
			site: new SiteSettings('site', _actions),
			email: new EmailSettings('email', _actions),
		};
	}
}
