export function catalogImageSrc(imagePath) {
	return imagePath
		.split('/')
		.map((part, index) => (index < 2 ? part : encodeURIComponent(part)))
		.join('/');
}

const SUB_DESCRIPTIONS = {
	stoly: 'Стол в стиле лофт',
	stulya: 'Стулья из металла',
	divany: 'Диван для интерьера',
	krovati: 'Кровать на каркасе',
	kresla: 'Кресло в стиле лофт',
	skameiki: 'Скамейка для зала',
	stellazhi: 'Металлический стеллаж',
	polki: 'Настенная полка',
	stoiki: 'Стойка для бара',
	kacheli: 'Уличные качели',
	besedki: 'Садовая беседка',
	obed: 'Обеденная зона',
	lavki: 'Садовая лавка',
	'ul-art': 'Уличный арт-объект',
	mangaly: 'Мангал из металла',
	'mangal-zony': 'Мангальная зона',
	kostrovye: 'Костровая чаша',
	marshevye: 'Маршевая лестница',
	vintovye: 'Винтовая лестница',
	karkas: 'Лестница на каркасе',
	perila: 'Перила и ограждение',
	vorota: 'Ворота на заказ',
	kalitki: 'Калитка из металла',
	zabory: 'Забор в стиле лофт',
	items: 'Авторский арт-декор',
	'metal-items': 'Металлоконструкция по индивидуальному проекту',
	kletki: 'Металлическая клетка для собак',
	igrovye: 'Игровой комплекс',
	'kacheli-det': 'Детские качели',
	sport: 'Спортивный элемент',
};

export function getProductTitle(product) {
	if (product.title) return product.title;

	const number = product.file.match(/\d+/)?.[0];
	return number ? `${product.subcategoryTitle} ${number}` : product.subcategoryTitle;
}

export function getProductText(product) {
	if (product.description) return product.description;
	return SUB_DESCRIPTIONS[product.subcategory] || product.subcategoryTitle;
}

// Ориентиры по рынку РБ (BYN): mangal.by, grills.by, hmloft.by, kovkam.by,
// metaldelo.by, stalkluch.by, tehnosad.by, meblavdom.by и др.
const PRICE_RANGES_BYN = {
	stoly: { min: 280, max: 1250 },
	stulya: { min: 180, max: 520 },
	divany: { min: 890, max: 2800 },
	krovati: { min: 650, max: 2200 },
	kresla: { min: 420, max: 1350 },
	skameiki: { min: 280, max: 850 },
	stellazhi: { min: 520, max: 1340 },
	polki: { min: 95, max: 380 },
	stoiki: { min: 380, max: 1100 },
	kacheli: { min: 820, max: 1550 },
	besedki: { min: 610, max: 4200 },
	obed: { min: 1450, max: 4800 },
	lavki: { min: 220, max: 720 },
	'ul-art': { min: 350, max: 1800 },
	mangaly: { min: 140, max: 1100 },
	'mangal-zony': { min: 980, max: 3400 },
	kostrovye: { min: 720, max: 2400 },
	marshevye: { min: 2800, max: 4500 },
	vintovye: { min: 3200, max: 7500 },
	karkas: { min: 2400, max: 4200 },
	perila: { min: 380, max: 2200 },
	vorota: { min: 580, max: 2400 },
	kalitki: { min: 250, max: 720 },
	zabory: { min: 320, max: 1800 },
	items: { min: 280, max: 2200 },
	igrovye: { min: 4200, max: 14500 },
	'kacheli-det': { min: 380, max: 1150 },
	sport: { min: 520, max: 2800 },
	'metal-items': { min: 450, max: 5500 },
	kletki: { min: 650, max: 1500 },
};

export function getProductPrice(product) {
	if (product.price === 'request') {
		return null;
	}

	if (product.price != null && product.price !== '') {
		return Number(product.price);
	}

	const range = PRICE_RANGES_BYN[product.subcategory] || { min: 400, max: 2500 };
	const seed = parseInt(product.id, 10) * 7919 + product.subcategory.length * 137;
	const spread = range.max - range.min;
	const price = range.min + (seed % (spread + 1));

	return Math.round(price / 5) * 5;
}

export function formatProductPrice(product) {
	if (product.price === 'request') {
		return 'По запросу';
	}

	const formatted = formatPrice(getProductPrice(product));

	if (product.priceFrom) {
		return `от ${formatted}`;
	}

	return formatted;
}

export function formatPrice(value) {
	if (!value) return '';
	const amount = typeof value === 'number'
		? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
		: String(value).replace(/\./g, ' ');
	return `${amount} BYN`;
}

export function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
