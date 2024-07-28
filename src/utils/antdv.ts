import { Hono } from 'hono';
import { Env } from './interface';
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const app = new Hono<{ Bindings: Env }>();

const setting = {
	"api_ext": "",
	"api_root": "/api",
	"assets_dir": "https://quick-antdv-assets.pages.dev",
	"component_dir": "https://v3.anan.cc/static/component",
	"component_vue_ext": "vue",
	"component_js_ext": "js",
	"component_gz_ext": "",
	"hashHistory": true,
	"delay": 0,
	"isDev": false,
	"static_dir": "https://v3.anan.cc/static",
	"title": "Quick Antdv",
	"i18n_locales": [
		{ "name": "en_us", "title": "English" },
		{ "name": "zh_cn", "title": "简体中文" },
		{ "name": "km_kh", "title": "ខ្មែរ" },
	],
	"db": "default",
};
const route = {
	"path": "/",
	"component": "common/index",
	"children": [
		{
			"path": "/:pathMatch(.*)",
			"component": "common/404"
		},
		{
			"name": "console",
			"label": "menu.console",
			"component": "common/panel",
			"role": "user",
			"children": [
				{
					"name": "system",
					"label": "menu.system",
					"role": "sysadmin",
					"children": [
						{
							"name": "i18n_data",
							"label": "menu.language_setting",
							"component": "common/table",
							"role": "sysadmin"
						},
						{
							"name": "roles",
							"label": "menu.roles",
							"component": "common/table",
							"role": "sysadmin"
						},
						{
							"name": "users",
							"label": "menu.users",
							"component": "common/table",
							"role": "sysadmin",
							"alias": "/"
						},
					],
				},
			],
		},
		{
			"name": "register",
			"label": "sign.register",
			"component": "common/form",
			"role": "public"
		},
		{
			"name": "login",
			"label": "sign.login",
			"component": "common/form",
			"role": "public"
		},
		{
			"name": "logout",
			"role": "public"
		},
	],
};
const config = {
	setting,
	routes: [route],
};

app.get("/", async (c) => {
	const html = `<!DOCTYPE html>
<html>

<head>
	<base href="/" />
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${config.setting.title}</title>
	<link rel="icon" href="favicon.ico" type="image/x-icon">
<style>
body,
html {
	width: 100%;
	height: 100%;
	margin: 0;
}
</style>
</head>

<body>
	<div id="loader" style="position: absolute; background-color: black; width: 100%; height: 100%; z-index: 999;">
		<div class="loader">Loading...</div>
	</div>
	<div id="app"><router-view></router-view></div>
	<div class="browser-upgrade" style="display: none;">
		<div class="browser-upgrade__img">
			<img id="logo" alt="logo" src="">
		</div>
		<p class="browser-upgrade__text">
			The browser version is too low, please change to another browser.<br>
			إصدار المتصفح الخاص بك منخفض جدًا. يرجى التغيير إلى متصفح آخر.<br>
			La versión del navegador es demasiado baja, cámbiela a otro navegador.<br>
			当前浏览器版本太低，请换别的浏览器。<br>
			ブラウザのバージョンが低すぎるため、別のブラウザに変更してください。<br>
			브라우저 버전이 너무 낮습니다. 다른 브라우저로 변경하세요.<br>
			เวอร์ชันของเบราว์เซอร์ต่ำเกินไป โปรดเปลี่ยนเป็นเบราว์เซอร์อื่น<br>
			កំណែកម្មវិធីរុករកតាមអ៊ីនធឺណិតទាបពេក សូមប្តូរទៅកម្មវិធីរុករកផ្សេង។<br>
			Versi penyemak imbas terlalu rendah, sila tukar kepada penyemak imbas lain.<br>
			Versi browser terlalu rendah, silakan ganti ke browser lain.<br>
			La version du navigateur est trop basse, veuillez passer à un autre navigateur.<br>
			Версия браузера слишком низкая, используйте другой браузер.<br>
			<br>
		</p>
	</div>
</body>

<script>
	const config = ${JSON.stringify(config)};
	if (!config.setting.assets_dir) {
		config.setting.assets_dir = config.setting.static_dir + '/assets';
	}

	function isAsyncAwaitSupport() {
		let func;
		try {
			eval("func = async function(){};");
		} catch (e) {
			return false;
		}
		return Object.getPrototypeOf(func).constructor != null;
	}
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = config.setting.assets_dir + '/css/qadv.css';
	document.head.appendChild(link);
	if (isAsyncAwaitSupport()) {
		const script = document.createElement('script');
		script.src = config.setting.static_dir + '/qadv.js?d=20240727';
		script.onload = function () {
			window.QADV = window.QADV(config);
			window.QADV.main();
		};
		document.head.appendChild(script);
	} else {
		document.getElementById('loader').style.display = 'none';
		document.getElementsByClassName('browser-upgrade')[0].style.display = '';
		document.getElementById('logo').src = config.setting.assets_dir + "/img/logo.svg";
	}
</script>

</html>`;
	return c.html(html);
});

export default app;
