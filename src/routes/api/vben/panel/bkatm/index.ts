import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson } from '@/utils/vben';
import { menu_from_list_to_tree } from '@/utils/menu';

const app = Route();

app.get('/bankcard', (c) => {
	const result = null;
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

export default app;
