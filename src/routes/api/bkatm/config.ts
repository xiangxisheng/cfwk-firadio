import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson } from '@/utils/vben';

const app = Route();

interface Setting {
	title: string,
	type: 'text' | 'textarea' | 'radio',
	note?: string,
	option?: Record<string, string>,
	rows?: number,
	value?: string | number,
}

app.get('/', (c) => {
	const email: Record<string, Setting> = {};
	email['api_type'] = { title: 'API类型', type: 'radio', option: { mailersend: 'mailersend' } };
	email['api_token'] = { title: 'API密钥', type: 'text' };
	email['from_name'] = { title: '发信人名称', type: 'text' };
	email['from_email'] = { title: '发信人邮箱', type: 'text' };
	const result = {
		settings: {
			email,
		}
	};
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

export default app;
