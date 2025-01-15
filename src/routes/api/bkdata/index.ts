import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson, ResponseData, ResponseMessage } from '@/utils/vben';

interface RowI18n {
	group: string;
	name: string;
	locale: string;
}

const app = Route();

app.onError((err, c) => {
	if (err instanceof ResponseData) {
		console.log(`app.onError.responseData:`, err.responseData);
		return cJson(c, err.responseData);
	}
	if (err instanceof ResponseMessage) {
		console.log(`app.onError.resultData:`, err.resultData);
		return cJson(c, err.resultData);
	}
	console.error(`app.onError.other: ${err.message}`);
	return cJson(c, { code: 500, type: 'error', message: err.message, result: null });
});

//app.route('/public', require('./public').default);
app.route('/panel', require('./panel').default);

app.get('/locale/:localeFile{([a-z_]+).json}', async (c) => {
	const localeFile = c.req.param('localeFile');
	const locale = localeFile.split('.')[0];
	const oCFD1 = new CFD1(c.env.DB);
	const select: Record<string, string> = {};
	select['group'] = '[group]';
	select['name'] = 'name';
	select['locale'] = `locale_${locale}`;
	const oSql = oCFD1.sql().select(select).from('pre_system_i18n_data').buildSelect();
	// console.log('执行的SQL语句', oSql.getSQL());
	const results: RowI18n[] = (await oSql.getStmt().all<RowI18n>()).results;
	const ret: Record<string, Record<string, string>> = {};
	for (const result of results) {
		if (!ret[result.group]) {
			ret[result.group] = {};
		}
		ret[result.group][result.name] = result.locale;
	}
	return c.json(ret);
});

export default app;
