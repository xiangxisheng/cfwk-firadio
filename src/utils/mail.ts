import { EmailMessage } from "cloudflare:email";
import { createMimeMessage, MIMEMessage } from "mimetext";

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
	msg: MIMEMessage;
	mail_from: string = '';
	mail_to: string = '';

	constructor(env: Env) {
		this.env = env;
		this.msg = createMimeMessage();
	}

	setSender(addr: string, name: string = "") {
		this.mail_from = addr;
		if (name === "") {
			this.msg.setSender({ addr });
			return;
		}
		this.msg.setSender({ name, addr });
	}

	setRecipient(_mail_to: string) {
		this.mail_to = _mail_to;
		this.msg.setRecipient(_mail_to);
	}

	addTextPlain(_subject: string, _msg_data: string) {
		this.msg.setSubject(_subject);
		this.msg.addMessage({
			contentType: 'text/plain',
			data: _msg_data,
		});
	};

	send() {
		const message = new EmailMessage(
			this.mail_from,
			this.mail_to,
			this.msg.asRaw(),
		);
		return this.env.SEB.send(message);
	}
}
