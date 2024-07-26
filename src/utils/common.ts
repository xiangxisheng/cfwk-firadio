
const getPartsOfDomain = (hostname: string) => {
	return hostname.split('.').filter(item => item.length > 0).reverse();
};

const getPartsOfPathname = (pathname: string) => {
	return pathname.split('/').filter(item => item.length > 0);
};

const reponse = (html: string, status = 200) => {
	return new Response(html, {
		status: status,
		headers: {
			"content-type": "text/html; charset=utf-8"
		}
	});
};

const html = (title: string) => {
	return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body>${title}</body>
</html>`;
};

const json = (
/** @type {object} */ data: object,
/** @type {number} */ status = 200
) => {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8"
		}
	});
};

export {
	getPartsOfDomain,
	getPartsOfPathname,
	reponse,
	html,
	json,
};
