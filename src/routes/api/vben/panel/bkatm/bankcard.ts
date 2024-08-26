import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson } from '@/utils/vben';
import { fGetColumnsForResult } from '@/utils/table';

const columns = [
	{
		dataIndex: 'id',
	},
	{
		dataIndex: 'createTime',
		sql: {
			//attribute: $G.fn('date_format', $G.col(fGetModel().options.name.singular + '.created'), '%Y-%m-%d %H:%i:%s'),
		},
	},
	{
		title: '卡号',
		dataIndex: 'cardnumber',
		width: 140,
		component: 'Input',
		sorter: true,
	},
	{
		title: '有效月',
		dataIndex: 'expiration_month',
		width: 60,
		sorter: ['expiration_month', 'expiration_year'],
		sql: {
			//attribute: $G.fn('LPAD', $G.col(fGetModel().options.name.singular + '.expiration_month'), 2, '0'),
		},
	},
	{
		title: '有效年',
		dataIndex: 'expiration_year',
		width: 60,
		sorter: ['expiration_year', 'expiration_month'],
	},
	{
		title: 'CVV',
		dataIndex: 'cvv',
		width: 50,
		sorter: true,
	},
	{
		title: '品牌',
		dataIndex: 'card_bin_brand',
		width: 60,
		component: 'Select',
		componentProps: {
			options: [
				{ label: 'AMERICAN EXPRESS', value: 'AMERICAN EXPRESS' },
				{ label: 'MASTERCARD', value: 'MASTERCARD' },
				{ label: 'VISA', value: 'VISA' },
			],
		},
		sql: { table_as: 'card_bin' },
		sorter: true,
	},
	{
		title: '类型',
		dataIndex: 'card_bin_type',
		width: 70,
		component: 'Select',
		componentProps: {
			options: [
				{ label: 'CREDIT', value: 'CREDIT' },
				{ label: 'DEBIT', value: 'DEBIT' },
			],
		},
		sql: { table_as: 'card_bin' },
		sorter: true,
	},
	{
		title: '级别',
		dataIndex: 'card_bin_level',
		width: 80,
		component: 'Input',
		sql: { table_as: 'card_bin' },
		sorter: true,
	},
	{
		title: '币种',
		dataIndex: 'card_bin_currency',
		width: 60,
		component: 'Input',
		sql: { table_as: 'card_bin' },
		sorter: true,
	},
	{
		title: '发卡行',
		dataIndex: 'card_bin_issuer_name',
		width: 150,
		component: 'Input',
		sql: { table_as: 'card_bin' },
		sorter: true,
	},
	{
		// 搜索栏的检测状态
		title: '检测状态',
		dataIndex: 'ceka_task_status',
		component: 'Select',
		componentProps: {
			options: [
				{ label: '处理中', value: 0 },
				{ label: '待检测', value: 1 },
				{ label: '检测中', value: 2 },
				{ label: '活跃卡', value: 3 },
				{ label: '无效卡', value: 4 },
				{ label: '过期卡', value: 5 },
				{ label: '禁测卡', value: 6 },
				{ label: '卡号错误', value: 7 },
				{ label: '检测失败', value: 8 },
			],
		},
	},
	{
		// 列表中的检测状态
		title: '检测状态',
		dataIndex: 'ceka_result_text',
		width: 80,
		customRender: [
			{ where: { ceka_task_status: 0 }, color: '#cccccc' }, // 待查BIN
			{ where: { ceka_task_status: 1 }, color: 'blue' }, // 待检测
			{ where: { ceka_task_status: 2 }, color: '#ff9900' }, // 检测中
			{ where: { ceka_task_status: 3 }, color: 'green' }, // 活跃卡
			{ where: { ceka_task_status: 4 }, color: 'red' }, // 无效卡
			{ where: { ceka_task_status: 5 }, color: '#cccccc' }, // 过期卡
			{ where: { ceka_task_status: 6 }, color: '#cccccc' }, // 禁测卡
			{ where: { ceka_task_status: 7 }, color: '#cccccc' }, // 卡号错误
			{ where: { ceka_task_status: 8 }, color: 'red' }, // 检测失败
		],
		sorter: ['ceka_task_status'],
	},
	{
		title: '检测时间',
		dataIndex: 'ceka_result_time',
		width: 150,
		sorter: true,
		sql: {
			//attribute: $G.fn('date_format', $G.col(fGetModel().options.name.singular + '.ceka_result_time'), '%Y-%m-%d %H:%i:%s'),
		},
	},
];

const basic_table_props = {
	// title: tplConf.TableTitle.title,
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
			title: '银行卡列表',
			helpMessage: '请先导入需要测卡的数据',
		},
	};
	const toolbars = [];
	if (c.get('user')['uid'] === 1) {
		toolbars.push({
			title: '重载Info',
			click: 'fLoadInfo',
		});
	}
	toolbars.push({
		title: '导入数据',
		click: 'openModal_Import',
		action: 'import',
		schemas: [
			{
				field: 'checkFormat',
				label: '完整性检查',
				component: 'RadioButtonGroup',
				defaultValue: 1,
				componentProps: {
					options: [
						{ label: '完整才开始导入', value: 1 },
						{ label: '跳过错误格式行', value: 2 },
					],
				},
				colProps: { span: 24 },
			},
			{
				field: 'onDuplicate',
				label: '卡号重复时',
				component: 'RadioButtonGroup',
				defaultValue: 1,
				componentProps: {
					options: [
						{ label: '提示错误', value: 1 },
						{ label: '跳过重复卡', value: 2 },
						{ label: '覆盖资料', value: 3 },
						{ label: '强制覆盖', value: 4 },
					],
				},
				colProps: { span: 24 },
			},
			{
				field: 'textarea1',
				component: 'InputTextArea',
				componentProps: {
					placeholder: '请输入要导入的格式：\r\n卡号----有效月----有效年----CVV',
					rows: 20,
				},
				label: '',
				colProps: {
					span: 24,
				},
				required: true,
				defaultValue: '',
			},
		],
	});
	toolbars.push({
		title: '导出数据',
		click: 'openModal_ExpExcel',
	});
	toolbars.push({
		title: '重测全部',
		click: 'toolbar_request',
		action: 'recheck',
	});
	toolbars.push({
		title: '删除全部',
		click: 'toolbar_request',
		action: 'del',
	});
	const result = { basic_table_props, columns: fGetColumnsForResult(columns), toolbars, tplConf };
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

app.get('/list', async (c) => {
	const result = {
		items: [],
	};
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

export default app;
