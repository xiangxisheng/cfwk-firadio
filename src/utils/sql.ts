interface SqlParam {
	mSelect?: Record<string, string>;
	sFrom: string;
	aWhere?: Array<[string, Array<string | number>]>;
	aGroupBy?: Array<string>;
	aOrderBy?: Array<[string, string]>;
	isLock: Boolean;
	iLimit?: Number;
	iOffset?: Number;
	mSet?: Record<string, string | number | undefined | null>;
	mConflict?: Record<string, string | number>;
	sBuildSql?: string;
	aBuildParam: Array<any>;
}

export function SQL() {
	//取得sql实例
	const mData: SqlParam = {
		sFrom: '',
		isLock: false,
		aBuildParam: new Array<any>(),
	};
	const putWhere = (aSql: string[]) => {
		if (mData.aWhere !== undefined) {
			const aWhereSql = new Array<string>();
			for (const aWhereOne of mData.aWhere) {
				aWhereSql.push(aWhereOne[0]);
				for (const val of aWhereOne[1]) {
					mData.aBuildParam.push(val);
				}
			}
			if (aWhereSql.length > 0) {
				aSql.push(`WHERE (${aWhereSql.join(')AND(')})`);
			}
		}
	};
	const quoteSQLName = (field: string): string => {
		return '[' + field + ']';
	};
	const oSql = {
		from(sFrom: string) {
			mData.sFrom = sFrom;
			return oSql;
		},
		select(mSelect: Record<string, string>) {
			mData.mSelect = mSelect;
			return oSql;
		},
		where(aWhere: Array<[string, Array<string | number>]>) {
			mData.aWhere = aWhere;
			return oSql;
		},
		groupBy(aGroupBy: Array<string>) {
			mData.aGroupBy = aGroupBy;
			return oSql;
		},
		orderBy(aOrderBy: Array<[string, string]>) {
			mData.aOrderBy = aOrderBy;
			return oSql;
		},
		limit(iLimit: number) {
			mData.iLimit = iLimit;
			return oSql;
		},
		offset(iOffset: number) {
			mData.iOffset = iOffset;
			return oSql;
		},
		lock() {
			mData.isLock = true;
			return oSql;
		},
		set(_mSet: Record<string, unknown>) {
			const mSet: Record<string, string | number | null> = {};
			for (const k in _mSet) {
				const v = _mSet[k];
				if (v === null) {
					mSet[k] = v;
					continue;
				}
				if (typeof (v) === 'string') {
					mSet[k] = v;
					continue;
				}
				if (typeof (v) === 'number') {
					mSet[k] = v;
					continue;
				}
				mSet[k] = JSON.stringify(v);
			}
			if (mSet.length === 0) {
				throw new Error('mSet不能为空');
			}
			mData.mSet = mSet;
			return oSql;
		},
		conflict(mConflict: Record<string, string | number>) {
			if (mConflict.length === 0) {
				throw new Error('mConflict不能为空');
			}
			mData.mConflict = mConflict;
			return oSql;
		},
		buildSelect() {
			// 构建[SELECT]查询语句
			mData.aBuildParam = new Array<any>();
			const aSql: string[] = [];
			const aSelect = new Array<string>();
			for (const k in mData.mSelect) {
				const v = mData.mSelect[k];
				aSelect.push(`${v} AS ${k}`);
			}
			aSql.push(`SELECT ${aSelect.length === 0 ? '*' : aSelect.join(',')}`);
			if (mData.sFrom === undefined) {
				throw new Error('未指定FROM表名');
			}
			aSql.push(`FROM ${mData.sFrom}`);
			putWhere(aSql);
			if (mData.aGroupBy !== undefined) {
				const aGroupBy = new Array<string>();
				for (const o of mData.aGroupBy) {
					aGroupBy.push(`${quoteSQLName(o)}`);
				}
				aSql.push(`GROUP BY ${aGroupBy.join(',')}`);
			}
			if (mData.aOrderBy !== undefined) {
				const aOrderBy = new Array<string>();
				for (const o of mData.aOrderBy) {
					aOrderBy.push(`${quoteSQLName(o[0])} ${o[1]}`);
				}
				aSql.push(`ORDER BY ${aOrderBy.join(',')}`);
			}
			if (mData.iLimit !== undefined) {
				aSql.push(`LIMIT ${mData.iLimit}`);
			}
			if (mData.iOffset !== undefined) {
				aSql.push(`OFFSET ${mData.iOffset}`);
			}
			if (mData.isLock) {
				aSql.push(`FOR UPDATE`);
			}
			mData.sBuildSql = aSql.join(' ');
			return oSql;
		},
		buildInsert() {
			// 构建[INSERT]SQL语句
			if (mData.mSet === undefined) {
				throw new Error('mSet不能为空');
			}
			const columns = Object.keys(mData.mSet).map(quoteSQLName).join(', ');
			const placeholders = Array.from(Object.keys(mData.mSet))
				.map(() => '?')
				.join(', ');
			mData.sBuildSql = `INSERT INTO ${quoteSQLName(mData.sFrom)} (${columns}) VALUES (${placeholders})`;
			mData.aBuildParam = Array.from(Object.values(mData.mSet));
			return oSql;
		},
		buildUpdate() {
			// 构建[UPDATE]SQL语句
			mData.aBuildParam = new Array<any>();
			const updateSets: string[] = [];
			for (const k in mData.mSet) {
				const v = mData.mSet[k];
				if (v === undefined) {
					continue;
				}
				if (v === null) {
					updateSets.push(`${quoteSQLName(k)}=NULL`);
				} else {
					updateSets.push(`${quoteSQLName(k)}=?`);
					mData.aBuildParam.push(v);
				}
			}
			const aSql: string[] = [];
			aSql.push(`UPDATE ${mData.sFrom} SET ${updateSets.join(',')}`);
			putWhere(aSql);
			mData.sBuildSql = aSql.join(' ');
			return oSql;
		},
		buildUpsert() {
			// 构建[INSERT]SQL语句
			const columns: string[] = [];
			const conflict: string[] = [];
			const updateSets: string[] = [];
			const aValue: Array<string | number> = [];
			const aPlaceholders: Array<string> = [];
			for (const k in mData.mConflict) {
				columns.push(`${quoteSQLName(k)}`);
				aPlaceholders.push('?');
				conflict.push(`${quoteSQLName(k)}`);
				aValue.push(mData.mConflict[k]);
			}
			for (const k in mData.mSet) {
				const v = mData.mSet[k];
				if (v === undefined) {
					continue;
				}
				columns.push(`${k}`);
				updateSets.push(`${quoteSQLName(k)}=excluded.${quoteSQLName(k)}`);
				if (v === null) {
					aPlaceholders.push('NULL');
				} else {
					aValue.push(v);
					aPlaceholders.push('?');
				}
			}
			const placeholders = aPlaceholders.join(',');
			mData.sBuildSql = `INSERT INTO ${mData.sFrom}(${columns.join(',')})VALUES(${placeholders})ON CONFLICT(${conflict.join(
				','
			)}) DO UPDATE SET ${updateSets.join(',')}`;
			mData.aBuildParam = aValue;
			return oSql;
		},
		buildDelete() {
			const aSql: string[] = [];
			aSql.push(`DELETE FROM ${mData.sFrom}`);
			putWhere(aSql);
			mData.sBuildSql = aSql.join(' ');
			return oSql;
		},
		getSQL() {
			// 获取预编译用到的SQL语句
			if (!mData.sBuildSql) {
				throw new Error('[getSQL]前要先[build...]');
			}
			return mData.sBuildSql;
		},
		getParam() {
			// 获取绑定参数用到的参数列表
			return mData.aBuildParam;
		},
	};
	return oSql;
}
