export class HtmlContent {
	public title: string = '';
	public params: Record<string, unknown>[] = [];
	public script_src?: string = 'http://127.0.0.1:9001/bundle.js';
	constructor(title: string, params: Record<string, unknown>[]) {
		this.title = title;
		this.params = params;
	}
}

export function html(content: HtmlContent) {
	return `<!-- dist/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${content.title}</title>
</head>
<body>
  <div id="root"></div>
  <script src="${content.script_src}"></script>
</body>
</html>`;
}

import { Route } from '@/utils/route';

const app = Route();

app.get('*', async (c, next) => {
	const acceptHeader = c.req.header('accept') || '';
	if (!acceptHeader.includes('text/html')) {
		return next();
	}
	const config_site = await c.get('configs').site.data();
	const content = new HtmlContent(config_site.title.value, []);
	content.script_src = `https://hk.anan.cc:30338/bundle.js`;
	return c.html(html(content));
});

export default app;
