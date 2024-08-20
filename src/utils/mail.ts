//import { EmailMessage } from 'cloudflare:email';
async function cloudflare_email() {
	try {
		return await import('cloudflare:email');
	} catch (e) {
		throw new Error('cloudflare:email module not found, this function for cloudflare worker only');
	}
}
//import { createMimeMessage, MIMEMessage } from 'mimetext';
async function mimetext() {
	try {
		const moduleName = 'mimetext';
		return await import(moduleName);
	} catch (e) {
		throw new Error('mimetext module not found, please add "node_compat = true" to wrangler.toml file');
	}
}

export class SendEmail {
	/*
	邮件发送类的使用方法
	const mail = new Mail(c.env);
	mail.setSender("notice@email-all.com");
	mail.setRecipient("wolerba@gmail.com");
	mail.addTextPlain("邮件主题", "邮件内容");
	await mail.send();
	//*/
	env: Env;
	actions: Array<[string, Array<any>]> = [];
	mail_from: string = '';
	mail_to: string = '';

	constructor(env: Env) {
		this.env = env;
	}

	setSender(addr: string, name: string = '') {
		this.mail_from = addr;
		if (name === '') {
			this.actions.push(['setSender', [{ addr }]]);
			return;
		}
		this.actions.push(['setSender', [{ name, addr }]]);
	}

	setRecipient(_mail_to: string) {
		this.mail_to = _mail_to;
		this.actions.push(['setRecipient', [_mail_to]]);
	}

	addTextPlain(_subject: string, _msg_data: string) {
		this.actions.push(['setSubject', [_subject]]);
		this.actions.push([
			'addMessage',
			[
				{
					contentType: 'text/plain',
					data: _msg_data,
				},
			],
		]);
	}

	async send() {
		const { createMimeMessage } = await mimetext();
		const msg = createMimeMessage();
		for (const action of this.actions) {
			switch (action[0]) {
				case 'setSender':
					msg.setSender(action[1][0]);
					break;
				case 'setRecipient':
					msg.setRecipient(action[1][0]);
					break;
				case 'setSubject':
					msg.setSubject(action[1][0]);
					break;
				case 'addMessage':
					msg.addMessage(action[1][0]);
					break;
			}
		}
		const { EmailMessage } = await cloudflare_email();
		const message = new EmailMessage(this.mail_from, this.mail_to, msg.asRaw());
		return this.env.SEB.send(message);
	}
}
