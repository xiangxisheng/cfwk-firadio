/* 前端类型定义开始 */
export interface DataType extends Record<string, unknown> { }

interface ResJsonTableColumnRule {
	required: boolean;
	message: string;
}

interface ResJsonTableColumnSelectOption {
	value: string;
	text: string;
}

export interface ResJsonTableColumn {
	dataIndex: string;
	title: string;
	component?: 'textbox' | 'url' | 'textarea' | 'select' | 'datepicker' | 'datepicker_rangepicker';
	rules?: ResJsonTableColumnRule[];
	ellipsis?: boolean;
	placeholder?: string;
	options?: ResJsonTableColumnSelectOption[];
	dataType?: 'js_timestamp';
	dayjsFormat?: string;
}

export interface ResJsonTableOption {
	rowKey: string;
}

export interface ResJsonTable {
	option?: ResJsonTableOption;
	columns?: ResJsonTableColumn[];
	dataSource?: DataType[];
}

export interface ResJSON {
	table?: ResJsonTable;
	message?: string;
}
/* 前端类型定义结束 */

export interface TableConfig {
	name: string;
	option: ResJsonTableOption;
	columns: ResJsonTableColumn[];
}
