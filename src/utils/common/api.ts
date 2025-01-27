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
	form?: string;
	rules?: ResJsonTableColumnRule[];
	ellipsis?: boolean;
	placeholder?: string;
	options?: ResJsonTableColumnSelectOption[];
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

export interface TableConfig {
	name: string;
	option: ResJsonTableOption;
	columns: ResJsonTableColumn[];
}
