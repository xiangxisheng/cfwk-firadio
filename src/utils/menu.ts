
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
}

interface Menu {
	path: string;
	name: string;
	component: string;
	redirect?: string;
	meta: Meta;
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
