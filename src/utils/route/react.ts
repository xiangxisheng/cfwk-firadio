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
