import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson } from '@/utils/vben';
import { menu_from_list_to_tree } from '@/utils/menu';

const app = Route();

app.get('/getDeptList', (c) => {
	const result = ['1000', '3000', '5000'];
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

app.get('/getMenuList', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const select = {
		id: 'id',
		createTime: "datetime(created/1000, 'unixepoch')",
		parent_id: 'parent_id',
		name: 'name',
		menuName: 'title',
		path: 'path',
		icon: 'icon',
		component: 'component',
		orderNo: 'orderNo',
		redirect: 'redirect',
		meta: 'meta',
	};
	const oSql = oCFD1.sql().select(select).from('pre_system_menus').orderBy(['orderNo']).buildSelect();
	const results = (await oCFD1.all(oSql)).results;
	for (const mRow of results) {
		//mRow['createTime'] = new Date(mRow['created'] as number).toString();
	}
	return cJson(c, { code: 0, type: 'success', message: 'ok', result: menu_from_list_to_tree(results) });
});

export default app;
