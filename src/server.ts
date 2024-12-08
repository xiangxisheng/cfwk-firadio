import routes from './routes';
import { serve } from '@hono/node-server';
import { D1Database } from '@/utils/sqlite';
import fs from 'fs';
import path from 'path';
import toml from 'toml';

function loadEnvFromWranglerToml() {
	const wranglerPath = path.join(path.dirname(__dirname), 'wrangler.toml');
	const tomlContent = fs.readFileSync(wranglerPath, 'utf-8');
	return toml.parse(tomlContent).vars;
}

const port = Number(process.env.HTTP_PORT) || 9000;
console.log(`Server is running on port ${port}`);
serve({
	fetch: async (req) => {
		const oUrl = new URL(req.url);
		const aPath = oUrl.pathname.split('/');
		let dbName = (() => {
			if (aPath[1] === 'api') {
				const dev_p2s = ['vben', 'console'];
				if (dev_p2s.indexOf(aPath[2]) !== -1) {
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
		const DB = new D1Database(dbPath);
		const env: Env = {
			...loadEnvFromWranglerToml(),
			DB
		};
		const res = await routes.fetch(req, env);
		DB.close();
		return res;
	},
	port,
});
