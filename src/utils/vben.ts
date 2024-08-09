
interface ResultData {
	code: number,
	type: 'success' | 'error',
	message: string,
	result: any,
};

export function cJson(c: any, data: ResultData) {
	return c.json(data);
}

