interface SqlParam {
	mSelect?: Record<string, string>;
	sFrom?: String;
	aWhere?: Array<[string, any]>;
	aOrderBy?: Array<string>;
	isLock: Boolean;
	iLimit?: Number;
	iOffset?: Number;
	sBuildSql?: String;
	aBuildParam: Array<any>;
}

export function SQL() {
	//取得sql实例
	const mData: SqlParam = {
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
	const oSql = {
		from(sFrom: string) {
			mData.sFrom = sFrom;
			return oSql;
		},
		select(mSelect: Record<string, string>) {
			mData.mSelect = mSelect;
			return oSql;
		},
		where(aWhere: Array<[string, Array<any>]>) {
			mData.aWhere = aWhere;
			return oSql;
		},
		orderBy(aOrderBy: string[]) {
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
			if (mData.aOrderBy !== undefined) {
				aSql.push(`ORDER BY ${mData.aOrderBy.join(',')}`);
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
		buildInsert(mValue: Record<string, string | number>) {
			// 构建[INSERT]SQL语句
			const columns = Array.from(Object.keys(mValue)).join(', ');
			const placeholders = Array.from(Object.keys(mValue))
				.map(() => '?')
				.join(', ');
			mData.sBuildSql = `INSERT INTO ${mData.sFrom} (${columns}) VALUES (${placeholders})`;
			mData.aBuildParam = Array.from(Object.values(mValue));
			return oSql;
		},
		buildUpdate(mSet: Record<string, string | number>) {
			// 构建[UPDATE]SQL语句
			if (mSet.length === 0) {
				throw new Error('mSet不能为空');
			}
			mData.aBuildParam = new Array<any>();
			const updateSets: string[] = [];
			for (const k in mSet) {
				updateSets.push(`${k}=?`);
				mData.aBuildParam.push(mSet[k]);
			}
			const aSql: string[] = [];
			aSql.push(`UPDATE ${mData.sFrom} SET ${updateSets.join(',')}`);
			putWhere(aSql);
			mData.sBuildSql = aSql.join(' ');
			return oSql;
		},
		buildUpsert(mConflict: Record<string, string | number>, mSet: Record<string, string | number>) {
			// 构建[INSERT]SQL语句
			const columns: string[] = [];
			const conflict: string[] = [];
			const updateSets: string[] = [];
			const mValue: Record<string, string | number> = {};
			for (const k in mConflict) {
				columns.push(`${k}`);
				conflict.push(`${k}`);
				mValue[k] = mConflict[k];
			}
			for (const k in mSet) {
				columns.push(`${k}`);
				updateSets.push(`${k}=excluded.${k}`);
				mValue[k] = mSet[k];
			}
			const placeholders = Array.from(Object.keys(columns))
				.map(() => '?')
				.join(',');
			mData.sBuildSql = `INSERT INTO ${mData.sFrom}(${columns.join(',')})VALUES(${placeholders})ON CONFLICT(${conflict.join(
				','
			)}) DO UPDATE SET ${updateSets.join(',')}`;
			mData.aBuildParam = Array.from(Object.values(mValue));
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
