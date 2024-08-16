// CF的D1数据库操作类
import { CFD1 } from '@/utils/cfd1';

// 合并多个二进制数据
import { Buffer } from 'node:buffer';

// 邮件回复功能中需要创建邮件
//import { createMimeMessage } from "mimetext";
function createMimeMessage() {
	try {
		const a = 'mimetext';
		return require(a).createMimeMessage;
	} catch (e) {
		return null;
	}
}
import { EmailMessage } from 'cloudflare:email';

// 解析收到的邮件
import PostalMime from 'postal-mime';

// 存储邮件时
const textNone: string | null = null;

function getHeaders(headers: Headers): Record<string, string> {
	// 将Headers去掉一些无用信息，然后转换成JSON字符串
	const rHeader: Record<string, string> = {};
	headers.forEach((value, key) => {
		rHeader[key] = value;
	});
	if (0) {
		// 发件人和收件人信息，可能有用，留着不删
		delete rHeader['date'];
		delete rHeader['from'];
		delete rHeader['to'];
		delete rHeader['cc'];
	}
	if (0) {
		// 使用的邮件软件，可能有用，留着不删
		delete rHeader['x-mailer']; // icloud和QQ才有
	}
	if (0) {
		// 发送者的IP地址，可能有用，留着不删
		delete rHeader['received']; // gmail,icloud才有
		delete rHeader['x-received']; // gmail才有
	}
	if (1) {
		// 已经放到表头了，这边就不用了，可以删了
		delete rHeader['subject'];
	}
	if (1) {
		// 常用的但用不到
		delete rHeader['mime-version'];
		delete rHeader['content-transfer-encoding'];
		delete rHeader['content-type'];
		delete rHeader['dkim-signature'];
		delete rHeader['message-id'];
	}
	if (1) {
		// 不同邮件商自定义的内容需要删除
		delete rHeader['x-qq-xmailinfo']; // QQ才有
		delete rHeader['x-qq-xmrinfo']; // QQ才有
		delete rHeader['x-gm-message-state']; // gmail才有
		delete rHeader['x-google-dkim-signature']; // gmail才有
		delete rHeader['x-google-smtp-source']; // gmail才有
		delete rHeader['x-proofpoint-guid']; // icloud才有
		delete rHeader['x-proofpoint-orig-guid']; // icloud才有
		delete rHeader['x-proofpoint-spam-details']; // icloud才有
		delete rHeader['x-proofpoint-virus-version']; // icloud才有
	}
	return rHeader;
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
	return email.substring(email.lastIndexOf('@') + 1);
}

function getReplyMessage(
	MessageID: string,
	email_from: string,
	email_to: string,
	replyName: string,
	replySubject: string,
	replyText: string
) {
	// 邮件回复功能
	const msg = createMimeMessage();
	if (!msg) {
		return null;
	}
	msg.setHeader('In-Reply-To', MessageID);
	msg.setSender({ name: replyName, addr: email_to });
	msg.setRecipient(email_from);
	msg.setSubject(replySubject);
	msg.addMessage({
		contentType: 'text/plain',
		data: replyText,
	});

	const replyMessage = new EmailMessage(email_to, email_from, msg.asRaw());

	return replyMessage;
}

export default async (message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> => {
	// 处理 email 的逻辑放在这里
	const domain_from = extractDomain(message.from);
	// 创建mMsgData，用于存到数据库
	const mMsgData: Record<string, string | number> = {
		created: new Date().getTime(), // 收件日期（REAL）
		domain_from: domain_from,
		domain_to: extractDomain(message.to),
		email_from: message.from, // 发件人
		email_to: message.to, // 收件人
		headers: JSON.stringify(getHeaders(message.headers)), // 其他头信息
		subject: message.headers.get('subject') ?? '', // 邮件主题
	};

	try {
		const postalMime = new PostalMime();
		const parsedMsg = await postalMime.parse(message.raw);
		if (parsedMsg.text) {
			mMsgData['body_text'] = parsedMsg.text; // 纯文本
		}
		if (parsedMsg.html) {
			mMsgData['body_html'] = parsedMsg.html; // 富文本
		}
	} catch (e) {
		console.error('PostalMime解析失败', e);
		// 单独存储解析不了的邮件
		const message_raw = decodeBuffer(await decodeStreamToBuffer(message.raw));
		// 可以将这个邮件保存到单独的表
	}
	const oCFD1 = new CFD1(env.DB);
	const oSql = oCFD1.sql().from('mails').set(mMsgData).buildInsert();
	console.log('插入数据库表的SQL语句', oCFD1.getSQL(oSql));
	const r2 = await oCFD1.all(oSql);
	if (r2.success) {
		console.log('邮件保存成功');
	}
	const needReplyDomainList = ['icloud.com', 'qq.com', 'vip.qq.com'];
	if (!needReplyDomainList.includes(domain_from)) {
		console.log('该域名无需回复');
		return;
	}
	const InReplyTo = message.headers.get('In-Reply-To');
	const MessageID = message.headers.get('Message-ID');
	if (InReplyTo) {
		console.log('防止无限循环回复');
		return;
	}
	if (!MessageID) {
		console.log('没有[MessageID]则无需回复');
		return;
	}
	const replyMessage = getReplyMessage(
		MessageID,
		message.from,
		message.to,
		'Thank you for your contact',
		'Email Routing Auto-reply（邮件自动回复）',
		'We got your message\r\n我们已经收到您的邮件'
	);
	if (!replyMessage) {
		console.log('邮件回复功能未启用');
		return;
	}
	await message.reply(replyMessage);
	console.log('邮件回复成功');
};
