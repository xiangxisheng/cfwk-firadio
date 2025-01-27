import type { TableConfig } from '@/utils/common/api';
import TableCrud from '@/utils/common/table_crud';

const config: TableConfig = {
	name: 'pre_bkdata_data_columns',
	option: {
		rowKey: 'id',
	},
	columns: [{
		title: 'ID',
		dataIndex: 'id',
	}, {
		title: '创建时间',
		dataIndex: 'created',
		dataType: 'js_timestamp',
		dayjsFormat: 'YYYY-MM-DD HH:mm:ss',
		ellipsis: false,
	}, {
		title: '修改时间',
		dataIndex: 'updated',
		dataType: 'js_timestamp',
		dayjsFormat: 'YYYY-MM-DD HH:mm:ss',
		ellipsis: false,
	}, {
		title: '列名称',
		dataIndex: 'name',
		ellipsis: false,
		component: 'textbox',
		rules: [{ required: true, message: '请输入[列名称]' }],
		placeholder: '请输入[列名称]',
	}, {
		title: '列标题',
		dataIndex: 'title',
		ellipsis: false,
		component: 'textbox',
		rules: [{ required: true, message: '请输入[列标题]' }],
		placeholder: '请输入[列标题]',
	}, {
		title: '交互组件',
		dataIndex: 'component',
		ellipsis: false,
		component: 'select',
		options: [
			{ value: 'textbox', text: '文本框' },
			{ value: 'textarea', text: '文本域' },
			{ value: 'select', text: '下拉菜单' },
			{ value: 'datepicker', text: '日期选择' },
		],
		rules: [{ required: true, message: '请选择[交互组件]' }],
		placeholder: '请选择[交互组件]',
	}, {
		title: '日期选择',
		dataIndex: 'date',
		component: 'datepicker',
		dayjsFormat: 'YYYY-MM-DD',
		rules: [{ required: true, message: '请选择[日期选择]' }],
		placeholder: '请选择[日期选择]',
	}],

};

export default TableCrud(config);
