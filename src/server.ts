import routes from './routes';
import { serve } from '@hono/node-server';
import { D1Database } from '@/utils/sqlite';

const port = 9000;
console.log(`Server is running on port ${port}`);
serve({
	fetch: async (req) => {
		const env = {
			DB: new D1Database('prisma/dev.db'),
		};
		const res = await routes.fetch(req, env);
		env.DB.close();
		return res;
	},
	port,
});
