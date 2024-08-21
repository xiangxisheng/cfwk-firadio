interface Meta {
	currentActiveMenu?: string;
	frameSrc?: string;
	hideMenu?: boolean;
	hideChildrenInMenu?: boolean;
	hideBreadcrumb?: boolean;
	icon?: string;
	ignoreKeepAlive?: boolean;
	showMenu?: boolean;
	title: string;
	roles?: string[];
}

interface Menu {
	createTime?: string;
	icon?: string;
	menuName?: string;
	orderNo?: number;
	path: string;
	name: string;
	component: string;
	redirect?: string;
	meta?: Meta;
	children?: Array<Menu>;
}

export function menu_from_list_to_tree(_aRecords: Record<string, unknown>[], parent_id: unknown = 0): Array<Menu> {
	const aRecords = _aRecords.filter((_mRecord: Record<string, unknown>) => {
		if (_mRecord['parent_id'] === parent_id) {
			return true;
		}
	});
	const root = Array<Menu>();
	for (const record of aRecords) {
		const menu: Menu = {
			createTime: record['createTime']?.toString(),
			icon: record['icon']?.toString(),
			menuName: record['menuName']?.toString(),
			orderNo: record['orderNo'] as number,
			path: record['path']?.toString() ?? '',
			name: record['name']?.toString() ?? '',
			component: record['component']?.toString() ?? '',
			redirect: record['redirect']?.toString(),
			meta: record['meta'] as Meta,
			children: menu_from_list_to_tree(_aRecords, record['id']),
		};
		root.push(menu);
	}
	return root;
}
