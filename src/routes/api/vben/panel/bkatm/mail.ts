import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson } from '@/utils/vben';
import { fGetColumnsForResult } from '@/utils/table';

const columns = [
	{
		title: '收件时间',
		dataIndex: 'created',
		width: 140,
		sorter: true,
		sql: {},
	},
	{
		title: '接收方',
		dataIndex: 'email_to',
		width: 140,
		component: 'Input',
		sorter: true,
		sql: {},
	},
	{
		title: '发送方',
		dataIndex: 'email_from',
		width: 140,
		component: 'Input',
		sorter: true,
	},
	{
		title: '邮件主题',
		dataIndex: 'subject',
		width: 140,
		component: 'InputTextArea',
		sorter: [],
	},
];

const basic_table_props = {
	rowKey: 'id',
	bordered: true, // 是否显示边框
	showIndexColumn: true, // 是否显示【序号】
	showTableSetting: true, // 是否显示表的配置功能
	useSearchForm: true, // 是否显示搜索框
	formConfig: {
		// 表单页面配置
		labelWidth: 120,
		autoSubmitOnEnter: true,
	},
	pagination: {
		// 分页功能配置
		pageSizeOptions: ['50', '100'],
		pageSize: 50,
	},
};

const app = Route();

app.get('/info', async (c) => {
	const tplConf = {
		TableTitle: {
			title: '邮件列表',
			helpMessage: '请先导入需要测卡的数据',
		},
	};
	const toolbars = [];
	if (1 || c.get('user')['uid'] === 1) {
		toolbars.push({
			title: '重载Info',
			click: 'fLoadInfo',
		});
	}
	const result = { basic_table_props, columns: fGetColumnsForResult(columns), toolbars, tplConf };
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

app.get('/list', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const rowCount = await oCFD1.first(oCFD1.sql().select({ records: 'COUNT(*)' }).from('mails').buildSelect());
	const records = Number(rowCount?.['records'] || 0);
	const select = {
		id: 'id',
		created: "datetime(created/1000, 'unixepoch')",
		email_from: 'email_from',
		email_to: 'email_to',
		subject: 'subject',
	};
	const page = Number(c.req.query('page') || 1);
	const pageSize = Number(c.req.query('pageSize') || 10);
	const oSql = oCFD1
		.sql()
		.select(select)
		.from('mails')
		.orderBy([['id', 'DESC']])
		.limit(pageSize)
		.offset((page - 1) * pageSize)
		.buildSelect();
	const result = {
		total: records,
		items: (await oCFD1.all(oSql)).results,
	};
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

export default app;
