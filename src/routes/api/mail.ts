import { Hono } from 'hono';
import { Env } from '../../utils/interface';
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
    const prisma = new PrismaClient({ adapter: new PrismaD1(c.env.DB) });
    const select = {
        id: true,
        created: true,
        email_from: true,
        email_to: true,
        subject: true,
    };
    const orderBy: any[] = [{ id: 'desc' }];
    const take = Number(c.req.query('take') || 10);
    const skip = Number(c.req.query('skip') || 0);
    const results = await prisma.mails.findMany({ select, orderBy, skip, take });
    return c.json(results);
});

app.get("/:id", async (c) => {
    const prisma = new PrismaClient({ adapter: new PrismaD1(c.env.DB) });
    const id = Number(c.req.param("id"));
    if (!id) {
        return c.json({ message: "require[id]" }, 400);
    }
    const where: any = { id };
    const results = await prisma.mails.findFirst({ where });
    if (!results) {
        return c.json({ message: `Id(${id}) Not found` }, 404);
    }
    return c.json(results);
});



export default app;
