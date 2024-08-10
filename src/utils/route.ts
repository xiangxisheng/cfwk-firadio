import { Hono, Context } from 'hono';

export function Route() {
	// 定义一个接口来扩展Context
	interface CustomContext extends Context {
		Bindings: Env,
		Variables: {
			user: Record<string, unknown>,
		},
	}
	const app = new Hono<CustomContext>();
	return app;
};
