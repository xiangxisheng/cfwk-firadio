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

export class SQL {
	//取得sql实例
	private mData: SqlParam = {
		sFrom: '',
		isLock: false,
		aBuildParam: new Array<any>(),
	};
	private putWhere(aSql: string[]) {
		if (this.mData.aWhere !== undefined) {
			const aWhereSql = new Array<string>();
			for (const aWhereOne of this.mData.aWhere) {
				aWhereSql.push(aWhereOne[0]);
				for (const val of aWhereOne[1]) {
					this.mData.aBuildParam.push(val);
				}
			}
			if (aWhereSql.length > 0) {
				aSql.push(`WHERE (${aWhereSql.join(')AND(')})`);
			}
		}
	};
	private quoteSQLName(field: string): string {
		return '[' + field + ']';
	};

	public from(sFrom: string) {
		this.mData.sFrom = sFrom;
		return this;
	};
	public select(mSelect: Record<string, string>) {
		this.mData.mSelect = mSelect;
		return this;
	};
	public where(aWhere: Array<[string, Array<string | number>]>) {
		this.mData.aWhere = aWhere;
		return this;
	};
	public groupBy(aGroupBy: Array<string>) {
		this.mData.aGroupBy = aGroupBy;
		return this;
	};
	public orderBy(aOrderBy: Array<[string, string]>) {
		this.mData.aOrderBy = aOrderBy;
		return this;
	};
	public limit(iLimit: number) {
		this.mData.iLimit = iLimit;
		return this;
	};
	public offset(iOffset: number) {
		this.mData.iOffset = iOffset;
		return this;
	};
	public lock() {
		this.mData.isLock = true;
		return this;
	};
	public set(_mSet: Record<string, unknown>) {
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
		this.mData.mSet = mSet;
		return this;
	};
	public conflict(mConflict: Record<string, string | number>) {
		if (mConflict.length === 0) {
			throw new Error('mConflict不能为空');
		}
		this.mData.mConflict = mConflict;
		return this;
	};
	public buildSelect() {
		// 构建[SELECT]查询语句
		this.mData.aBuildParam = new Array<any>();
		const aSql: string[] = [];
		const aSelect = new Array<string>();
		for (const k in this.mData.mSelect) {
			const v = this.mData.mSelect[k];
			aSelect.push(`${v} AS ${k}`);
		}
		aSql.push(`SELECT ${aSelect.length === 0 ? '*' : aSelect.join(',')}`);
		if (this.mData.sFrom === undefined) {
			throw new Error('未指定FROM表名');
		}
		aSql.push(`FROM ${this.mData.sFrom}`);
		this.putWhere(aSql);
		if (this.mData.aGroupBy !== undefined) {
			const aGroupBy = new Array<string>();
			for (const o of this.mData.aGroupBy) {
				aGroupBy.push(`${this.quoteSQLName(o)}`);
			}
			aSql.push(`GROUP BY ${aGroupBy.join(',')}`);
		}
		if (this.mData.aOrderBy !== undefined) {
			const aOrderBy = new Array<string>();
			for (const o of this.mData.aOrderBy) {
				aOrderBy.push(`${this.quoteSQLName(o[0])} ${o[1]}`);
			}
			aSql.push(`ORDER BY ${aOrderBy.join(',')}`);
		}
		if (this.mData.iLimit !== undefined) {
			aSql.push(`LIMIT ${this.mData.iLimit}`);
		}
		if (this.mData.iOffset !== undefined) {
			aSql.push(`OFFSET ${this.mData.iOffset}`);
		}
		if (this.mData.isLock) {
			aSql.push(`FOR UPDATE`);
		}
		this.mData.sBuildSql = aSql.join(' ');
		return this;
	};
	public buildInsert() {
		// 构建[INSERT]SQL语句
		if (this.mData.mSet === undefined) {
			throw new Error('mSet不能为空');
		}
		const columns = Object.keys(this.mData.mSet).map(this.quoteSQLName).join(', ');
		const placeholders = Array.from(Object.keys(this.mData.mSet))
			.map(() => '?')
			.join(', ');
		this.mData.sBuildSql = `INSERT INTO ${this.quoteSQLName(this.mData.sFrom)} (${columns}) VALUES (${placeholders})`;
		this.mData.aBuildParam = Array.from(Object.values(this.mData.mSet));
		return this;
	};
	public buildUpdate() {
		// 构建[UPDATE]SQL语句
		this.mData.aBuildParam = new Array<any>();
		const updateSets: string[] = [];
		for (const k in this.mData.mSet) {
			const v = this.mData.mSet[k];
			if (v === undefined) {
				continue;
			}
			if (v === null) {
				updateSets.push(`${this.quoteSQLName(k)}=NULL`);
			} else {
				updateSets.push(`${this.quoteSQLName(k)}=?`);
				this.mData.aBuildParam.push(v);
			}
		}
		const aSql: string[] = [];
		aSql.push(`UPDATE ${this.mData.sFrom} SET ${updateSets.join(',')}`);
		this.putWhere(aSql);
		this.mData.sBuildSql = aSql.join(' ');
		return this;
	};
	public buildUpsert() {
		// 构建[INSERT]SQL语句
		const columns: string[] = [];
		const conflict: string[] = [];
		const updateSets: string[] = [];
		const aValue: Array<string | number> = [];
		const aPlaceholders: Array<string> = [];
		for (const k in this.mData.mConflict) {
			columns.push(`${this.quoteSQLName(k)}`);
			aPlaceholders.push('?');
			conflict.push(`${this.quoteSQLName(k)}`);
			aValue.push(this.mData.mConflict[k]);
		}
		for (const k in this.mData.mSet) {
			const v = this.mData.mSet[k];
			if (v === undefined) {
				continue;
			}
			columns.push(`${k}`);
			updateSets.push(`${this.quoteSQLName(k)}=excluded.${this.quoteSQLName(k)}`);
			if (v === null) {
				aPlaceholders.push('NULL');
			} else {
				aValue.push(v);
				aPlaceholders.push('?');
			}
		}
		const placeholders = aPlaceholders.join(',');
		this.mData.sBuildSql = `INSERT INTO ${this.mData.sFrom}(${columns.join(',')})VALUES(${placeholders})ON CONFLICT(${conflict.join(
			','
		)}) DO UPDATE SET ${updateSets.join(',')}`;
		this.mData.aBuildParam = aValue;
		return this;
	};
	public buildDelete() {
		const aSql: string[] = [];
		aSql.push(`DELETE FROM ${this.mData.sFrom}`);
		this.putWhere(aSql);
		this.mData.sBuildSql = aSql.join(' ');
		return this;
	};
	public getSQL() {
		// 获取预编译用到的SQL语句
		if (!this.mData.sBuildSql) {
			throw new Error('[getSQL]前要先[build...]');
		}
		return this.mData.sBuildSql;
	};
	public getParam() {
		// 获取绑定参数用到的参数列表
		return this.mData.aBuildParam;
	};
}
