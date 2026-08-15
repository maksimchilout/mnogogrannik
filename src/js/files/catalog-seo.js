import {
	DEFAULT_CATALOG_SEO,
	SITE_ORIGIN,
	catalogAbsoluteUrl,
	getSectionById,
	getSubById,
	resolveSeo,
} from './catalog-taxonomy.js';

function setMetaBySelector(selector, attr, value) {
	const el = document.querySelector(selector);
	if (el) el.setAttribute(attr, value);
}

export function applyCatalogSeo(sectionId, subId = null) {
	if (!document.querySelector('[data-catalog-page], [data-catalog-grid]')) return;

	const section = sectionId ? getSectionById(sectionId) : null;
	const sub = section && subId ? getSubById(section, subId) : null;
	const seo = section ? resolveSeo(section, sub) : DEFAULT_CATALOG_SEO;

	document.title = seo.title;
	setMetaBySelector('meta[name="description"]', 'content', seo.description);
	setMetaBySelector('meta[property="og:title"]', 'content', seo.title);
	setMetaBySelector('meta[property="og:description"]', 'content', seo.description);
	setMetaBySelector('meta[name="twitter:title"]', 'content', seo.title);
	setMetaBySelector('meta[name="twitter:description"]', 'content', seo.description);

	const canonical = section
		? catalogAbsoluteUrl(section.slug, sub?.slug || null)
		: `${SITE_ORIGIN}/catalog/`;

	setMetaBySelector('link[rel="canonical"]', 'href', canonical);
	setMetaBySelector('meta[property="og:url"]', 'content', canonical);
}
