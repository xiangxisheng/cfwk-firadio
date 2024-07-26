import { Hono } from 'hono';
import { Env } from '../../utils/interface';

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
    const limit = c.req.query('limit') || 10;
    const offset = c.req.query('offset') || 0;
    try {
        let { results } = await c.env.DB.prepare(
            "SELECT id,email_from,email_to,subject FROM mails ORDER BY id DESC LIMIT ? OFFSET ?",
        ).bind(limit, offset).all();
        return c.json(results);
    } catch (e) {
        if (e instanceof Error) {
            return c.json({ err: e.message }, 500);
        }
        return c.json({ err: e }, 500);
    }
});

app.get("/:id", async (c) => {
    const id = c.req.param("id");
    try {
        let { results } = await c.env.DB.prepare(
            "SELECT * FROM mails WHERE id=?",
        ).bind(id).all();
        for (const result of results) {
            //result.headers = JSON.parse(result.headers);
        }
        return c.json(results);
    } catch (e) {
        if (e instanceof Error) {
            return c.json({ err: e.message }, 500);
        }
        return c.json({ err: e }, 500);
    }
});



export default app;
