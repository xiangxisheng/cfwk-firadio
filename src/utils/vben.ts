interface IResponseData {
	code: number;
	type: 'success' | 'error';
	message: string;
	result: any;
}

export class ResponseData extends Error {
	responseData: IResponseData;
	constructor(responseJSON: IResponseData) {
		super();
		this.responseData = responseJSON;
	}
}

export class ResponseMessage extends Error {
	resultData: IResponseData;
	constructor(message: string, code: number = 0) {
		super();
		this.resultData = {
			code,
			type: code === 0 ? 'success' : 'error',
			message,
			result: null,
		};
	}
}

export function cJson(c: any, data: IResponseData) {
	var status = 200;
	if (data.code > 200) {
		status = data.code;
	}
	return c.json(data, status);
}
