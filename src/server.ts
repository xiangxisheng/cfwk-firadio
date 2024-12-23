import routes from './routes';
import { serve } from '@hono/node-server';
import { D1Database } from '@/utils/sqlite';
import fs from 'fs/promises';
import path from 'path';
import toml from 'toml';
import { createServer } from 'node:http'
import { createSecureServer } from 'node:http2'
import os from 'os';

async function loadEnvFromWranglerToml() {
	const wranglerPath = path.join(path.dirname(__dirname), 'wrangler.toml');
	const tomlContent = await fs.readFile(wranglerPath, 'utf-8');
	return toml.parse(tomlContent).vars;
}

const getDbNameByUrl = (url: string) => {
	const oUrl = new URL(url);
	const aPath = oUrl.pathname.split('/');
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
};

const fetch = async (req: Request<unknown, CfProperties<unknown>>) => {
	const dbPath = `prisma/${getDbNameByUrl(req.url)}.db`;
	//console.log('dbPath', dbPath);
	const DB = new D1Database(dbPath);
	const env: Env = {
		...await loadEnvFromWranglerToml(),
		DB
	};
	const res = await routes.fetch(req, env);
	DB.close();
	return res;
}

async function getAcmeServerOptions(domain: string) {
	const baseDir = path.join(os.homedir(), '.acme.sh', `${domain}_ecc`);
	return {
		key: await fs.readFile(path.join(baseDir, `${domain}.key`)),
		cert: await fs.readFile(path.join(baseDir, 'fullchain.cer')),
	};
}

async function main(defaPort: number, domain: string) {
	const port = Number(process.env.HTTP_PORT) || defaPort;

	try {
		const server = serve({
			fetch,
			createServer: createSecureServer,
			serverOptions: await getAcmeServerOptions(domain),
			port,
		});

		server.on('error', (err) => {
			console.error('HTTP/2 Server encountered an error:', err);
		});

		server.on('listening', () => {
			console.log(`HTTP/2 Server is running on ${domain}:${port}`);
		});

	} catch (e) {
		const server = serve({
			fetch,
			createServer,
			port,
		});

		server.on('error', (err) => {
			console.error('HTTP/1 Server encountered an error:', err);
		});

		server.on('listening', () => {
			console.log(`HTTP/1 Server is running on port ${port}`);
		});
	}
}

main(8089, 'anan.cc');

