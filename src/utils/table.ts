export function fGetColumnsForResult(_aColumns: Array<Record<string, unknown>>) {
	// 通过【列配置】返回给浏览器配置前端
	const aColumns = [];
	for (const mColumn of _aColumns) {
		if (!mColumn.title) {
			continue;
		}
		if (mColumn.sorter) {
			mColumn.sorter = true;
		}
		if (mColumn.sql) {
			// 删除对于SQL的配置，不让前端看到
			delete mColumn.sql;
		}
		aColumns.push(mColumn);
	}
	return aColumns;
}
