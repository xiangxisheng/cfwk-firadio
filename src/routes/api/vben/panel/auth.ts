import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson, ResponseData, ResponseMessage } from '@/utils/vben';
import { menu_from_list_to_tree } from '@/utils/menu';

const app = Route();

app.get('/logout', (c) => {
	return cJson(c, { code: 0, type: 'success', message: 'Token has been destroyed', result: null });
});

app.get('/getUserInfo', (c) => {
	const result = {
		userId: '1',
		username: 'bkatm',
		realName: 'Bkatm Admin',
		avatar: '',
		desc: 'manager',
		homePath: '/dashboard/analysis',
		roles: [
			{
				roleName: '超级管理员',
				value: 'super',
			},
		],
	};
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

app.get('/getPermCode', (c) => {
	const result = ['1000', '3000', '5000'];
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

app.get('/getMenuList', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const select = {
		id: 'id',
		parent_id: 'parent_id',
		name: 'name',
		title: 'title',
		path: 'path',
		icon: 'icon',
		component: 'component',
		redirect: 'redirect',
		meta: 'meta',
	};
	const oSql = oCFD1
		.sql()
		.select(select)
		.from('pre_system_menus')
		.where([
			['type IN(0,1)', []],
			['status=0', []],
		])
		.orderBy([['orderNo', 'ASC']])
		.buildSelect();
	const results = (await oCFD1.all(oSql)).results;
	for (const mRow of results) {
		const meta: Record<string, unknown> = typeof mRow['meta'] === 'string' ? JSON.parse(mRow['meta']) : {};
		meta['icon'] = mRow['icon'];
		meta['title'] = mRow['title'];
		mRow['meta'] = meta;
	}
	return cJson(c, { code: 0, type: 'success', message: 'ok', result: menu_from_list_to_tree(results) });
});

export default app;
