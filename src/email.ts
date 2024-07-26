// 接口定义
import { Env } from './utils/interface';

// 合并多个二进制数据
import { Buffer } from "node:buffer";

// 邮件回复功能中需要创建邮件
import { createMimeMessage } from "mimetext";
import { EmailMessage } from "cloudflare:email";

// 解析收到的邮件
import PostalMime from 'postal-mime';

// 存储邮件时
import sql from './utils/sql';
const textNone: string | null = null;

function getHeaders(headers: Headers) {
	// 将Headers去掉一些无用信息，然后转换成JSON字符串
	const headerMap = new Map<string, string>();
	headers.forEach((value, key) => {
		headerMap.set(key, value);
	});
	if (0) {
		// 发件人和收件人信息，可能有用，留着不删
		headerMap.delete('date');
		headerMap.delete('from');
		headerMap.delete('to');
		headerMap.delete('cc');
	}
	if (0) {
		// 使用的邮件软件，可能有用，留着不删
		headerMap.delete('x-mailer'); // icloud和QQ才有
	}
	if (0) {
		// 发送者的IP地址，可能有用，留着不删
		headerMap.delete('received'); // gmail,icloud才有
		headerMap.delete('x-received'); // gmail才有
	}
	if (1) {
		// 已经放到表头了，这边就不用了，可以删了
		headerMap.delete('subject');
	}
	if (1) {
		// 常用的但用不到
		headerMap.delete('mime-version');
		headerMap.delete('content-transfer-encoding');
		headerMap.delete('content-type');
		headerMap.delete('dkim-signature');
		headerMap.delete('message-id');
	}
	if (1) {
		// 不同邮件商自定义的内容需要删除
		headerMap.delete('x-qq-xmailinfo'); // QQ才有
		headerMap.delete('x-qq-xmrinfo'); // QQ才有
		headerMap.delete('x-gm-message-state'); // gmail才有
		headerMap.delete('x-google-dkim-signature'); // gmail才有
		headerMap.delete('x-google-smtp-source'); // gmail才有
		headerMap.delete('x-proofpoint-guid'); // icloud才有
		headerMap.delete('x-proofpoint-orig-guid'); // icloud才有
		headerMap.delete('x-proofpoint-spam-details'); // icloud才有
		headerMap.delete('x-proofpoint-virus-version'); // icloud才有
		// headerMap.delete(''];
	}
	return JSON.stringify(headerMap);
}

async function decodeStreamToBuffer(stream: ReadableStream) {
	// 从邮件的流中提取二进制数据
	const chunks = [];
	for await (const chunk of stream) {
		chunks.push(chunk);
	}
	return Buffer.concat(chunks);
}

function decodeBuffer(bufferData: Buffer, encoding = 'utf-8') {
	// 将二进制数据转换为纯文本
	const textDecoder = new TextDecoder(encoding);
	return textDecoder.decode(bufferData, { stream: true });
}

function extractDomain(email: string) {
	// 取得邮件的域名部分
	return email.substring(email.lastIndexOf("@") + 1);
}

function getReplyMessage(MessageID: string, email_from: string, email_to: string, replyName: string, replySubject: string, replyText: string) {
	// 邮件回复功能
	const msg = createMimeMessage();
	msg.setHeader("In-Reply-To", MessageID);
	msg.setSender({ name: replyName, addr: email_to });
	msg.setRecipient(email_from);
	msg.setSubject(replySubject);
	msg.addMessage({
		contentType: 'text/plain',
		data: replyText,
	});

	const replyMessage = new EmailMessage(
		email_to,
		email_from,
		msg.asRaw()
	);

	return replyMessage;
}

export default async (message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> => {
	// 处理 email 的逻辑放在这里
	const domain_from = extractDomain(message.from);
	// 创建mMsgData，用于存到数据库
	const mMsgData = new Map<string, null | string | number>();
	mMsgData.set('id', new Date().getTime() + Math.random()); // 主键（REAL）
	mMsgData.set('domain_from', domain_from);
	mMsgData.set('domain_to', extractDomain(message.to));
	mMsgData.set('email_from', message.from) // 发件人
	mMsgData.set('email_to', message.to); // 收件人
	mMsgData.set('headers', getHeaders(message.headers)); // 其他头信息
	mMsgData.set('subject', message.headers.get('subject')); // 邮件主题
	try {
		const postalMime = new PostalMime();
		const parsedMsg = await postalMime.parse(message.raw);
		if (parsedMsg.text) {
			mMsgData.set('body_text', parsedMsg.text); // 纯文本
		}
		if (parsedMsg.html) {
			mMsgData.set('body_html', parsedMsg.html); // 富文本
		}
	} catch (e) {
		console.error(e);
		// 单独存储解析不了的邮件
		const message_raw = decodeBuffer(await decodeStreamToBuffer(message.raw));
		// 可以将这个邮件保存到单独的表
	}
	const r1 = sql().table('mails').add(mMsgData);
	console.log('插入数据库表的SQL语句', r1);
	const stmt = env.DB.prepare(r1[0]);
	const r2 = await stmt.bind.apply(stmt, r1[1]).all();
	if (r2.success) {
		console.log('邮件保存成功');
	}
	const needReplyDomainList = ["icloud.com", "qq.com", "vip.qq.com"];
	if (!needReplyDomainList.includes(domain_from)) {
		console.log('该域名无需回复');
		return;
	}
	const InReplyTo = message.headers.get("In-Reply-To");
	const MessageID = message.headers.get("Message-ID");
	if (InReplyTo) {
		console.log('防止无限循环回复');
		return;
	}
	if (!MessageID) {
		console.log('没有[MessageID]则无需回复');
		return;
	}
	const replyMessage = getReplyMessage(MessageID, message.from, message.to, "Thank you for your contact", "Email Routing Auto-reply（邮件自动回复）", "We got your message\r\n我们已经收到您的邮件");
	await message.reply(replyMessage);
	console.log('邮件回复成功');
};
