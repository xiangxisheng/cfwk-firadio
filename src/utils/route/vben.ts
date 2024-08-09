import { Route } from '@/utils/route';

const app = Route();

app.get("/", async (c) => {
	const __CONF__ = {
		VITE_GLOB_APP_TITLE: "BKATM",
		VITE_GLOB_API_URL: "/api/bkatm",
		VITE_GLOB_UPLOAD_URL: "/api/bkatm/upload",
		VITE_GLOB_API_URL_PREFIX: "",
		VITE_PUBLIC_PATH: "https://vue-vben-admin-v2.pages.dev",
	};

	const html = `<!doctype html>
<html lang="zh" id="htmlRoot">

<head>
	<script>
		window.__PRODUCTION__005600620065006E002000410064006D0069006E__CONF__ = ${JSON.stringify(__CONF__)};
		Object.freeze(window.__PRODUCTION__005600620065006E002000410064006D0069006E__CONF__);
		Object.defineProperty(window, "__PRODUCTION__005600620065006E002000410064006D0069006E__CONF__", { configurable: false, writable: false, });
	</script>
	<meta charset="UTF-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<meta name="renderer" content="webkit" />
	<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=0" />
	<title>${__CONF__.VITE_GLOB_APP_TITLE}</title>
	<link rel="icon" href="${__CONF__.VITE_PUBLIC_PATH}/favicon.ico" />
	<script type="module" crossorigin src="${__CONF__.VITE_PUBLIC_PATH}/assets/entry/index-BOZ3nP-o.js"></script>
	<link rel="modulepreload" crossorigin href="${__CONF__.VITE_PUBLIC_PATH}/assets/vue-BjERyvPm.js">
	<link rel="modulepreload" crossorigin href="${__CONF__.VITE_PUBLIC_PATH}/assets/antd-CXImNLC1.js">
	<link rel="stylesheet" crossorigin href="${__CONF__.VITE_PUBLIC_PATH}/assets/index-jE23RaVa.css">
</head>

<body>
	<div id="app">
		<style>
			html {
				line-height: 1.15
			}

			html[data-theme=dark] .app-loading {
				background-color: #2c344a
			}

			html[data-theme=dark] .app-loading .app-loading-title {
				color: rgb(255 255 255 / 85%)
			}

			.app-loading {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				width: 100%;
				height: 100%;
				background-color: #f4f7f9
			}

			.app-loading .app-loading-wrap {
				display: flex;
				position: absolute;
				top: 50%;
				left: 50%;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				transform: translate3d(-50%, -50%, 0)
			}

			.app-loading .dots {
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 98px
			}

			.app-loading .app-loading-title {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-top: 30px;
				color: rgb(0 0 0 / 85%);
				font-size: 30px
			}

			.app-loading .app-loading-logo {
				display: block;
				width: 90px;
				margin: 0 auto;
				margin-bottom: 20px
			}

			.dot {
				display: inline-block;
				position: relative;
				box-sizing: border-box;
				width: 48px;
				height: 48px;
				margin-top: 30px;
				transform: rotate(45deg);
				animation: ant-rotate 1.2s infinite linear;
				font-size: 32px
			}

			.dot i {
				display: block;
				position: absolute;
				width: 20px;
				height: 20px;
				transform: scale(.75);
				transform-origin: 50% 50%;
				animation: ant-spin-move 1s infinite linear alternate;
				border-radius: 100%;
				opacity: .3;
				background-color: #0065cc
			}

			.dot i:first-child {
				top: 0;
				left: 0
			}

			.dot i:nth-child(2) {
				top: 0;
				right: 0;
				animation-delay: .4s
			}

			.dot i:nth-child(3) {
				right: 0;
				bottom: 0;
				animation-delay: .8s
			}

			.dot i:nth-child(4) {
				bottom: 0;
				left: 0;
				animation-delay: 1.2s
			}

			@keyframes ant-rotate {
				to {
					transform: rotate(405deg)
				}
			}

			@keyframes ant-spin-move {
				to {
					opacity: 1
				}
			}
		</style>
		<div class="app-loading">
			<div class="app-loading-wrap"><img src="${__CONF__.VITE_PUBLIC_PATH}/logo.png" class="app-loading-logo"
					alt="Logo" />
				<div class="app-loading-dots"><span class="dot dot-spin"><i></i><i></i><i></i><i></i></span></div>
				<div class="app-loading-title">${__CONF__.VITE_GLOB_APP_TITLE}</div>
			</div>
		</div>
	</div>
</body>

</html>`;
	return c.html(html);
});

export default app;
