
export interface Menu {
	path: string;
	name: string;
	component: string;
	redirect?: string;
	meta: {
		currentActiveMenu?: string;
		frameSrc?: string;
		hideMenu?: boolean;
		hideChildrenInMenu?: boolean;
		hideBreadcrumb?: boolean;
		icon?: string;
		ignoreKeepAlive?: boolean;
		showMenu?: boolean;
		title: string;
	};
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
			meta: {
				title: record['title']?.toString() ?? '',
			}
		};
		if (record['redirect']) {
			menu.redirect = record['redirect'].toString();
		}
		if (typeof record['meta'] === 'string') {
			const meta: Record<string, unknown> = JSON.parse(record['meta']);
			menu.meta.currentActiveMenu = meta['currentActiveMenu']?.toString();
			menu.meta.frameSrc = meta['frameSrc']?.toString();
			if (typeof meta['hideMenu'] === 'boolean') {
				menu.meta.hideMenu = meta['hideMenu'];
			}
		}
		menu.children = menu_from_list_to_tree(_aRecords, record['id']);
		root.push(menu);
	}
	return root;
}
