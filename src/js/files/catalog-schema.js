import { SITE_ORIGIN, catalogAbsoluteUrl, catalogPath, siteAbsoluteUrl } from './catalog-taxonomy.js';
import {
	catalogImageSrc,
	getProductPrice,
	getProductText,
	getProductTitle,
} from './catalog-utils.js';

export const BRAND_NAME = 'MNOGOGRANNIK';
export const BRAND_ALT = ['mnogogrannik.lab', 'Mnogogrannik'];

const TAX_ID = '691960601';
const LOGO_URL = siteAbsoluteUrl('/img/logo.jpg');
const IMAGE_URL = siteAbsoluteUrl('/img/about/about-hero.jpg');
const PHONES = ['+375 44 586 01 01', '+375 44 567 71 77'];
const SAME_AS = [
	'https://www.instagram.com/mnogogrannik.lab',
	'https://t.me/mnogogrannikLAB',
];

const OPENING_HOURS = [
	{
		'@type': 'OpeningHoursSpecification',
		dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
		opens: '09:00',
		closes: '18:00',
	},
	{
		'@type': 'OpeningHoursSpecification',
		dayOfWeek: 'Saturday',
		opens: '10:00',
		closes: '15:00',
	},
];

function organizationRef() {
	return {
		'@type': 'Organization',
		'@id': `${SITE_ORIGIN}/#organization`,
		name: BRAND_NAME,
	};
}

function buildLocalBusiness({ id, streetAddress, addressLocality, telephone }) {
	return {
		'@type': 'LocalBusiness',
		'@id': id,
		name: BRAND_NAME,
		url: siteAbsoluteUrl('/'),
		telephone,
		image: IMAGE_URL,
		taxID: TAX_ID,
		address: {
			'@type': 'PostalAddress',
			streetAddress,
			addressLocality,
			addressCountry: 'BY',
		},
		openingHoursSpecification: OPENING_HOURS,
		areaServed: {
			'@type': 'Country',
			name: 'Беларусь',
		},
		parentOrganization: { '@id': `${SITE_ORIGIN}/#organization` },
	};
}

const LOCAL_BUSINESS_LOCATIONS = [
	buildLocalBusiness({
		id: `${SITE_ORIGIN}/#localbusiness-minsk`,
		streetAddress: 'ул. Бабушкина, 4А',
		addressLocality: 'Минск',
		telephone: PHONES[0],
	}),
	buildLocalBusiness({
		id: `${SITE_ORIGIN}/#localbusiness-slutsk`,
		streetAddress: 'ул. Гагарина, 34а',
		addressLocality: 'Слуцк',
		telephone: PHONES[1],
	}),
];

export const LOCAL_BUSINESS_SCHEMAS = LOCAL_BUSINESS_LOCATIONS;

/** @deprecated kept for any legacy imports */
export const LOCAL_BUSINESS_SCHEMA = LOCAL_BUSINESS_LOCATIONS[0];

/**
 * Organization + два физических адреса (LocalBusiness).
 * taxID — корректное поле Schema.org для УНП (белорусский идентификационный номер).
 * Родитель остаётся Organization, а не FurnitureStore: мастерская шире мебельного магазина
 * (навесы, мангалы, площадки), локации вложены через location[].
 */
export function buildOrganizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': `${SITE_ORIGIN}/#organization`,
		name: BRAND_NAME,
		alternateName: BRAND_ALT,
		url: siteAbsoluteUrl('/'),
		logo: LOGO_URL,
		image: IMAGE_URL,
		telephone: PHONES,
		taxID: TAX_ID,
		sameAs: SAME_AS,
		description:
			'Мастерская штучных изделий: лофт-мебель, мангальные зоны, детские площадки, арт-декор, лестницы и металлоконструкции на заказ в Минске и Беларуси.',
		location: LOCAL_BUSINESS_LOCATIONS,
	};
}

export const ORGANIZATION_SCHEMA = buildOrganizationSchema();

export const WEBSITE_SCHEMA = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	'@id': `${SITE_ORIGIN}/#website`,
	name: 'mnogogrannik.lab',
	url: siteAbsoluteUrl('/'),
	publisher: { '@id': `${SITE_ORIGIN}/#organization` },
	potentialAction: {
		'@type': 'SearchAction',
		target: `${siteAbsoluteUrl('/catalog/')}?q={search_term_string}`,
		'query-input': 'required name=search_term_string',
	},
};

/**
 * Хлебные крошки каталога: те же данные для визуального блока и BreadcrumbList.
 * @param {{ section?: object|null, sub?: object|null, product?: object|null }} [opts]
 */
export function buildCatalogBreadcrumbs({ section = null, sub = null, product = null } = {}) {
	const crumbs = [
		{ label: 'Главная', href: '/' },
		{ label: 'Каталог', href: '/catalog/' },
	];

	if (section) {
		crumbs.push({ label: section.title, href: catalogPath(section.slug) });
	}

	if (section && sub) {
		crumbs.push({ label: sub.title, href: catalogPath(section.slug, sub.slug) });
	}

	if (product && section) {
		crumbs.push({
			label: getProductTitle(product),
			href: catalogPath(section.slug, sub?.slug || null, product.slug),
		});
	}

	return crumbs;
}

/**
 * @param {Array<{ label: string, href?: string | null }>} crumbs
 */
export function buildBreadcrumbListSchema(crumbs, _origin = SITE_ORIGIN) {
	const itemListElement = crumbs.map((crumb, index) => {
		const item = {
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.label,
		};
		if (crumb.href) {
			item.item = siteAbsoluteUrl(crumb.href);
		}
		return item;
	});

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement,
	};
}

function buildSeller() {
	return organizationRef();
}

function buildProductOffer(product, url) {
	const numericPrice = getProductPrice(product);
	const isOnRequest = product.price === 'request' || numericPrice == null;

	if (isOnRequest) {
		return {
			'@type': 'Offer',
			url,
			priceCurrency: 'BYN',
			availability: 'https://schema.org/PreOrder',
			description: 'Цена по запросу',
			itemCondition: 'https://schema.org/NewCondition',
			seller: buildSeller(),
		};
	}

	const price = String(numericPrice);
	const hasRange = product.priceMax != null && product.priceMax !== '';
	const isFromPrice = Boolean(product.priceFrom) || hasRange;

	if (isFromPrice) {
		const offer = {
			'@type': 'AggregateOffer',
			url,
			priceCurrency: 'BYN',
			lowPrice: price,
			availability: 'https://schema.org/InStock',
			offerCount: 1,
			itemCondition: 'https://schema.org/NewCondition',
			seller: buildSeller(),
		};
		if (hasRange) {
			offer.highPrice = String(Number(product.priceMax));
		}
		return offer;
	}

	return {
		'@type': 'Offer',
		url,
		price,
		priceCurrency: 'BYN',
		availability: 'https://schema.org/InStock',
		itemCondition: 'https://schema.org/NewCondition',
		seller: buildSeller(),
	};
}

/**
 * JSON-LD Product для карточки товара.
 * @param {object} product
 * @param {object} section
 * @param {object|null} sub
 */
export function buildProductSchema(product, section, sub = null) {
	const name = getProductTitle(product);
	const description = getProductText(product);
	const imageUrl = siteAbsoluteUrl(`/${catalogImageSrc(product.image)}`);
	const url = catalogAbsoluteUrl(section.slug, sub?.slug || null, product.slug);
	const sku = String(product.id || product.slug || '');

	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		'@id': `${url}#product`,
		name,
		description,
		image: imageUrl,
		sku,
		brand: {
			'@type': 'Brand',
			name: BRAND_NAME,
		},
		category: sub?.title ? `${section.title} / ${sub.title}` : section.title,
		url,
		offers: buildProductOffer(product, url),
	};
}

export function getHomePageSchemas() {
	return [buildOrganizationSchema(), WEBSITE_SCHEMA];
}

export function getAboutPageSchemas() {
	return [buildOrganizationSchema()];
}

export function renderJsonLd(data) {
	const json = JSON.stringify(data, null, '\t').replace(/</g, '\\u003c');
	return `<script type="application/ld+json">\n${json}\n</script>`;
}

export function renderJsonLdBlocks(...schemas) {
	return schemas.filter(Boolean).map(renderJsonLd).join('\n');
}
