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
		ellipsis: false,
	}, {
		title: '修改时间',
		dataIndex: 'updated',
		ellipsis: false,
	}, {
		title: '列名称',
		dataIndex: 'name',
		ellipsis: false,
		form: 'input',
		rules: [{ required: true, message: '请输入[列名称]' }],
		placeholder: '请输入[列名称]',
	}, {
		title: '列标题',
		dataIndex: 'title',
		ellipsis: false,
		form: 'input',
		rules: [{ required: true, message: '请输入[列标题]' }],
		placeholder: '请输入[列标题]',
	}, {
		title: '列类型',
		dataIndex: 'type',
		ellipsis: false,
		form: 'select',
		options: [
			{ value: 'text', text: '文本型' },
			{ value: 'number', text: '数字型' },
			{ value: 'date', text: '日期型' },
		],
		rules: [{ required: true, message: '请输入[列类型]' }],
		placeholder: '请输入[列类型]',
	}],
};

export default TableCrud(config);
