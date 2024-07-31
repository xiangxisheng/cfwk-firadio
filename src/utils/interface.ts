
export interface HtmlContCent {
	title: string,
	url: string,
}

interface TableColumnRule {
	required: boolean,
	message: string,
};

interface TableColumnOperateButton {
	title: string,
	type?: 'primary',
};

interface TableColumnOperatePopconfirm {
	title: string,
	okText: string,
	cancelText: string,
};

interface TableColumnOperate {
	action: string,
	title: string,
	buttons?: TableColumnOperateButton[],
	popconfirm?: TableColumnOperatePopconfirm,
};

export interface BatchButton {
	type: string,
	title: string,
	buttons?: TableColumnOperateButton[],
	popconfirm?: TableColumnOperatePopconfirm,
}

export interface TableColumn {
	title: string,
	dataIndex?: string,
	fixed?: string,
	width?: number,
	sorter?: boolean,
	sql_where?: string,
	form?: string,
	disabled?: boolean,
	readonly?: boolean,
	placeholder?: string,
	rules?: TableColumnRule[],
	operates?: TableColumnOperate[],
};

export interface TablePagination {
	pageSizeOptions: Array<number>,
	showTotalTemplate: string,
	total: number,
	current: number,
	pageSize: number,
};

export interface Table {
	from: string,
	columns: TableColumn[],
	pagination?: TablePagination,
	rowKey: string,
	rowSelection: boolean,
	dataSource?: Record<string, unknown>[],
};

interface ResultDataMessage {
	type: 'success' | 'error',
	title?: string,
	content: string,
}

export interface ResultData {
	errno?: 0,
	message?: ResultDataMessage,
	buttons?: BatchButton[],
	table?: Table,
};

export class ResponseResultData extends Error {
	resultData: ResultData;
	constructor(responseJSON: ResultData) {
		super();
		this.resultData = responseJSON;
	}
}

export class ResponseMessage extends Error {
	resultData: ResultData;
	constructor(message: string) {
		super();
		this.resultData = {
			errno: 0,
			message: {
				type: 'success',
				content: message,
			}
		};
	}
}
