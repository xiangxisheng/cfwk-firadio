import { Hono, Context } from 'hono';
import { Configs } from '@/utils/config';

export interface User {
	uid: number;
	status: number;
	roles: string;
}

export function Route() {
	// 定义一个接口来扩展Context
	interface CustomContext extends Context {
		Bindings: Env;
		Variables: {
			configs: Configs;
			user: User;
		};
	}
	const app = new Hono<CustomContext>();
	return app;
}
