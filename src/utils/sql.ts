interface SqlParam {
	aSelect: Array<string>,
	sFrom: null | String,
	aWhere: null | Array<[string, any]>,
	aOrderBy: null | Array<string>,
	isLock: Boolean,
	iLimit: null | Number,
	iOffset: null | Number,
	sBuildSql: null | String,
	aBuildParam: null | Array<any>,
}

export function SQL() {
	//取得sql实例
	const mData: SqlParam = {
		aSelect: new Array('*'),
		sFrom: null,
		aWhere: null,
		aOrderBy: null,
		isLock: false,
		iLimit: null,
		iOffset: null,
		sBuildSql: null,
		aBuildParam: null,
	};
	const oSql = {
		from(sFrom: string) {
			mData.sFrom = sFrom;
			return oSql;
		},
		select(aSelect: string[]) {
			mData.aSelect = aSelect;
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
			const aSql = [];
			aSql.push(`SELECT ${mData.aSelect.join(',')}`);
			if (mData.sFrom === null) {
				throw new Error('未指定FROM表名');
			}
			aSql.push(`FROM ${mData.sFrom}`);
			if (mData.aWhere !== null) {
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
			if (mData.aOrderBy !== null) {
				aSql.push(`ORDER BY ${mData.aOrderBy.join(',')}`);
			}
			if (mData.iLimit !== null) {
				aSql.push(`LIMIT ${mData.iLimit}`);
			}
			if (mData.iOffset !== null) {
				aSql.push(`OFFSET ${mData.iOffset}`);
			}
			if (mData.isLock) {
				aSql.push(`FOR UPDATE`);
			}
			mData.sBuildSql = aSql.join(' ');
			return oSql;
		},
		buildInsert(mValue: Map<string, null | string | number>) {
			// 构建[INSERT]SQL语句
			const columns = Array.from(mValue.keys()).join(', ');
			const placeholders = Array.from(mValue.keys()).map(() => '?').join(', ');
			mData.sBuildSql = `INSERT INTO ${mData.sFrom} (${columns}) VALUES (${placeholders})`;
			mData.aBuildParam = Array.from(mValue.values());
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
};
