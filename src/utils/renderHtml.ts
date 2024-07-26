import { HtmlContCent } from './interface';

export default (content: HtmlContCent) => {
	return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${content.title}</title>
<style>
body, html {
	margin: 0;
	padding: 0;
	height: 100%;
	overflow: hidden;
}
iframe {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border: none;
}
</style>
</head>
<body>
<iframe id="iframe" style="display: none;" src="${content.url}" seamless></iframe>
<script>
setTimeout(function() {
//table.style.display = 'none';
iframe.style.display = 'block';
}, 0);
</script>
</body>
</html>
`;
};
