import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	buildBreadcrumbListSchema,
	buildProductSchema,
	renderJsonLdBlocks,
} from '../../src/js/files/catalog-schema.js';
import {
	CATALOG_SECTIONS,
	SITE_ORIGIN,
	catalogAbsoluteUrl,
	catalogPath,
	getProductPath,
	getSectionById,
	getSubById,
	resolveSeo,
} from '../../src/js/files/catalog-taxonomy.js';
import {
	catalogImageSrc,
	escapeHtml,
	formatProductPrice,
	getProductImageAlt,
	getProductText,
	getProductTitle,
} from '../../src/js/files/catalog-utils.js';
import { SHOWCASE_MODE } from '../../src/js/files/shop-mode.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const srcDir = path.join(rootDir, 'src');
const buildDir = path.join(rootDir, 'dist');
const partialsDir = path.join(srcDir, 'html');

const OG_IMAGE = `${SITE_ORIGIN}/img/about/about-hero.jpg`;

function formatSitemapDate(date = new Date()) {
	return date.toISOString().slice(0, 10);
}

function ensureDir(dirPath) {
	fs.mkdirSync(dirPath, { recursive: true });
}

function writeHtml(filePath, html) {
	ensureDir(path.dirname(filePath));
	fs.writeFileSync(filePath, html, 'utf8');
}

function readPartial(relativePath) {
	return fs.readFileSync(path.join(partialsDir, relativePath), 'utf8');
}

function applyIncludeParams(template, params = {}) {
	return template.replace(/@@(\w+)/g, (match, key) =>
		Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
	);
}

function resolveIncludes(template, params = {}) {
	let result = template;
	const includeRe = /@@include\(\s*['"]([^'"]+)['"]\s*,\s*(\{[\s\S]*?\})\s*\)/g;

	result = result.replace(includeRe, (_, includePath, paramsLiteral) => {
		const normalized = includePath.replace(/^html\//, '');
		let includeParams = {};
		try {
			includeParams = Function(`"use strict"; return (${paramsLiteral});`)();
		} catch {
			includeParams = {};
		}
		const nested = resolveIncludes(readPartial(normalized), includeParams);
		return applyIncludeParams(nested, includeParams);
	});

	return applyIncludeParams(result, params);
}

function toRootRelativeHtml(html) {
	return html
		.replace(/href="\.\//g, 'href="/')
		.replace(/href="catalog\.html/g, 'href="/catalog/')
		.replace(/href="about\.html"/g, 'href="/about.html"')
		.replace(/href="policy\.html"/g, 'href="/policy.html"')
		.replace(/href="checkout\.html"/g, 'href="/checkout.html"')
		.replace(/src="@img\//g, 'src="/img/')
		.replace(/src="img\//g, 'src="/img/')
		.replace(/href="css\//g, 'href="/css/')
		.replace(/src="js\//g, 'src="/js/')
		.replace(/href="js\//g, 'href="/js/');
}

function renderHead({ title, description, canonical, robots = 'index, follow' }) {
	const head = resolveIncludes(
		`@@include('html/_head.htm',{
"title":${JSON.stringify(title)},
"description":${JSON.stringify(description)},
"canonical":${JSON.stringify(canonical)},
"ogImage":${JSON.stringify(OG_IMAGE)},
"robots":${JSON.stringify(robots)}
})`,
		{}
	);
	return toRootRelativeHtml(head);
}

function renderHeader() {
	return toRootRelativeHtml(resolveIncludes(`@@include('html/_header.htm',{})`, {}));
}

function renderFooter() {
	return toRootRelativeHtml(resolveIncludes(`@@include('html/_footer.htm',{})`, {}));
}

function renderJs() {
	return toRootRelativeHtml(resolveIncludes(`@@include('html/_js.htm',{})`, {}));
}

function renderProductCard(product) {
	const title = getProductTitle(product);
	const text = getProductText(product);
	const price = formatProductPrice(product);
	const imageSrc = `/${catalogImageSrc(product.image)}`;
	const imageAlt = getProductImageAlt(product);
	const href = getProductPath(product);
	const cta = SHOWCASE_MODE ? 'Подробнее' : 'В корзину';

	return `
		<article data-pid="c${escapeHtml(product.id)}" class="products__item item-product" data-catalog-product>
			<a href="${href}" class="item-product__image -ibg">
				<img src="${imageSrc}" alt="${escapeHtml(imageAlt)}" loading="lazy">
			</a>
			<div class="item-product__body">
				<div class="item-product__content">
					<h3 class="item-product__title"><a href="${href}">${escapeHtml(title)}</a></h3>
					<div class="item-product__text">${escapeHtml(text)}</div>
				</div>
				<div class="item-product__prices">
					<div class="item-product__price-group">
						<div class="item-product__price">${escapeHtml(price)}</div>
					</div>
					<a href="${href}" class="actions-product__button btn btn_white">${cta}</a>
				</div>
			</div>
		</article>
	`;
}

function renderSidebar({ activeSectionId = null, activeSubId = null } = {}) {
	const items = CATALOG_SECTIONS.map((section) => {
		const hasSubs = Boolean(section.subs?.length);
		const isOpen = section.id === activeSectionId;
		const noSubsClass = hasSubs ? '' : ' catalog-sidebar__item_no-subs';
		const openClass = isOpen ? ' catalog-sidebar__item_open' : '';
		const activeToggle = isOpen ? ' _active' : '';
		const sectionHref = catalogPath(section.slug);

		let subsHtml = '';
		if (hasSubs) {
			const links = section.subs
				.map((sub) => {
					const active = section.id === activeSectionId && sub.id === activeSubId ? ' _active' : '';
					return `<li><a href="${catalogPath(section.slug, sub.slug)}" data-catalog-sub="${sub.id}" class="catalog-sidebar__sub-link _icon-arrow-link${active}">${escapeHtml(sub.title)}</a></li>`;
				})
				.join('\n');
			subsHtml = `
				<div class="catalog-sidebar__sub-wrap">
					<ul class="catalog-sidebar__sub-list">
						${links}
					</ul>
				</div>`;
		}

		return `
			<li class="catalog-sidebar__item${noSubsClass}${openClass}" data-catalog-section="${section.id}">
				<a href="${sectionHref}" data-catalog-toggle class="catalog-sidebar__toggle${activeToggle}">
					<span class="catalog-sidebar__toggle-text">${escapeHtml(section.title)}</span>
					${hasSubs ? '<span class="catalog-sidebar__toggle-arrow _icon-arrow-down" aria-hidden="true"></span>' : ''}
				</a>
				${subsHtml}
			</li>`;
	}).join('\n');

	return `
		<aside class="catalog__sidebar catalog-sidebar">
			<div class="catalog-sidebar__inner">
				<h2 class="catalog-sidebar__title">Разделы</h2>
				<ul class="catalog-sidebar__list">
					${items}
				</ul>
			</div>
		</aside>`;
}

function renderBreadcrumbs(items) {
	const parts = items
		.map((item, index) => {
			const isLast = index === items.length - 1;
			if (isLast || !item.href) {
				return `<span class="breadcrumbs__current">${escapeHtml(item.label)}</span>`;
			}
			return `<a href="${item.href}" class="breadcrumbs__link">${escapeHtml(item.label)}</a><span class="breadcrumbs__separator">/</span>`;
		})
		.join('\n');

	return `
		<nav class="catalog-hero__breadcrumbs breadcrumbs" aria-label="Навигация">
			${parts}
		</nav>`;
}

function renderCta() {
	return `
		<section class="page__catalog-cta catalog-cta">
			<div class="catalog-cta__container _container">
				<div class="catalog-cta__body">
					<h2 class="catalog-cta__title">Не нашли желаемое изделие?</h2>
					<p class="catalog-cta__text">Расскажите о задаче — мы спроектируем и изготовим изделие индивидуально под ваше пространство.</p>
					<form class="catalog-cta__form" data-telegram-order="custom" data-popup-message="#formMessage" action="#" method="post" enctype="multipart/form-data">
						<div class="catalog-cta__grid">
							<label class="catalog-cta__field catalog-cta__field_text">
								<textarea class="catalog-cta__textarea input" name="message" rows="5" placeholder="Опишите желаемое изделие: размеры, материалы, назначение" aria-label="Опишите желаемое изделие" data-required data-error="Опишите задачу" required></textarea>
							</label>
							<div class="catalog-cta__right">
								<div class="catalog-cta__previews _empty" data-catalog-cta-previews>
									<span class="catalog-cta__previews-placeholder">Добавленные фото появятся здесь</span>
								</div>
								<div class="catalog-cta__file-wrap">
									<input class="catalog-cta__file-input" type="file" name="files[]" id="catalog-cta-file" accept="image/*" multiple data-catalog-cta-file>
									<label class="catalog-cta__file-btn" for="catalog-cta-file">Добавить фото</label>
								</div>
							</div>
						</div>
						<div class="catalog-cta__footer">
							<button type="submit" class="catalog-cta__submit btn">Отправить заявку</button>
						</div>
					</form>
				</div>
			</div>
		</section>`;
}

function renderListingPage({
	seo,
	canonical,
	breadcrumbs,
	heroTitle,
	heroText,
	contentTitle,
	contentSubtitle,
	products,
	activeSectionId,
	activeSubId,
	pageKind,
}) {
	const gridHtml = products.length
		? products.map(renderProductCard).join('\n')
		: '';
	const emptyHidden = products.length ? ' hidden' : '';
	const emptyText = 'В этой подкатегории пока нет фотографий';
	const subtitleHtml = contentSubtitle
		? `<p class="catalog-content__subtitle" data-catalog-subtitle>${escapeHtml(contentSubtitle)}</p>`
		: `<p class="catalog-content__subtitle" data-catalog-subtitle hidden></p>`;
	const schemaHtml = renderJsonLdBlocks(buildBreadcrumbListSchema(breadcrumbs));

	return `<!DOCTYPE html>
<html lang="ru">
${renderHead({ title: seo.title, description: seo.description, canonical })}
${schemaHtml}
<body>
	<div class="wrapper">
		${renderHeader()}
		<main class="page" data-catalog-page="${pageKind}" data-catalog-section="${activeSectionId || ''}" data-catalog-sub="${activeSubId || ''}">
			<section class="page__catalog-hero catalog-hero">
				<div class="catalog-hero__container _container">
					${renderBreadcrumbs(breadcrumbs)}
					<h1 class="catalog-hero__title _title">${escapeHtml(heroTitle)}</h1>
					<p class="catalog-hero__text">${escapeHtml(heroText)}</p>
				</div>
			</section>
			<section class="page__catalog catalog">
				<div class="catalog__container _container">
					${renderSidebar({ activeSectionId, activeSubId })}
					<div class="catalog__content catalog-content">
						<div class="catalog-content__head">
							<h2 class="catalog-content__title" data-catalog-title>${escapeHtml(contentTitle)}</h2>
							${subtitleHtml}
						</div>
						<div class="catalog-content__grid products__items" data-catalog-grid data-catalog-ssr="true">
							${gridHtml}
						</div>
						<p class="catalog-content__empty" data-catalog-empty${emptyHidden}>${emptyText}</p>
					</div>
				</div>
			</section>
			${renderCta()}
		</main>
		${renderFooter()}
	</div>
	${renderJs()}
</body>
</html>`;
}

function renderIndexPage() {
	const seo = resolveSeo();
	const canonical = `${SITE_ORIGIN}/catalog/`;
	const cards = CATALOG_SECTIONS.map((section) => {
		const href = catalogPath(section.slug);
		return `
			<a href="${href}" class="catalog-index__card">
				<span class="catalog-index__card-title">${escapeHtml(section.title)}</span>
				<span class="catalog-index__card-link">Смотреть</span>
			</a>`;
	}).join('\n');

	const breadcrumbs = [
		{ label: 'Главная', href: '/' },
		{ label: 'Каталог', href: '/catalog/' },
	];
	const schemaHtml = renderJsonLdBlocks(buildBreadcrumbListSchema(breadcrumbs));

	return `<!DOCTYPE html>
<html lang="ru">
${renderHead({ title: seo.title, description: seo.description, canonical })}
${schemaHtml}
<body>
	<div class="wrapper">
		${renderHeader()}
		<main class="page" data-catalog-page="index">
			<section class="page__catalog-hero catalog-hero">
				<div class="catalog-hero__container _container">
					${renderBreadcrumbs(breadcrumbs)}
					<h1 class="catalog-hero__title _title">${escapeHtml(seo.h1)}</h1>
					<p class="catalog-hero__text">${escapeHtml(seo.heroText)}</p>
				</div>
			</section>
			<section class="page__catalog catalog">
				<div class="catalog__container _container">
					${renderSidebar()}
					<div class="catalog__content catalog-content">
						<div class="catalog-content__head">
							<h2 class="catalog-content__title">Разделы каталога</h2>
							<p class="catalog-content__subtitle">Выберите категорию</p>
						</div>
						<div class="catalog-index" data-catalog-index>
							${cards}
						</div>
						<div class="catalog-content__grid products__items" data-catalog-grid data-catalog-ssr="true" hidden></div>
						<p class="catalog-content__empty" data-catalog-empty hidden>По вашему запросу ничего не найдено</p>
					</div>
				</div>
			</section>
			${renderCta()}
		</main>
		${renderFooter()}
	</div>
	${renderJs()}
</body>
</html>`;
}

function renderProductPage(product, section, sub) {
	const seo = resolveSeo(section, sub, product);
	const canonical = catalogAbsoluteUrl(
		section.slug,
		sub?.slug || null,
		product.slug
	);
	const title = getProductTitle(product);
	const text = getProductText(product);
	const price = formatProductPrice(product);
	const imageSrc = `/${catalogImageSrc(product.image)}`;
	const imageAlt = getProductImageAlt(product);
	const absoluteImage = `${SITE_ORIGIN}${imageSrc}`;

	const crumbs = [
		{ label: 'Главная', href: '/' },
		{ label: 'Каталог', href: '/catalog/' },
		{ label: section.title, href: catalogPath(section.slug) },
	];
	if (sub) {
		crumbs.push({ label: sub.title, href: catalogPath(section.slug, sub.slug) });
	}
	crumbs.push({ label: title, href: catalogPath(section.slug, sub?.slug || null, product.slug) });

	const backHref = sub
		? catalogPath(section.slug, sub.slug)
		: catalogPath(section.slug);

	const schemaHtml = renderJsonLdBlocks(
		buildBreadcrumbListSchema(crumbs),
		buildProductSchema(product, section, sub)
	);

	return `<!DOCTYPE html>
<html lang="ru">
${renderHead({ title: seo.title, description: seo.description, canonical })}
${schemaHtml}
<body>
	<div class="wrapper">
		${renderHeader()}
		<main class="page" data-catalog-page="product" data-product-id="${escapeHtml(product.id)}" data-product-slug="${escapeHtml(product.slug)}">
			<section class="page__catalog-hero catalog-hero catalog-hero_compact">
				<div class="catalog-hero__container _container">
					${renderBreadcrumbs(crumbs)}
				</div>
			</section>
			<section class="page__catalog-product catalog-product">
				<div class="catalog-product__container _container">
					<div class="catalog-product__layout">
						<div class="catalog-product__media">
							<img src="${imageSrc}" alt="${escapeHtml(imageAlt)}" width="800" height="800">
						</div>
						<div class="catalog-product__body">
							<p class="catalog-product__eyebrow">${escapeHtml(sub?.title || section.title)} · на заказ в Минске</p>
							<h1 class="catalog-product__title">${escapeHtml(title)}</h1>
							<p class="catalog-product__text">${escapeHtml(text)}</p>
							<div class="catalog-product__price">${escapeHtml(price)}</div>
							<div class="catalog-product__form-wrap">
								<h2 class="catalog-product__form-title">Администратор свяжется с вами для уточнения размеров, цвета, материалов изделия, а так же окончательной стоимости</h2>
								<form class="catalog-product__form" data-catalog-popup-form data-telegram-order="product" data-popup-message="#formMessage" action="#" method="post">
									<input type="hidden" name="productId" value="${escapeHtml(product.id)}">
									<input type="hidden" name="product" value="${escapeHtml(title)}">
									<input type="hidden" name="price" value="${escapeHtml(price)}">
									<input type="hidden" name="productImage" value="${escapeHtml(absoluteImage)}">
									<label class="catalog-product__field">
										<span class="catalog-product__label">Имя</span>
										<input class="catalog-product__input input" type="text" name="name" placeholder="Как к вам обращаться" data-required data-error="Введите имя" required>
									</label>
									<label class="catalog-product__field">
										<span class="catalog-product__label">Номер телефона</span>
										<input class="catalog-product__input input" type="tel" name="phone" placeholder="+375 (__) ___-__-__" data-required="phone" data-validate data-error="Введите корректный номер телефона" inputmode="tel" autocomplete="tel">
									</label>
									<button type="submit" class="catalog-product__submit btn">Отправить заявку</button>
								</form>
							</div>
							<a href="${backHref}" class="catalog-product__back">← Назад в каталог</a>
						</div>
					</div>
				</div>
			</section>
			${renderCta()}
		</main>
		${renderFooter()}
	</div>
	${renderJs()}
</body>
</html>`;
}

function sortProductsForSection(products, section) {
	if (!section.subs?.length) return products;
	const rank = new Map(section.subs.map((sub, index) => [sub.id, index]));
	return [...products].sort((a, b) => {
		const rankA = rank.get(a.subcategory) ?? section.subs.length;
		const rankB = rank.get(b.subcategory) ?? section.subs.length;
		if (rankA !== rankB) return rankA - rankB;
		return Number(a.id) - Number(b.id);
	});
}

function buildSitemapUrls(products, lastmod = formatSitemapDate()) {
	const urls = [
		{ loc: `${SITE_ORIGIN}/`, priority: '1.0', changefreq: 'weekly' },
		{ loc: `${SITE_ORIGIN}/about.html`, priority: '0.8', changefreq: 'monthly' },
		{ loc: `${SITE_ORIGIN}/policy.html`, priority: '0.8', changefreq: 'monthly' },
		{ loc: `${SITE_ORIGIN}/catalog/`, priority: '0.8', changefreq: 'weekly' },
	];

	for (const section of CATALOG_SECTIONS) {
		urls.push({
			loc: catalogAbsoluteUrl(section.slug),
			priority: '0.8',
			changefreq: 'weekly',
		});
		if (section.subs?.length) {
			for (const sub of section.subs) {
				urls.push({
					loc: catalogAbsoluteUrl(section.slug, sub.slug),
					priority: '0.6',
					changefreq: 'weekly',
				});
			}
		}
	}

	for (const product of products) {
		const section = getSectionById(product.category);
		if (!section || !product.slug) continue;
		const sub = getSubById(section, product.subcategory);
		if (section.subs?.length && !sub) continue;
		urls.push({
			loc: catalogAbsoluteUrl(section.slug, sub?.slug || null, product.slug),
			priority: '0.5',
			changefreq: 'monthly',
		});
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(item) => `\t<url>
\t\t<loc>${item.loc}</loc>
\t\t<lastmod>${lastmod}</lastmod>
\t\t<changefreq>${item.changefreq}</changefreq>
\t\t<priority>${item.priority}</priority>
\t</url>`
	)
	.join('\n')}
</urlset>
`;
}

function buildLegacyRedirectPage() {
	return `<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<title>Каталог — mnogogrannik.lab</title>
	<meta name="robots" content="noindex, follow">
	<link rel="canonical" href="${SITE_ORIGIN}/catalog/">
	<script>
		(function () {
			var path = location.pathname || '';
			// Only the legacy catalog.html URL may redirect. If this document is
			// served for a pretty /catalog/{slug}/ URL, replace() loops forever.
			if (!/\\/catalog\\.html$/i.test(path)) return;

			var map = ${JSON.stringify(
				Object.fromEntries(
					CATALOG_SECTIONS.map((section) => [
						section.id,
						{
							slug: section.slug,
							subs: Object.fromEntries(
								(section.subs || []).map((sub) => [sub.id, sub.slug])
							),
						},
					])
				)
			)};
			var hash = (location.hash || '').replace(/^#/, '');
			var parts = hash.split('/').filter(Boolean);
			var target = '/catalog/';
			if (parts.length) {
				var section = map[parts[0]];
				if (section) {
					target = '/catalog/' + section.slug + '/';
					var subSlug = parts[1] && section.subs[parts[1]];
					if (subSlug) target += subSlug + '/';
					if (parts[2] && /^c\\d+$/i.test(parts[2])) {
						target += '?pid=' + encodeURIComponent(parts[2].toLowerCase());
					}
				}
			}
			location.replace(target);
		}());
	</script>
	<noscript>
		<meta http-equiv="refresh" content="0; url=/catalog/">
	</noscript>
</head>
<body>
	<p><a href="/catalog/">Перейти в каталог</a></p>
</body>
</html>`;
}

export const catalogPages = async (done) => {
	try {
		const catalogFile = path.join(srcDir, 'json/catalog.json');
		const data = JSON.parse(fs.readFileSync(catalogFile, 'utf8'));
		const products = data.products || [];

		const catalogRoot = path.join(buildDir, 'catalog');
		ensureDir(catalogRoot);

		writeHtml(path.join(catalogRoot, 'index.html'), renderIndexPage());

		for (const section of CATALOG_SECTIONS) {
			const sectionProducts = sortProductsForSection(
				products.filter((product) => product.category === section.id),
				section
			);
			const seo = resolveSeo(section);
			const sectionDir = path.join(catalogRoot, section.slug);
			writeHtml(
				path.join(sectionDir, 'index.html'),
				renderListingPage({
					seo,
					canonical: catalogAbsoluteUrl(section.slug),
					breadcrumbs: [
						{ label: 'Главная', href: '/' },
						{ label: 'Каталог', href: '/catalog/' },
						{ label: section.title, href: catalogPath(section.slug) },
					],
					heroTitle: seo.h1,
					heroText: seo.heroText,
					contentTitle: section.title,
					contentSubtitle: section.subs?.length ? 'Все подкатегории' : '',
					products: sectionProducts,
					activeSectionId: section.id,
					activeSubId: null,
					pageKind: 'section',
				})
			);

			if (section.subs?.length) {
				for (const sub of section.subs) {
					const subProducts = sectionProducts.filter(
						(product) => product.subcategory === sub.id
					);
					const subSeo = resolveSeo(section, sub);
					writeHtml(
						path.join(sectionDir, sub.slug, 'index.html'),
						renderListingPage({
							seo: subSeo,
							canonical: catalogAbsoluteUrl(section.slug, sub.slug),
							breadcrumbs: [
								{ label: 'Главная', href: '/' },
								{ label: 'Каталог', href: '/catalog/' },
								{ label: section.title, href: catalogPath(section.slug) },
								{ label: sub.title, href: catalogPath(section.slug, sub.slug) },
							],
							heroTitle: subSeo.h1,
							heroText: subSeo.heroText,
							contentTitle: section.title,
							contentSubtitle: sub.title,
							products: subProducts,
							activeSectionId: section.id,
							activeSubId: sub.id,
							pageKind: 'sub',
						})
					);

					for (const product of subProducts) {
						if (!product.slug) continue;
						writeHtml(
							path.join(sectionDir, sub.slug, product.slug, 'index.html'),
							renderProductPage(product, section, sub)
						);
					}
				}
			} else {
				for (const product of sectionProducts) {
					if (!product.slug) continue;
					writeHtml(
						path.join(sectionDir, product.slug, 'index.html'),
						renderProductPage(product, section, null)
					);
				}
			}
		}

		writeHtml(path.join(buildDir, 'catalog.html'), buildLegacyRedirectPage());

		const sitemapXml = buildSitemapUrls(products);
		writeHtml(path.join(buildDir, 'sitemap.xml'), sitemapXml);
		writeHtml(path.join(srcDir, 'sitemap.xml'), sitemapXml);

		const htaccess = `# Catalog pretty URLs (Apache)
DirectoryIndex index.html
<IfModule mod_rewrite.c>
	RewriteEngine On
	RewriteBase /

	# Legacy catalog.html → /catalog/ (hash → path handled by JS on catalog pages)
	RewriteRule ^catalog\\.html$ /catalog/ [R=301,L,QSA,NE]

	# Ensure trailing slash for catalog directories without forcing files
	RewriteCond %{REQUEST_FILENAME} !-f
	RewriteCond %{REQUEST_URI} ^/catalog/.+[^/]$
	RewriteRule ^(catalog/.+)$ /$1/ [R=301,L]
</IfModule>
`;
		writeHtml(path.join(buildDir, '.htaccess'), htaccess);

		const sitemapUrlCount = (sitemapXml.match(/<loc>/g) || []).length;
		console.log(
			`Catalog pages generated: ${CATALOG_SECTIONS.length} sections, ${products.length} products; sitemap URLs: ${sitemapUrlCount}`
		);
		done();
	} catch (error) {
		done(error);
	}
};
