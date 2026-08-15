import { SITE_ORIGIN, catalogAbsoluteUrl } from './catalog-taxonomy.js';
import {
	catalogImageSrc,
	getProductPrice,
	getProductText,
	getProductTitle,
} from './catalog-utils.js';

export const BRAND_NAME = 'MNOGOGRANNIK';
export const BRAND_ALT = ['mnogogrannik.lab', 'Mnogogrannik'];

export const ORGANIZATION_SCHEMA = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	'@id': `${SITE_ORIGIN}/#organization`,
	name: BRAND_NAME,
	alternateName: BRAND_ALT,
	url: `${SITE_ORIGIN}/`,
	logo: `${SITE_ORIGIN}/img/logo.jpg`,
	image: `${SITE_ORIGIN}/img/about/about-hero.jpg`,
	telephone: ['+375445860101', '+375445677177'],
	taxID: '691960601',
	sameAs: [
		'https://www.instagram.com/mnogogrannik.lab',
		'https://t.me/mnogogrannikLAB',
	],
	description:
		'Мастерская штучных изделий: лофт-мебель, мангальные зоны, детские площадки, арт-декор, лестницы и металлоконструкции на заказ в Минске и Беларуси.',
};

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

function buildLocalBusiness({ id, name, streetAddress, addressLocality, telephone }) {
	return {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		'@id': id,
		name,
		url: `${SITE_ORIGIN}/`,
		telephone,
		image: `${SITE_ORIGIN}/img/about/about-hero.jpg`,
		priceRange: '$$',
		currenciesAccepted: 'BYN',
		paymentAccepted: 'Cash, Credit Card, Bank Transfer',
		taxID: '691960601',
		parentOrganization: { '@id': `${SITE_ORIGIN}/#organization` },
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
	};
}

export const LOCAL_BUSINESS_SCHEMAS = [
	buildLocalBusiness({
		id: `${SITE_ORIGIN}/#localbusiness-minsk`,
		name: 'MNOGOGRANNIK — Минск',
		streetAddress: 'ул. Бабушкина, 4А',
		addressLocality: 'Минск',
		telephone: '+375445860101',
	}),
	buildLocalBusiness({
		id: `${SITE_ORIGIN}/#localbusiness-slutsk`,
		name: 'MNOGOGRANNIK — Слуцк',
		streetAddress: 'ул. Гагарина, 34а',
		addressLocality: 'Слуцк',
		telephone: '+375445677177',
	}),
];

export const WEBSITE_SCHEMA = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	'@id': `${SITE_ORIGIN}/#website`,
	name: 'mnogogrannik.lab',
	url: `${SITE_ORIGIN}/`,
	publisher: { '@id': `${SITE_ORIGIN}/#organization` },
	potentialAction: {
		'@type': 'SearchAction',
		target: `${SITE_ORIGIN}/catalog/?q={search_term_string}`,
		'query-input': 'required name=search_term_string',
	},
};

/** @deprecated kept for any legacy imports */
export const LOCAL_BUSINESS_SCHEMA = LOCAL_BUSINESS_SCHEMAS[0];

/**
 * @param {Array<{ label: string, href?: string | null }>} crumbs
 * @param {string} [origin]
 */
export function buildBreadcrumbListSchema(crumbs, origin = SITE_ORIGIN) {
	const itemListElement = crumbs.map((crumb, index) => {
		const item = {
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.label,
		};
		if (crumb.href) {
			item.item = crumb.href.startsWith('http')
				? crumb.href
				: `${origin}${crumb.href.startsWith('/') ? '' : '/'}${crumb.href}`;
		}
		return item;
	});

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement,
	};
}

/**
 * @param {object} product
 * @param {object} section
 * @param {object|null} sub
 */
export function buildProductSchema(product, section, sub = null) {
	const name = getProductTitle(product);
	const description = getProductText(product);
	const imagePath = catalogImageSrc(product.image);
	const imageUrl = `${SITE_ORIGIN}/${imagePath.replace(/^\//, '')}`;
	const url = catalogAbsoluteUrl(
		section.slug,
		sub?.slug || null,
		product.slug
	);
	const numericPrice = getProductPrice(product);
	const sku = String(product.id || product.slug || '');

	const offer = {
		'@type': 'Offer',
		url,
		priceCurrency: 'BYN',
		availability: 'https://schema.org/InStock',
		itemCondition: 'https://schema.org/NewCondition',
		seller: {
			'@type': 'Organization',
			'@id': `${SITE_ORIGIN}/#organization`,
			name: BRAND_NAME,
		},
	};

	if (product.price === 'request' || numericPrice == null) {
		offer.availability = 'https://schema.org/PreOrder';
	} else {
		offer.price = String(numericPrice);
	}

	const productDescription =
		product.priceFrom && numericPrice != null
			? `${description}. Стартовая цена от ${numericPrice} BYN.`
			: description;

	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		'@id': `${url}#product`,
		name,
		description: productDescription,
		image: imageUrl,
		sku,
		brand: {
			'@type': 'Brand',
			name: BRAND_NAME,
		},
		category: sub?.title
			? `${section.title} / ${sub.title}`
			: section.title,
		url,
		offers: offer,
	};
}

export function getHomePageSchemas() {
	return [ORGANIZATION_SCHEMA, ...LOCAL_BUSINESS_SCHEMAS, WEBSITE_SCHEMA];
}

export function renderJsonLd(data) {
	const json = JSON.stringify(data, null, '\t').replace(/</g, '\\u003c');
	return `<script type="application/ld+json">\n${json}\n</script>`;
}

export function renderJsonLdBlocks(...schemas) {
	return schemas.filter(Boolean).map(renderJsonLd).join('\n');
}
