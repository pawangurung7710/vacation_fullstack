import { categoriesApi, regionsApi } from './api';

export type Region = { _id: string; name: string };

export type NavCategoryChild = {
	_id: string;
	label: string;
	slug: string;
	order?: number;
	tagline?: string;
};

export type NavCategory = {
	_id: string;
	label: string;
	slug: string;
	order?: number;
	children?: NavCategoryChild[];
};

type NavCache = {
	version: 1;
	fetchedAt: number;
	navCategories: NavCategory[];
	regions: Region[];
};

const STORAGE_KEY = 'trekkers_nav_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

let inflight: Promise<NavCache> | null = null;

function safeJsonParse<T>(raw: string | null): T | null {
	if (!raw) return null;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

function readCache(): NavCache | null {
	try {
		const cached = safeJsonParse<NavCache>(localStorage.getItem(STORAGE_KEY));
		if (!cached || cached.version !== 1) return null;
		if (typeof cached.fetchedAt !== 'number') return null;
		if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
		if (!Array.isArray(cached.navCategories) || !Array.isArray(cached.regions)) return null;
		return cached;
	} catch {
		return null;
	}
}

function writeCache(next: NavCache) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {
		// ignore (private mode, quota, etc.)
	}
}

function normalizeNavCategories(rawCategories: any[]): NavCategory[] {
	if (!Array.isArray(rawCategories)) return [];

	const byParentId = new Map<string, NavCategoryChild[]>();

	for (const item of rawCategories) {
		if (!item || !item.parent) continue;
		const parentId =
			typeof item.parent === 'string'
				? item.parent
				: typeof item.parent?._id === 'string'
					? item.parent._id
					: null;
		if (!parentId) continue;
		const child: NavCategoryChild = {
			_id: String(item._id ?? ''),
			label: String(item.label ?? ''),
			slug: String(item.slug ?? ''),
			order: typeof item.order === 'number' ? item.order : undefined,
			tagline: typeof item.tagline === 'string' ? item.tagline : undefined,
		};
		if (!child._id || !child.slug || !child.label) continue;
		const existing = byParentId.get(parentId) ?? [];
		existing.push(child);
		byParentId.set(parentId, existing);
	}

	const topLevel = rawCategories.filter((c) => c && (c.level === 0 || c.parent === null || c.parent === undefined));

	const normalized: NavCategory[] = topLevel
		.map((parent) => {
			const id = String(parent._id ?? '');
			if (!id) return null;
			const children = (byParentId.get(id) ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label));
			return {
				_id: id,
				label: String(parent.label ?? ''),
				slug: String(parent.slug ?? ''),
				order: typeof parent.order === 'number' ? parent.order : undefined,
				children,
			} satisfies NavCategory;
		})
		.filter(Boolean) as NavCategory[];

	return normalized.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label));
}

async function fetchNavData(): Promise<NavCache> {
	const [rawCategories, rawRegions] = await Promise.all([
		categoriesApi.getAll({ isActive: true }),
		regionsApi.getAll({ isActive: true }),
	]);

	const navCategories = normalizeNavCategories(rawCategories);
	const regions: Region[] = Array.isArray(rawRegions)
		? rawRegions
				.map((r: any) => ({ _id: String(r?._id ?? ''), name: String(r?.name ?? '') }))
				.filter((r: Region) => r._id && r.name)
		: [];

	return {
		version: 1,
		fetchedAt: Date.now(),
		navCategories,
		regions,
	};
}

export function getCachedNavigationData(): { navCategories: NavCategory[]; regions: Region[] } | null {
	const cached = readCache();
	if (!cached) return null;
	return { navCategories: cached.navCategories, regions: cached.regions };
}

export function preloadNavigationData(): Promise<{ navCategories: NavCategory[]; regions: Region[] }> {
	if (!inflight) {
		inflight = fetchNavData()
			.then((data) => {
				writeCache(data);
				return data;
			})
			.catch(() => {
				// Keep inflight cleared so a later attempt can retry.
				inflight = null;
				return {
					version: 1,
					fetchedAt: Date.now(),
					navCategories: [],
					regions: [],
				} satisfies NavCache;
			});
	}
	return inflight.then((d) => ({ navCategories: d.navCategories, regions: d.regions }));
}

