
interface ResultData {
	code: number,
	type: 'success' | 'error',
	message: string,
	result: any,
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
			code: 0,
			type: 'success',
			message,
			result: null,
		};
	}
}

export function cJson(c: any, data: ResultData) {
	return c.json(data);
}

