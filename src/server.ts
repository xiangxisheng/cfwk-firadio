import routes from './routes';
import { serve } from '@hono/node-server';
import { D1Database } from '@/utils/sqlite';

const env = {
	DB: new D1Database('prisma/dev.db'),
};

const port = 9000;
console.log(`Server is running on port ${port}`);
serve({
	fetch: (req) => routes.fetch(req, env),
	port,
});
