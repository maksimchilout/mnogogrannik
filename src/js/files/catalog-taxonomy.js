/** Канонические URL-slug’и каталога (path-based routing). */

export const SITE_ORIGIN = 'https://mnogogrannik.by';

/**
 * @typedef {{
 *   id: string,
 *   slug: string,
 *   title: string,
 *   seoTitle?: string,
 *   seoDescription?: string,
 *   seoH1?: string,
 *   heroText?: string,
 *   subs?: Array<{
 *     id: string,
 *     slug: string,
 *     title: string,
 *     seoTitle?: string,
 *     seoDescription?: string,
 *     seoH1?: string,
 *     heroText?: string,
 *   }>
 * }} CatalogSection
 */

/** @type {CatalogSection[]} */
export const CATALOG_SECTIONS = [
	{
		id: 'loft-furniture',
		slug: 'loft-mebel',
		title: 'Лофт-мебель',
		seoTitle: 'Мебель лофт на заказ в Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем мебель в стиле лофт по индивидуальным проектам в Минске и Беларуси. Столы, стеллажи, диваны, кровати из металла и дерева. Рассчитаем стоимость проекта.',
		seoH1: 'Мебель лофт на заказ',
		heroText:
			'Изготавливаем мебель в стиле лофт по индивидуальным проектам в Минске и Беларуси. Столы, стеллажи, диваны, кровати из металла и дерева. Рассчитаем стоимость проекта.',
		subs: [
			{
				id: 'stoly',
				slug: 'stoly',
				title: 'Столы',
				seoTitle: 'Столы лофт на заказ в Минске — металл и дерево | Mnogogrannik',
				seoDescription:
					'Столы в стиле лофт на заказ в Минске: обеденные, журнальные, барные. Металл и массив, размеры под ваш интерьер. Изготовление — Mnogogrannik.',
				seoH1: 'Столы лофт на заказ в Минске',
				heroText: 'Обеденные, журнальные и барные столы из металла и дерева — проектируем и изготавливаем под ваш интерьер.',
			},
			{
				id: 'stulya',
				slug: 'stulya',
				title: 'Стулья',
				seoTitle: 'Стулья и барные стулья лофт на заказ Минск | Mnogogrannik',
				seoDescription:
					'Стулья и барные стулья в стиле лофт на заказ в Минске. Металлический каркас, дерево, индивидуальная высота и обивка. Mnogogrannik.',
				seoH1: 'Стулья лофт на заказ в Минске',
			},
			{
				id: 'divany',
				slug: 'divany',
				title: 'Диваны',
				seoTitle: 'Диваны лофт на заказ в Минске — металл и мягкая часть | Mnogogrannik',
				seoDescription:
					'Диваны в стиле лофт на заказ в Минске: каркас из металла, мягкая часть под ваш интерьер. Индивидуальные размеры — Mnogogrannik.',
				seoH1: 'Диваны лофт на заказ в Минске',
			},
			{
				id: 'krovati',
				slug: 'krovati',
				title: 'Кровати',
				seoTitle: 'Кровати лофт на металлокаркасе на заказ Минск | Mnogogrannik',
				seoDescription:
					'Кровати в стиле лофт на заказ в Минске: металлокаркас, размеры под матрас и комнату. Прочное и аккуратное изготовление — Mnogogrannik.',
				seoH1: 'Кровати лофт на заказ в Минске',
			},
			{
				id: 'kresla',
				slug: 'kresla',
				title: 'Кресла',
				seoTitle: 'Кресла лофт на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Кресла в стиле лофт на заказ в Минске из металла и дерева. Комфорт и индустриальный характер под ваш интерьер — Mnogogrannik.',
				seoH1: 'Кресла лофт на заказ в Минске',
			},
			{
				id: 'skameiki',
				slug: 'skameiki',
				title: 'Банкетки',
				seoTitle: 'Банкетки лофт на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Банкетки и скамейки в стиле лофт на заказ в Минске. Металл, дерево, мягкая посадка — под прихожую, зал или зону ожидания.',
				seoH1: 'Банкетки лофт на заказ в Минске',
			},
			{
				id: 'stellazhi',
				slug: 'stellazhi',
				title: 'Стеллажи',
				seoTitle: 'Стеллажи и торговое оборудование на заказ Минск | Mnogogrannik',
				seoDescription:
					'Стеллажи и торговое оборудование на заказ в Минске для магазинов, шоурумов и кафе. Металл, дерево, проект под планировку — Mnogogrannik.',
				seoH1: 'Стеллажи на заказ в Минске',
				heroText: 'Стеллажи и торговое оборудование под фирменный стиль и планировку пространства.',
			},
			{
				id: 'garderobnye',
				slug: 'garderobnye',
				title: 'Гардеробные',
				seoTitle: 'Гардеробные лофт на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Гардеробные системы в стиле лофт на заказ в Минске. Металлический каркас, полки и штанги под вашу нишу — Mnogogrannik.',
				seoH1: 'Гардеробные лофт на заказ в Минске',
			},
			{
				id: 'polki',
				slug: 'polki',
				title: 'Полки',
				seoTitle: 'Полки лофт на заказ в Минске — металл и дерево | Mnogogrannik',
				seoDescription:
					'Настенные и консольные полки в стиле лофт на заказ в Минске. Металл, дерево, точные размеры под стену — Mnogogrannik.',
				seoH1: 'Полки лофт на заказ в Минске',
			},
			{
				id: 'vinnye-bary',
				slug: 'vinnye-bary',
				title: 'Винные шкафы / бары',
				seoTitle: 'Винные шкафы и бары лофт на заказ Минск | Mnogogrannik',
				seoDescription:
					'Винные шкафы и барные стойки в стиле лофт на заказ в Минске. Металл, дерево, хранение бутылок под ваш интерьер — Mnogogrannik.',
				seoH1: 'Винные шкафы и бары на заказ в Минске',
			},
			{
				id: 'stoiki',
				slug: 'stoiki',
				title: 'Стойки',
				seoTitle: 'Стойки и барные стойки лофт на заказ Минск | Mnogogrannik',
				seoDescription:
					'Стойки и барные конструкции в стиле лофт на заказ в Минске. Для дома, кафе и шоурума — индивидуальный проект Mnogogrannik.',
				seoH1: 'Стойки лофт на заказ в Минске',
			},
		],
	},
	{
		id: 'garden-furniture',
		slug: 'sadovaya-mebel',
		title: 'Садовая мебель',
		seoTitle: 'Садовая мебель на заказ в Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем садовую мебель по индивидуальным проектам в Минске и Беларуси. Качели, беседки, лавки и обеденные зоны из металла и дерева. Рассчитаем стоимость проекта.',
		seoH1: 'Садовая мебель на заказ',
		heroText:
			'Изготавливаем садовую мебель по индивидуальным проектам в Минске и Беларуси. Качели, беседки, лавки и обеденные зоны из металла и дерева. Рассчитаем стоимость проекта.',
		subs: [
			{
				id: 'kacheli',
				slug: 'kacheli',
				title: 'Качели',
				seoTitle: 'Садовые качели купить на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Садовые качели на заказ в Минске и Беларуси: металл, дерево, индивидуальные размеры. Изготовим под ваш участок — Mnogogrannik.',
				seoH1: 'Садовые качели на заказ в Минске',
				heroText: 'Садовые и уличные качели из металла и дерева — под размер площадки и стиль участка.',
			},
			{
				id: 'besedki',
				slug: 'besedki',
				title: 'Беседки',
				seoTitle: 'Беседки на заказ в Минске — металл и дерево | Mnogogrannik',
				seoDescription:
					'Беседки на заказ в Минске и Беларуси из металла и дерева. Проект под участок, кровлю и размеры — изготовление Mnogogrannik.',
				seoH1: 'Беседки на заказ в Минске',
			},
			{
				id: 'obed',
				slug: 'obed',
				title: 'Обеденные зоны',
				seoTitle: 'Садовые обеденные зоны на заказ Минск | Mnogogrannik',
				seoDescription:
					'Уличные обеденные зоны на заказ в Минске: стол и скамейки под количество гостей и размер площадки. Mnogogrannik.',
				seoH1: 'Садовые обеденные зоны на заказ',
			},
			{
				id: 'lavki',
				slug: 'lavki',
				title: 'Лавки / скамейки',
				seoTitle: 'Садовые лавки и скамейки на заказ Минск | Mnogogrannik',
				seoDescription:
					'Садовые лавки и скамейки на заказ в Минске из металла и дерева. Для двора, парка и входной зоны — Mnogogrannik.',
				seoH1: 'Садовые лавки на заказ в Минске',
			},
		],
	},
	{
		id: 'car-canopies',
		slug: 'navesy-dlya-mashiny',
		title: 'Навесы для машины',
		seoTitle: 'Навес для автомобиля на заказ в Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем навесы для автомобиля по индивидуальным проектам в Минске и Беларуси. Металлокаркас под размер участка и стиль дома. Рассчитаем стоимость проекта.',
		seoH1: 'Навес для автомобиля на заказ',
		heroText:
			'Изготавливаем навесы для автомобиля по индивидуальным проектам в Минске и Беларуси. Металлокаркас под размер участка и стиль дома. Рассчитаем стоимость проекта.',
	},
	{
		id: 'kozyrek-loft',
		slug: 'kozyrek-loft',
		title: 'Козырек в стиле лофт',
		seoTitle: 'Козырёк лофт на заказ в Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем козырьки в стиле лофт по индивидуальным проектам в Минске и Беларуси. Металл, размеры и дизайн под фасад. Рассчитаем стоимость проекта.',
		seoH1: 'Козырёк лофт на заказ',
		heroText:
			'Изготавливаем козырьки в стиле лофт по индивидуальным проектам в Минске и Беларуси. Металл, размеры и дизайн под фасад. Рассчитаем стоимость проекта.',
	},
	{
		id: 'mangal-zones',
		slug: 'mangal-zony',
		title: 'Мангалы и костровые зоны',
		seoTitle: 'Мангалы на заказ в Беларуси и Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем мангалы и мангальные зоны по индивидуальным проектам в Минске и Беларуси. Мангалы, костровые чаши, дровницы. Рассчитаем стоимость проекта.',
		seoH1: 'Мангалы на заказ',
		heroText:
			'Изготавливаем мангалы и мангальные зоны по индивидуальным проектам в Минске и Беларуси. Мангалы, костровые чаши, дровницы. Рассчитаем стоимость проекта.',
		subs: [
			{
				id: 'mangaly',
				slug: 'mangaly',
				title: 'Мангалы',
				seoTitle: 'Мангал на заказ в Минске и Беларуси | Mnogogrannik',
				seoDescription:
					'Мангалы на заказ в Минске и Беларуси из металла. Размеры под шампуры и решётку, доставка — изготовление Mnogogrannik.',
				seoH1: 'Мангалы на заказ в Минске',
				heroText: 'Металлические мангалы под ваши размеры — от компактных до усиленных моделей.',
			},
			{
				id: 'mangal-zony',
				slug: 'mangal-zony',
				title: 'Мангальные зоны',
				seoTitle: 'Мангальная зона на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Мангальные зоны на заказ в Минске: комплекс с рабочей поверхностью, дровницей и навесом. Проект под участок — Mnogogrannik.',
				seoH1: 'Мангальные зоны на заказ в Минске',
			},
			{
				id: 'kostrovye',
				slug: 'kostrovye',
				title: 'Костровые чаши',
				seoTitle: 'Костровая чаша на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Костровые чаши на заказ в Минске из металла. Для сада и зоны отдыха — безопасный очаг под ваш участок. Mnogogrannik.',
				seoH1: 'Костровые чаши на заказ в Минске',
			},
			{
				id: 'drovnicy',
				slug: 'drovnicy',
				title: 'Дровницы',
				seoTitle: 'Дровницы металлические на заказ Минск | Mnogogrannik',
				seoDescription:
					'Дровницы на заказ в Минске из металла. Хранение дров у мангала или дома — размеры под ваш объём. Mnogogrannik.',
				seoH1: 'Дровницы на заказ в Минске',
			},
		],
	},
	{
		id: 'stairs',
		slug: 'lestnicy',
		title: 'Лестницы',
		seoTitle: 'Лестницы на металлокаркасе на заказ в Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем лестницы на металлокаркасе по индивидуальным проектам в Минске и Беларуси. Маршевые, винтовые лестницы, перила и ограждения. Рассчитаем стоимость проекта.',
		seoH1: 'Лестницы на металлокаркасе на заказ',
		heroText:
			'Изготавливаем лестницы на металлокаркасе по индивидуальным проектам в Минске и Беларуси. Маршевые, винтовые лестницы, перила и ограждения. Рассчитаем стоимость проекта.',
		subs: [
			{
				id: 'marshevye',
				slug: 'marshevye',
				title: 'Маршевые лестницы',
				seoTitle: 'Маршевые лестницы на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Маршевые лестницы на заказ в Минске из металла и дерева. Прямые и с площадкой — под ваш проём и этажность. Mnogogrannik.',
				seoH1: 'Маршевые лестницы на заказ в Минске',
			},
			{
				id: 'vintovye',
				slug: 'vintovye',
				title: 'Винтовые лестницы',
				seoTitle: 'Винтовые лестницы на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Винтовые лестницы на заказ в Минске. Компактное решение из металла для небольших проёмов — Mnogogrannik.',
				seoH1: 'Винтовые лестницы на заказ в Минске',
			},
			{
				id: 'karkas',
				slug: 'karkas',
				title: 'Лестницы на каркасе',
				seoTitle: 'Лестницы на металлокаркасе на заказ Минск | Mnogogrannik',
				seoDescription:
					'Лестницы на металлокаркасе на заказ в Минске. Каркас под ступени из дерева или другого материала — Mnogogrannik.',
				seoH1: 'Лестницы на металлокаркасе в Минске',
				heroText: 'Металлокаркас лестницы под ваш проём: прочность, точная геометрия, монтаж под финишные ступени.',
			},
			{
				id: 'perila',
				slug: 'perila',
				title: 'Перила и ограждения',
				seoTitle: 'Перила и ограждения на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Перила и ограждения на заказ в Минске из металла. Для лестниц, балконов и террас — стиль лофт. Mnogogrannik.',
				seoH1: 'Перила и ограждения на заказ в Минске',
			},
		],
	},
	{
		id: 'gates-fences',
		slug: 'vorota-i-zabory',
		title: 'Ворота и заборы',
		seoTitle: 'Ворота и заборы на заказ в Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем ворота, калитки и заборы по индивидуальным проектам в Минске и Беларуси. Металл под архитектуру участка и дома. Рассчитаем стоимость проекта.',
		seoH1: 'Ворота и заборы на заказ',
		heroText:
			'Изготавливаем ворота, калитки и заборы по индивидуальным проектам в Минске и Беларуси. Металл под архитектуру участка и дома. Рассчитаем стоимость проекта.',
		subs: [
			{
				id: 'vorota',
				slug: 'vorota',
				title: 'Ворота',
				seoTitle: 'Ворота металлические на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Металлические ворота на заказ в Минске: распашные и по индивидуальным размерам. Под стиль забора и дома — Mnogogrannik.',
				seoH1: 'Ворота на заказ в Минске',
			},
			{
				id: 'kalitki',
				slug: 'kalitki',
				title: 'Калитки',
				seoTitle: 'Калитки металлические на заказ Минск | Mnogogrannik',
				seoDescription:
					'Калитки из металла на заказ в Минске. В комплекте с забором или отдельно — размеры и дизайн под участок. Mnogogrannik.',
				seoH1: 'Калитки на заказ в Минске',
			},
			{
				id: 'zabory',
				slug: 'zabory',
				title: 'Заборы',
				seoTitle: 'Заборы металлические на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Металлические заборы на заказ в Минске и Беларуси. Секции под длину участка и стиль дома — Mnogogrannik.',
				seoH1: 'Заборы на заказ в Минске',
			},
		],
	},
	{
		id: 'art-decor',
		slug: 'art-dekor',
		title: 'Арт-декор',
		seoTitle: 'Арт-декор на заказ в Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем арт-декор по индивидуальным проектам в Минске и Беларуси. Интерьерные и уличные объекты, металлические скульптуры. Рассчитаем стоимость проекта.',
		seoH1: 'Арт-декор на заказ',
		heroText:
			'Изготавливаем арт-декор по индивидуальным проектам в Минске и Беларуси. Интерьерные и уличные объекты, металлические скульптуры. Рассчитаем стоимость проекта.',
		subs: [
			{
				id: 'int-art',
				slug: 'int-art',
				title: 'Интерьерный арт-декор',
				seoTitle: 'Интерьерный арт-декор на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Интерьерный арт-декор на заказ в Минске из металла. Панно, скульптуры и объекты под ваш интерьер — Mnogogrannik.',
				seoH1: 'Интерьерный арт-декор на заказ',
			},
			{
				id: 'ul-art',
				slug: 'ul-art',
				title: 'Уличный арт-декор',
				seoTitle: 'Уличный арт-декор и скульптуры на заказ Минск | Mnogogrannik',
				seoDescription:
					'Уличный арт-декор на заказ в Минске: садовые скульптуры и объекты для ландшафта. Металл, индивидуальный проект — Mnogogrannik.',
				seoH1: 'Уличный арт-декор на заказ в Минске',
			},
		],
	},
	{
		id: 'playgrounds',
		slug: 'detskie-ploshchadki',
		title: 'Детские площадки',
		seoTitle: 'Детские площадки на заказ в Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем детские площадки по индивидуальным проектам в Минске и Беларуси. Игровые комплексы, качели, спортивные элементы из дерева и металла. Рассчитаем стоимость проекта.',
		seoH1: 'Детские площадки на заказ',
		heroText:
			'Изготавливаем детские площадки по индивидуальным проектам в Минске и Беларуси. Игровые комплексы, качели, спортивные элементы из дерева и металла. Рассчитаем стоимость проекта.',
		subs: [
			{
				id: 'igrovye',
				slug: 'igrovye',
				title: 'Игровые комплексы',
				seoTitle: 'Детские игровые комплексы на заказ Минск | Mnogogrannik',
				seoDescription:
					'Детские игровые комплексы на заказ в Минске из дерева и металла. Горки, лазалки, домики под ваш двор — Mnogogrannik.',
				seoH1: 'Игровые комплексы на заказ в Минске',
			},
			{
				id: 'kacheli-det',
				slug: 'kacheli-det',
				title: 'Качели для детей',
				seoTitle: 'Детские качели на заказ в Минске | Mnogogrannik',
				seoDescription:
					'Детские качели на заказ в Минске. Надёжный каркас, безопасная конструкция под возраст ребёнка — Mnogogrannik.',
				seoH1: 'Детские качели на заказ в Минске',
			},
			{
				id: 'sport',
				slug: 'sport',
				title: 'Спортивные элементы',
				seoTitle: 'Детские спортивные элементы на заказ Минск | Mnogogrannik',
				seoDescription:
					'Спортивные элементы для детей на заказ в Минске: турники, лазалки, комплексы во двор. Mnogogrannik.',
				seoH1: 'Спортивные элементы на заказ в Минске',
			},
		],
	},
	{
		id: 'dog-cages',
		slug: 'kletki-dlya-sobak',
		title: 'Клетки для собак',
		seoTitle: 'Клетки для собак на заказ в Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем клетки и вольеры для собак по индивидуальным проектам в Минске и Беларуси. Металл под размер питомца и место установки. Рассчитаем стоимость проекта.',
		seoH1: 'Клетки для собак на заказ',
		heroText:
			'Изготавливаем клетки и вольеры для собак по индивидуальным проектам в Минске и Беларуси. Металл под размер питомца и место установки. Рассчитаем стоимость проекта.',
	},
	{
		id: 'window-grilles',
		slug: 'reshetki-na-okna',
		title: 'Решётки на окна',
		seoTitle: 'Решётки на окна на заказ в Минске | Mnogogrannik',
		seoDescription:
			'Изготавливаем металлические решётки на окна по индивидуальным проектам в Минске и Беларуси. Безопасность и дизайн в стиле лофт. Рассчитаем стоимость проекта.',
		seoH1: 'Решётки на окна на заказ',
		heroText:
			'Изготавливаем металлические решётки на окна по индивидуальным проектам в Минске и Беларуси. Безопасность и дизайн в стиле лофт. Рассчитаем стоимость проекта.',
	},
];

export const DEFAULT_CATALOG_SEO = {
	title: 'Каталог изделий на заказ в Минске | Mnogogrannik',
	description:
		'Каталог Mnogogrannik: лофт-мебель, мангалы, лестницы, навесы, садовая мебель и металлоконструкции на заказ в Минске и Беларуси. Рассчитаем стоимость проекта.',
	seoH1: 'Каталог изделий на заказ',
	heroText:
		'Выберите раздел — изготовим проект под ваше пространство в Минске и по Беларуси.',
};


const TRANSLIT_MAP = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
	и: 'i', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
	с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
	ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function getSectionById(sectionId) {
	return CATALOG_SECTIONS.find((section) => section.id === sectionId) || null;
}

export function getSectionBySlug(sectionSlug) {
	return CATALOG_SECTIONS.find((section) => section.slug === sectionSlug) || null;
}

export function getSubById(section, subId) {
	if (!section?.subs || !subId) return null;
	return section.subs.find((sub) => sub.id === subId) || null;
}

export function getSubBySlug(section, subSlug) {
	if (!section?.subs || !subSlug) return null;
	return section.subs.find((sub) => sub.slug === subSlug) || null;
}

export function slugifyText(value) {
	return String(value || '')
		.toLowerCase()
		.split('')
		.map((char) => TRANSLIT_MAP[char] ?? char)
		.join('')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');
}

export function ensureUniqueSlug(baseSlug, usedSlugs) {
	let slug = baseSlug || 'item';
	if (!usedSlugs.has(slug)) {
		usedSlugs.add(slug);
		return slug;
	}
	let index = 2;
	while (usedSlugs.has(`${slug}-${index}`)) index += 1;
	const unique = `${slug}-${index}`;
	usedSlugs.add(unique);
	return unique;
}

export function buildProductSlug(product, usedSlugs = new Set()) {
	if (product.slug) {
		return ensureUniqueSlug(product.slug, usedSlugs);
	}
	const fromTitle = slugifyText(product.title);
	const base = fromTitle || slugifyText(product.subcategoryTitle) || `item-${product.id}`;
	return ensureUniqueSlug(base, usedSlugs);
}

export function catalogPath(sectionSlug, subSlug = null, productSlug = null) {
	const parts = ['/catalog'];
	if (sectionSlug) parts.push(sectionSlug);
	if (subSlug) parts.push(subSlug);
	if (productSlug) parts.push(productSlug);
	return `${parts.join('/')}/`;
}

export function catalogAbsoluteUrl(sectionSlug, subSlug = null, productSlug = null) {
	return `${SITE_ORIGIN}${catalogPath(sectionSlug, subSlug, productSlug)}`;
}

export function getProductPath(product) {
	const section = getSectionById(product.category);
	if (!section || !product.slug) return '/catalog/';
	const sub = getSubById(section, product.subcategory);
	if (section.subs?.length) {
		if (!sub) return catalogPath(section.slug);
		return catalogPath(section.slug, sub.slug, product.slug);
	}
	return catalogPath(section.slug, null, product.slug);
}

export function parseCatalogPathname(pathname = '') {
	const normalized = String(pathname || '').replace(/\.html?$/i, '');
	const match = normalized.match(/^\/catalog(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?\/?$/i);
	if (!match) {
		return { kind: null, section: null, sub: null, productSlug: null };
	}

	const [, sectionSlug, second, third] = match;
	if (!sectionSlug) {
		return { kind: 'index', section: null, sub: null, productSlug: null };
	}

	const section = getSectionBySlug(sectionSlug);
	if (!section) {
		return { kind: 'unknown', section: null, sub: null, productSlug: null };
	}

	if (!second) {
		return { kind: 'section', section, sub: null, productSlug: null };
	}

	if (section.subs?.length) {
		const sub = getSubBySlug(section, second);
		if (!sub) {
			return { kind: 'unknown', section, sub: null, productSlug: null };
		}
		if (!third) {
			return { kind: 'sub', section, sub, productSlug: null };
		}
		return { kind: 'product', section, sub, productSlug: third };
	}

	return { kind: 'product', section, sub: null, productSlug: second };
}

/** Normalize catalog path for equality checks (trailing slash ignored). */
export function normalizeCatalogPathname(pathname = '') {
	const value = String(pathname || '').replace(/\.html?$/i, '');
	if (!value || value === '/') return '/';
	return value.replace(/\/+$/, '') || '/';
}

/** Старый hash → path (для редиректов). */
export function hashToCatalogPath(hash) {
	const value = String(hash || '').replace(/^#/, '');
	if (!value) return null;

	const parts = value.split('/').filter(Boolean);
	const section = getSectionById(parts[0]);
	if (!section) return null;

	const sub = getSubById(section, parts[1]);
	const productToken = parts.find((part) => /^c\d+$/i.test(part));
	const basePath = sub
		? catalogPath(section.slug, sub.slug)
		: catalogPath(section.slug);

	if (productToken) {
		return `${basePath}?pid=${encodeURIComponent(productToken.toLowerCase())}`;
	}

	return basePath;
}

export function resolveSeo(section = null, sub = null, product = null) {
	if (product) {
		const sectionTitle = section?.title || product.categoryTitle || '';
		const subTitle = sub?.title || product.subcategoryTitle || '';
		const title = `${product.title} на заказ в Минске — ${subTitle || sectionTitle} | Mnogogrannik`;
		const description =
			product.description
				? `${product.description} Изготовление на заказ в Минске — Mnogogrannik.`
				: `${product.title}: изготовление на заказ в Минске и Беларуси. Рассчитаем стоимость проекта.`;
		return {
			title,
			description,
			h1: product.title,
			heroText: product.description || '',
		};
	}
	if (sub && section) {
		return {
			title:
				sub.seoTitle ||
				`${sub.title} на заказ в Минске — ${section.title} | Mnogogrannik`,
			description:
				sub.seoDescription ||
				`Изготавливаем ${sub.title.toLowerCase()} по индивидуальным проектам в Минске и Беларуси. Раздел «${section.title}». Рассчитаем стоимость проекта.`,
			h1: sub.seoH1 || `${sub.title} на заказ`,
			heroText:
				sub.heroText ||
				sub.seoDescription ||
				`Изготавливаем ${sub.title.toLowerCase()} по индивидуальным проектам в Минске и Беларуси. Рассчитаем стоимость проекта.`,
		};
	}
	if (section) {
		return {
			title: section.seoTitle || `${section.title} на заказ в Минске | Mnogogrannik`,
			description:
				section.seoDescription ||
				`Изготавливаем ${section.title.toLowerCase()} по индивидуальным проектам в Минске и Беларуси. Рассчитаем стоимость проекта.`,
			h1: section.seoH1 || `${section.title} на заказ`,
			heroText:
				section.heroText ||
				section.seoDescription ||
				`${section.title}: изделия на заказ под ваше пространство.`,
		};
	}
	return {
		title: DEFAULT_CATALOG_SEO.title,
		description: DEFAULT_CATALOG_SEO.description,
		h1: DEFAULT_CATALOG_SEO.seoH1,
		heroText: DEFAULT_CATALOG_SEO.heroText,
	};
}
