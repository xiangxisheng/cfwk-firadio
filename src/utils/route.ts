import { Hono, Context } from 'hono';
import { Configs } from '@/utils/config';

export function Route() {
	// 定义一个接口来扩展Context
	interface CustomContext extends Context {
		Bindings: Env,
		Variables: {
			configs: Configs,
			user: Record<string, unknown>,
		},
	}
	const app = new Hono<CustomContext>();
	return app;
};
