import { Route } from '@/utils/route';
import { AliyunApi } from '@/utils/api/aliyuncs';
import { html, HtmlContent } from '@/utils/route/react';

const app = Route();

app.get('/', async (c) => {
	const params: Record<string, unknown>[] = [];
	params.push({ s: 1 });
	return c.html(html(new HtmlContent('Aliyun', params)));
});

app.get('/DescribeInstances', async (c) => {
	const requestParams = {
		AccessKeyId: '',
		RegionId: 'cn-hangzhou',
		Action: 'DescribeInstances',
		PageSize: '1',
		PageNumber: '1',
	};
	const a = await AliyunApi(requestParams, '');
	return c.json(a);
});

export default app;
