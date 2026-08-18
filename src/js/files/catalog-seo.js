import {
	DEFAULT_CATALOG_SEO,
	getSectionById,
	getSubById,
	resolveSeo,
	siteAbsoluteUrl,
} from './catalog-taxonomy.js';

function setMetaBySelector(selector, attr, value) {
	const el = document.querySelector(selector);
	if (el) el.setAttribute(attr, value);
}

export function applyCatalogSeo(sectionId, subId = null, product = null) {
	if (!document.querySelector('[data-catalog-page], [data-catalog-grid]')) return;

	const section = sectionId ? getSectionById(sectionId) : null;
	const sub = section && subId ? getSubById(section, subId) : null;
	const seo = product
		? resolveSeo(section, sub, product)
		: section
			? resolveSeo(section, sub)
			: DEFAULT_CATALOG_SEO;

	document.title = seo.title;
	setMetaBySelector('meta[name="description"]', 'content', seo.description);
	setMetaBySelector('meta[property="og:title"]', 'content', seo.title);
	setMetaBySelector('meta[property="og:description"]', 'content', seo.description);
	setMetaBySelector('meta[name="twitter:title"]', 'content', seo.title);
	setMetaBySelector('meta[name="twitter:description"]', 'content', seo.description);

	const pathname =
		typeof window !== 'undefined' && window.location?.pathname
			? window.location.pathname
			: section
				? `/${['catalog', section.slug, sub?.slug].filter(Boolean).join('/')}/`
				: '/catalog/';
	const canonical = siteAbsoluteUrl(pathname);

	setMetaBySelector('link[rel="canonical"]', 'href', canonical);
	setMetaBySelector('meta[property="og:url"]', 'content', canonical);
}
