import { Route } from '@/utils/route';
import { AliyunApi } from '@/utils/api/aliyuncs';

const app = Route();

app.get('/', async (c) => {
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
