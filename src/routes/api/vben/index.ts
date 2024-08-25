import { Route } from '@/utils/route';
import { cJson, ResponseData, ResponseMessage } from '@/utils/vben';

const app = Route();

app.onError((err, c) => {
	if (err instanceof ResponseData) {
		console.log(`app.onError:`, err.responseData);
		return cJson(c, err.responseData);
	}
	if (err instanceof ResponseMessage) {
		console.log(`app.onError:`, err.resultData);
		return cJson(c, err.resultData);
	}
	console.error(`app.onError: ${err.message}`);
	return cJson(c, { code: -1, type: 'error', message: err.message, result: null });
});

app.route('/panel', require('./panel').default);
app.route('/public', require('./public').default);

export default app;
