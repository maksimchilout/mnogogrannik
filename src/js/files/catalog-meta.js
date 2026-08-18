import {
	getProductPrice,
	getProductText,
	getProductTitle,
} from './catalog-utils.js';

export const META_BRAND = 'mnogogrannik.by';
const TITLE_MAX = 62;
const DESC_MIN = 140;
const DESC_MAX = 160;
const BRAND_SUFFIX = ` | ${META_BRAND}`;

/**
 * Человекочитаемые названия: listingTitle (~60 символов с брендом),
 * descNoun — начало description, singular — тип изделия в именительном.
 * Ключ: section.slug или section.slug/sub.slug
 *
 * @type {Record<string, { listingTitle: string, descNoun: string, singular: string, loft?: boolean }>}
 */
export const CATALOG_META_LABELS = {
	'loft-mebel': {
		listingTitle: 'Лофт-мебель на заказ в Минске | mnogogrannik.by',
		descNoun: 'Лофт-мебель',
		singular: 'Мебель лофт',
		loft: true,
	},
	'loft-mebel/stoly': {
		listingTitle: 'Столы лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Столы в стиле лофт',
		singular: 'Стол',
		loft: true,
	},
	'loft-mebel/stulya': {
		listingTitle: 'Стулья лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Стулья в стиле лофт',
		singular: 'Стул',
		loft: true,
	},
	'loft-mebel/divany': {
		listingTitle: 'Диваны в стиле лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Диваны в стиле лофт',
		singular: 'Диван',
		loft: true,
	},
	'loft-mebel/krovati': {
		listingTitle: 'Кровати лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Кровати в стиле лофт',
		singular: 'Кровать',
		loft: true,
	},
	'loft-mebel/kresla': {
		listingTitle: 'Кресла лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Кресла в стиле лофт',
		singular: 'Кресло',
		loft: true,
	},
	'loft-mebel/skameiki': {
		listingTitle: 'Банкетки лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Банкетки в стиле лофт',
		singular: 'Банкетка',
		loft: true,
	},
	'loft-mebel/stellazhi': {
		listingTitle: 'Стеллажи на заказ в Минске — купить | mnogogrannik.by',
		descNoun: 'Стеллажи',
		singular: 'Стеллаж',
		loft: true,
	},
	'loft-mebel/garderobnye': {
		listingTitle: 'Гардеробные лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Гардеробные в стиле лофт',
		singular: 'Гардеробная',
		loft: true,
	},
	'loft-mebel/polki': {
		listingTitle: 'Полки лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Полки в стиле лофт',
		singular: 'Полка',
		loft: true,
	},
	'loft-mebel/vinnye-bary': {
		listingTitle: 'Винные бары лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Винные шкафы и бары',
		singular: 'Винный шкаф',
		loft: true,
	},
	'loft-mebel/stoiki': {
		listingTitle: 'Стойки лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Стойки в стиле лофт',
		singular: 'Стойка',
		loft: true,
	},
	'sadovaya-mebel': {
		listingTitle: 'Садовая мебель на заказ в Минске | mnogogrannik.by',
		descNoun: 'Садовая мебель',
		singular: 'Садовая мебель',
	},
	'sadovaya-mebel/kacheli': {
		listingTitle: 'Садовые качели на заказ в Минске | mnogogrannik.by',
		descNoun: 'Садовые качели',
		singular: 'Качели',
	},
	'sadovaya-mebel/besedki': {
		listingTitle: 'Беседки на заказ в Минске — цены | mnogogrannik.by',
		descNoun: 'Беседки',
		singular: 'Беседка',
		loft: true,
	},
	'sadovaya-mebel/obed': {
		listingTitle: 'Обеденные зоны на заказ в Минске | mnogogrannik.by',
		descNoun: 'Садовые обеденные зоны',
		singular: 'Обеденная зона',
	},
	'sadovaya-mebel/lavki': {
		listingTitle: 'Садовые лавки на заказ в Минске | mnogogrannik.by',
		descNoun: 'Садовые лавки и скамейки',
		singular: 'Лавка',
	},
	'navesy-dlya-mashiny': {
		listingTitle: 'Навесы для авто на заказ в Минске | mnogogrannik.by',
		descNoun: 'Навесы для автомобиля',
		singular: 'Навес',
		loft: true,
	},
	'kozyrek-loft': {
		listingTitle: 'Козырьки лофт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Козырьки в стиле лофт',
		singular: 'Козырёк',
		loft: true,
	},
	'mangal-zony': {
		listingTitle: 'Мангалы на заказ в Минске — купить | mnogogrannik.by',
		descNoun: 'Мангалы и костровые зоны',
		singular: 'Мангал',
	},
	'mangal-zony/mangaly': {
		listingTitle: 'Мангалы на заказ в Минске — купить | mnogogrannik.by',
		descNoun: 'Мангалы',
		singular: 'Мангал',
	},
	'mangal-zony/mangal-zony': {
		listingTitle: 'Мангальные зоны на заказ в Минске | mnogogrannik.by',
		descNoun: 'Мангальные зоны',
		singular: 'Мангальная зона',
	},
	'mangal-zony/kostrovye': {
		listingTitle: 'Костровые чаши на заказ в Минске | mnogogrannik.by',
		descNoun: 'Костровые чаши',
		singular: 'Костровая чаша',
	},
	'mangal-zony/drovnicy': {
		listingTitle: 'Дровницы на заказ в Минске — купить | mnogogrannik.by',
		descNoun: 'Дровницы',
		singular: 'Дровница',
	},
	lestnicy: {
		listingTitle: 'Лестницы на заказ в Минске | mnogogrannik.by',
		descNoun: 'Лестницы',
		singular: 'Лестница',
	},
	'lestnicy/marshevye': {
		listingTitle: 'Маршевые лестницы на заказ в Минске | mnogogrannik.by',
		descNoun: 'Маршевые лестницы',
		singular: 'Маршевая лестница',
	},
	'lestnicy/vintovye': {
		listingTitle: 'Винтовые лестницы на заказ в Минске | mnogogrannik.by',
		descNoun: 'Винтовые лестницы',
		singular: 'Винтовая лестница',
	},
	'lestnicy/karkas': {
		listingTitle: 'Лестницы на каркасе на заказ в Минске | mnogogrannik.by',
		descNoun: 'Лестницы на металлокаркасе',
		singular: 'Лестница',
	},
	'lestnicy/perila': {
		listingTitle: 'Перила на заказ в Минске — купить | mnogogrannik.by',
		descNoun: 'Перила и ограждения',
		singular: 'Перила',
	},
	'vorota-i-zabory': {
		listingTitle: 'Ворота и заборы на заказ в Минске | mnogogrannik.by',
		descNoun: 'Ворота и заборы',
		singular: 'Изделие',
	},
	'vorota-i-zabory/vorota': {
		listingTitle: 'Ворота на заказ в Минске — купить | mnogogrannik.by',
		descNoun: 'Металлические ворота',
		singular: 'Ворота',
	},
	'vorota-i-zabory/kalitki': {
		listingTitle: 'Калитки на заказ в Минске — купить | mnogogrannik.by',
		descNoun: 'Металлические калитки',
		singular: 'Калитка',
	},
	'vorota-i-zabory/zabory': {
		listingTitle: 'Заборы на заказ в Минске — цены | mnogogrannik.by',
		descNoun: 'Металлические заборы',
		singular: 'Забор',
	},
	'art-dekor': {
		listingTitle: 'Арт-декор на заказ в Минске | mnogogrannik.by',
		descNoun: 'Арт-декор',
		singular: 'Арт-объект',
	},
	'art-dekor/int-art': {
		listingTitle: 'Интерьерный арт-декор на заказ в Минске | mnogogrannik.by',
		descNoun: 'Интерьерный арт-декор',
		singular: 'Арт-декор',
	},
	'art-dekor/ul-art': {
		listingTitle: 'Уличный арт-декор на заказ в Минске | mnogogrannik.by',
		descNoun: 'Уличный арт-декор',
		singular: 'Уличный арт-объект',
	},
	'detskie-ploshchadki': {
		listingTitle: 'Детские площадки на заказ в Минске | mnogogrannik.by',
		descNoun: 'Детские площадки',
		singular: 'Детская площадка',
	},
	'detskie-ploshchadki/igrovye': {
		listingTitle: 'Игровые комплексы на заказ в Минске | mnogogrannik.by',
		descNoun: 'Игровые комплексы',
		singular: 'Игровой комплекс',
	},
	'detskie-ploshchadki/kacheli-det': {
		listingTitle: 'Детские качели на заказ в Минске | mnogogrannik.by',
		descNoun: 'Детские качели',
		singular: 'Детские качели',
	},
	'detskie-ploshchadki/sport': {
		listingTitle: 'Детский спорт на заказ в Минске | mnogogrannik.by',
		descNoun: 'Детские спортивные элементы',
		singular: 'Спортивный элемент',
	},
	'kletki-dlya-sobak': {
		listingTitle: 'Клетки для собак на заказ в Минске | mnogogrannik.by',
		descNoun: 'Клетки для собак',
		singular: 'Клетка',
	},
	'reshetki-na-okna': {
		listingTitle: 'Решётки на окна на заказ в Минске | mnogogrannik.by',
		descNoun: 'Решётки на окна',
		singular: 'Решётка',
	},
};

export function getMetaLabels(sectionSlug, subSlug = null) {
	const key = subSlug ? `${sectionSlug}/${subSlug}` : sectionSlug;
	return (
		CATALOG_META_LABELS[key] ||
		CATALOG_META_LABELS[sectionSlug] || {
			listingTitle: `Изделия на заказ в Минске | ${META_BRAND}`,
			descNoun: 'Изделия',
			singular: 'Изделие',
		}
	);
}

function stripLegacyBrand(value) {
	return String(value || '')
		.replace(/\s*[|—–-]\s*mnogogrannik\.(lab|by)\s*$/i, '')
		.replace(/mnogogrannik\.lab/gi, META_BRAND)
		.trim();
}

function withBrand(core) {
	const clean = stripLegacyBrand(core).replace(/\s+\|\s*$/, '');
	return `${clean}${BRAND_SUFFIX}`;
}

function clampDescription(text) {
	let value = String(text || '')
		.replace(/\s+/g, ' ')
		.replace(/mnogogrannik\.lab/gi, META_BRAND)
		.trim();
	if (value.length > DESC_MAX) {
		const cut = value.slice(0, DESC_MAX - 1);
		const sp = cut.lastIndexOf(' ');
		value = `${(sp > 90 ? cut.slice(0, sp) : cut).replace(/[.,;:—-]+$/g, '')}.`;
	}
	if (value.length < DESC_MIN) {
		const pad = ' Доставка по Минску и Слуцку. Смотрите цены.';
		if (value.length + pad.length <= DESC_MAX && value.length + pad.length >= DESC_MIN) {
			value += pad;
		} else {
			for (const extra of [' Купить в Минске.', ' Смотрите цены.']) {
				if (value.length >= DESC_MIN) break;
				if (value.length + extra.length <= DESC_MAX) value += extra;
			}
		}
	}
	return value;
}

function categoryDescription(descNoun) {
	const variants = [
		`${descNoun} на заказ по индивидуальным размерам. Изготовление в Минске и Слуцке, гарантия 5 лет, доставка от 3000 BYN бесплатно. Смотрите каталог и цены.`,
		`${descNoun} на заказ по вашим размерам. Изготовление в Минске и Слуцке, гарантия 5 лет, доставка от 3000 BYN бесплатно. Смотрите цены.`,
		`${descNoun} на заказ в Минске и Слуцке. Гарантия 5 лет, доставка от 3000 BYN бесплатно. Смотрите каталог и цены.`,
	];
	const fitting = variants.find((item) => item.length >= DESC_MIN && item.length <= DESC_MAX);
	return clampDescription(fitting || variants[variants.length - 1]);
}

function formatMetaPrice(value) {
	return String(Math.round(Number(value)));
}

function nameIncludesType(name, singular) {
	if (!name || !singular) return false;
	return name.toLowerCase().includes(singular.toLowerCase());
}

function pickTitle(candidates) {
	const unique = [...new Set(candidates.filter(Boolean).map((item) => stripLegacyBrand(item)))];
	const branded = unique.map((core) => withBrand(core));
	return branded.find((item) => item.length <= TITLE_MAX) || branded[branded.length - 1];
}

export function generateCatalogIndexMeta() {
	return {
		title: withBrand('Каталог изделий на заказ в Минске'),
		description: categoryDescription('Мебель и металлоконструкции'),
	};
}

/**
 * Meta для листинга категории или подкатегории.
 * @param {{ slug: string, title?: string, seoH1?: string, heroText?: string, seoDescription?: string }} section
 * @param {{ slug: string, title?: string, seoH1?: string, heroText?: string, seoDescription?: string } | null} [sub]
 */
export function generateCategoryMeta(section, sub = null) {
	const labels = getMetaLabels(section?.slug, sub?.slug || null);
	return {
		title: withBrand(stripLegacyBrand(labels.listingTitle).replace(BRAND_SUFFIX, '').trim()),
		description: categoryDescription(labels.descNoun),
		h1: sub?.seoH1 || section?.seoH1 || `${sub?.title || section?.title || labels.descNoun} на заказ`,
		heroText:
			sub?.heroText ||
			section?.heroText ||
			`${labels.descNoun} на заказ в Минске и Слуцке — проект под ваши размеры.`,
	};
}

/**
 * Meta для карточки товара.
 * @param {object} product
 * @param {{ slug: string } | null} [section]
 * @param {{ slug: string } | null} [sub]
 * @param {{ name?: string, text?: string, price?: number | null }} [fields]
 */
export function generateProductMeta(product, section = null, sub = null, fields = {}) {
	const labels = getMetaLabels(section?.slug, sub?.slug || null);
	const name = String(fields.name || getProductTitle(product) || labels.singular).trim();
	const text = String(fields.text || getProductText(product) || '').trim();
	let numericPrice = null;
	if (fields.price !== undefined) {
		numericPrice = fields.price == null || fields.price === '' ? null : Number(fields.price);
	} else if (product) {
		numericPrice = getProductPrice(product);
	}
	if (Number.isNaN(numericPrice)) numericPrice = null;
	const hasType = nameIncludesType(name, labels.singular);
	const priceLabel = numericPrice == null ? null : formatMetaPrice(numericPrice);

	const cores = [];
	if (priceLabel) {
		if (hasType) {
			cores.push(`${name} на заказ от ${priceLabel} BYN`);
			cores.push(`${name} купить в Минске за ${priceLabel} BYN`);
			if (labels.loft) cores.push(`${name} в стиле лофт от ${priceLabel} BYN`);
			cores.push(`${name} от ${priceLabel} BYN`);
		} else {
			cores.push(`${name} — ${labels.singular} на заказ от ${priceLabel} BYN`);
			cores.push(`${name} — ${labels.singular} от ${priceLabel} BYN`);
			cores.push(`${name} на заказ от ${priceLabel} BYN`);
		}
	} else if (hasType) {
		cores.push(`${name} на заказ по индивидуальному проекту`);
		cores.push(`${name} на заказ в Минске`);
	} else {
		cores.push(`${name} — ${labels.singular} на заказ по индивидуальному проекту`);
		cores.push(`${name} — ${labels.singular} на заказ в Минске`);
	}

	const tail = 'Изготовим на заказ в Минске и Слуцке под ваши размеры и материалы. Гарантия 5 лет.';
	let lead = text.replace(/\.+$/, '');
	if (!lead) {
		lead = `${labels.singular} на заказ`;
	}
	const maxLead = DESC_MAX - tail.length - 2;
	if (lead.length > maxLead) {
		const cut = lead.slice(0, Math.max(20, maxLead - 1));
		const sp = cut.lastIndexOf(' ');
		lead = (sp > 24 ? cut.slice(0, sp) : cut).replace(/[.,;:—-]+$/g, '');
	}

	return {
		title: pickTitle(cores),
		description: clampDescription(`${lead}. ${tail}`),
		h1: name,
		heroText: text,
	};
}
