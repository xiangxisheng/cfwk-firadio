import { Route } from '../../../utils/route';
import { CFD1 } from '../../../utils/cfd1';
import { cJson } from '../../../utils/vben';

const app = Route();

app.get('/getDeptList', (c) => {
	const result = ["1000", "3000", "5000"];
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

export default app;
