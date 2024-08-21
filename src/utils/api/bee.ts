interface ResponseData {
	result: boolean;
	response_code: number;
	response_msg: string;
	data?: {
		token?: string;
		logs: Array<Record<string, string>>;
	};
}

export class ApiBee {
	private preUrl: string = 'http://172.16.16.16/api';
	private token?: string;
	constructor(preUrl?: string) {
		if (preUrl) {
			this.preUrl = preUrl;
		}
	}
	private async request(_path: string, _param?: Record<string, string>, _post?: Record<string, string>): Promise<ResponseData> {
		const aUrl = new Array<string>();
		aUrl.push(this.preUrl);
		aUrl.push(_path);
		if (_param) {
			const urlParam = new URLSearchParams();
			for (const k in _param) {
				urlParam.append(k, _param[k]);
			}
			const sParam = urlParam.toString();
			if (sParam.length > 0) {
				aUrl.push('?');
				aUrl.push(sParam.toString());
			}
		}
		const sUrl = aUrl.join('');
		const init: RequestInit = {};
		init.method = 'GET';
		const headers = new Headers();
		if (this.token) {
			headers.append('Authorization', `Bearer ${this.token}`);
		}
		if (_post) {
			init.method = 'POST';
			headers.append('Content-Type', 'application/x-www-form-urlencoded');
			const urlEncodedData = new URLSearchParams();
			for (const k in _post) {
				urlEncodedData.append(k, _post[k]);
			}
			init.body = urlEncodedData.toString();
		}
		init.headers = headers;
		const response = await fetch(sUrl, init);
		switch (response.status) {
			case 200:
				break;
			case 401:
				break;
			default:
				throw new Error(`HTTP状态异常:${response.status}`);
		}
		const json = await response.json();
		//console.log(json);
		return json as ResponseData;
	}
	private async login(): Promise<ResponseData> {
		const post = {
			username: 'asiafort-api',
			password: 'e433c359215c2f224182fef8cca61a9b',
		};
		const res = await this.request('/login', {}, post);
		if (res.data) {
			this.token = res.data.token;
		}
		return res;
	}
	private async autoLoginRequest(_path: string, _param?: Record<string, string>, _post?: Record<string, string>): Promise<ResponseData> {
		const res = await this.request(_path, _param, _post);
		if (res.response_code === 401) {
			const resLogin = await this.login();
			if (resLogin.response_code === 200 && resLogin.data && resLogin.data.token) {
				return await this.request(_path, _param, _post);
			}
		}
		return res;
	}
	public async customerGetAllLog(log_id_begin: number): Promise<ResponseData> {
		return await this.autoLoginRequest('/customer/get-all-log', { log_id: log_id_begin.toString() });
	}
}
