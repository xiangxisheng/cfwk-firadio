import routes from './routes';
import { Env } from './utils/interface';
import email from './email';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			return await routes.fetch(request, env, ctx);
		} catch (e) {
			console.error(e);
			return new Response("网站维护中，请稍后再试", { status: 500 });
		}
	},
	async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
		return await email(message, env, ctx);
	}
};
