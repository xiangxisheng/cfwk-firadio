import routes from './routes';
import { serve } from '@hono/node-server';
import { D1Database } from '@/utils/sqlite';

const port = Number(process.env.HTTP_PORT) || 9000;
console.log(`Server is running on port ${port}`);
serve({
	fetch: async (req) => {
		const oUrl = new URL(req.url);
		const aPath = oUrl.pathname.split('/');
		let dbName = (() => {
			if (aPath[1] === 'api') {
				if (aPath[2] === 'vben') {
					return 'dev';
				}
				if (/^[a-z]+$/.test(aPath[2])) {
					return aPath[2];
				}
			}
			return 'dev';
		})();
		const dbPath = `prisma/${dbName}.db`;
		//console.log('dbPath', dbPath);
		const env = {
			DB: new D1Database(dbPath),
		};
		const res = await routes.fetch(req, env);
		env.DB.close();
		return res;
	},
	port,
});
