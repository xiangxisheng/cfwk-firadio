export default () => {
	//取得sql实例
	const mData = {
		sField: '*',
		sTableName: '',
		mWhere: new Map<string, string>(),
		sWhere: '',
		isLock: false,
		limit: 0,
	};
	const oSql = {
		table(sTableName: string) {
			mData.sTableName = sTableName;
			return oSql;
		},
		field(sField: string) {
			mData.sField = sField;
			return oSql;
		},
		where(mWhere: Map<string, string>, sWhere: string) {
			mData.mWhere = mWhere;
			if (sWhere) {
				mData.sWhere = sWhere;
			} else {
				// 如果没有提供sWhere就需要自动生成
				const aWhere = [];
				for (const k in mWhere) {
					aWhere.push(`${k}=:${k}`);
				}
				if (aWhere.length > 0) {
					mData.sWhere = '(' + aWhere.join(')AND(') + ')';
				}
			}
			return oSql;
		},
		lock() {
			mData.isLock = true;
			return oSql;
		},

		select() {
			const aSql = [];
			aSql.push(`SELECT ${mData.sField} FROM ${mData.sTableName}`);
			if (mData.sWhere) {
				aSql.push(`WHERE ${mData.sWhere}`);
			}
			if (mData.limit) {
				aSql.push(`LIMIT ${mData.limit}`);
			}
			if (mData.isLock) {
				aSql.push(`FOR UPDATE`);
			}
			const sSql = aSql.join(' ');
			const values = Object.values(mData.mWhere);
			return [sSql, values];
		},
		async find() {
			mData.limit = 1;
			const aRows = await oSql.select();
			for (const k in aRows) {
				return aRows[k];
			}
		},
		add(mValue: Map<string, null | string | number>): any[] {
			const columns = Array.from(mValue.keys()).join(', ');
			const placeholders = Array.from(mValue.keys()).map(() => '?').join(', ');
			const values = Array.from(mValue.values());
			const sSql = `INSERT INTO ${mData.sTableName} (${columns}) VALUES (${placeholders})`;
			return [sSql, values];
		},
	};
	return oSql;
};
