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
		title: '列顺序',
		dataIndex: 'seq',
		ellipsis: false,
		component: 'inputnumber',
		rules: [{ required: true, message: '请输入[列顺序]' }],
		placeholder: '请输入[列顺序]',
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
			{ value: 'textbox', text: '文本框', color: 'green', dataTypes: ['string'] },
			{ value: 'textarea', text: '文本域', color: 'geekblue', dataTypes: ['string'] },
			{ value: 'select', text: '下拉菜单', color: 'yellow', dataTypes: ['string'] },
			{ value: 'datepicker', text: '日期选择', color: 'volcano', dataTypes: ['datetime'] },
			{ value: 'inputnumber', text: '数字输入框', color: 'purple', dataTypes: ['int', 'float'] },
		],
		rules: [{ required: true, message: '请选择[交互组件]' }],
		placeholder: '请选择[交互组件]',
	}, {
		title: '数据类型',
		dataIndex: 'datatype',
		ellipsis: false,
		component: 'select',
		options: [
			{ value: 'int', text: '整数型', color: 'green' },
			{ value: 'float', text: '浮点型', color: 'geekblue' },
			{ value: 'string', text: '字符串型', color: 'yellow' },
			{ value: 'datetime', text: '日期时间型', color: 'volcano' },
		],
		rules: [{ required: true, message: '请选择[数据类型]' }],
		placeholder: '请选择[数据类型]',
		// }, {
		// 	title: '日期选择',
		// 	dataIndex: 'date',
		// 	component: 'datepicker',
		// 	dayjsFormat: 'YYYY-MM-DD',
		// 	placeholder: '请选择[日期选择]',
	}],

};

export default TableCrud(config);
