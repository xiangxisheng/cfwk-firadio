/* 前端类型定义开始 */
export interface DataType extends Record<string, unknown> { }

interface ResJsonTableColumnRule {
	required: boolean;
	message: string;
}

interface ResJsonTableColumnSelectOption {
	value: string;
	text: string;
	color?: string;
	dataTypes?: string[];
}

export interface ResJsonTableColumn {
	dataIndex: string;
	title: string;
	component?: 'textbox' | 'url' | 'textarea' | 'select' | 'datepicker' | 'datepicker_rangepicker' | 'inputnumber';
	rules?: ResJsonTableColumnRule[];
	ellipsis?: boolean;
	placeholder?: string;
	options?: ResJsonTableColumnSelectOption[];
	dataType?: 'js_timestamp' | 'int' | 'float' | 'string' | 'datetime';
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
	title?: string;
	message?: string;
}
/* 前端类型定义结束 */

export interface TableConfig {
	name: string;
	option: ResJsonTableOption;
	columns: ResJsonTableColumn[];
}

// 创建一个延迟函数
export function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

