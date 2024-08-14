import { Hono, Context } from 'hono';
import { Config } from '@/utils/config';

export function Route() {
	// 定义一个接口来扩展Context
	interface CustomContext extends Context {
		Bindings: Env,
		Variables: {
			config: Config,
			user: Record<string, unknown>,
		},
	}
	const app = new Hono<CustomContext>();
	return app;
};
