import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildBreadcrumbListSchema, renderJsonLdBlocks } from '../../src/js/files/catalog-schema.js';
import { loadBlogPosts } from '../../src/js/files/blog-posts.js';
import { SITE_ORIGIN, siteAbsoluteUrl } from '../../src/js/files/catalog-taxonomy.js';
import { escapeHtml } from '../../src/js/files/catalog-utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const srcDir = path.join(rootDir, 'src');
const buildDir = path.join(rootDir, 'dist');
const partialsDir = path.join(srcDir, 'html');
const OG_IMAGE = siteAbsoluteUrl('/img/about/about-hero.jpg');

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

function renderHead({
	title,
	description,
	canonical,
	ogType = 'website',
	robots = 'index, follow',
	jsonLd = '',
}) {
	const head = resolveIncludes(
		`@@include('html/_head.htm',{
"title":${JSON.stringify(title)},
"description":${JSON.stringify(description)},
"canonical":${JSON.stringify(canonical)},
"ogImage":${JSON.stringify(OG_IMAGE)},
"ogType":${JSON.stringify(ogType)},
"robots":${JSON.stringify(robots)}
})`,
		{}
	);
	const extra = jsonLd ? `${jsonLd}\n` : '';
	return `${toRootRelativeHtml(head)}\n${extra}</head>`;
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
		<nav class="blog-hero__breadcrumbs breadcrumbs" aria-label="Навигация">
			${parts}
		</nav>`;
}

function renderCta(title, fileId) {
	return `
		<section class="page__catalog-cta catalog-cta">
			<div class="catalog-cta__container _container">
				<div class="catalog-cta__body">
					<h2 class="catalog-cta__title">${escapeHtml(title)}</h2>
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
									<input class="catalog-cta__file-input" type="file" name="files[]" id="${escapeHtml(fileId)}" accept="image/*" multiple data-catalog-cta-file>
									<label class="catalog-cta__file-btn" for="${escapeHtml(fileId)}">Добавить фото</label>
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

function formatDate(isoDate) {
	const [year, month, day] = String(isoDate).split('-');
	if (!year || !month || !day) return isoDate;
	return `${day}.${month}.${year}`;
}

function renderCover(alt) {
	return `<figure class="blog-cover">
	<!-- IMAGE: ${escapeHtml(alt)} -->
	<div class="blog-cover__placeholder" role="img" aria-label="${escapeHtml(alt)}">
		<span class="blog-cover__hint">${escapeHtml(alt)}</span>
	</div>
</figure>`;
}

function renderRelated(posts, currentSlug) {
	const related = posts.filter((post) => post.slug !== currentSlug).slice(0, 2);
	if (!related.length) return '';
	const cards = related
		.map(
			(post) => `
			<a href="${post.href}" class="blog-related__card">
				${renderCover(post.coverImageAlt)}
				<h3 class="blog-related__title">${escapeHtml(post.title)}</h3>
				<p class="blog-related__excerpt">${escapeHtml(post.excerpt)}</p>
			</a>`
		)
		.join('\n');

	return `
		<section class="blog-related">
			<h2 class="blog-related__heading">Похожие статьи</h2>
			<div class="blog-related__grid">
				${cards}
			</div>
		</section>`;
}

function buildArticleSchema(post) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: post.title,
		description: post.metaDescription,
		datePublished: post.datePublished,
		mainEntityOfPage: post.canonical,
		author: {
			'@type': 'Organization',
			name: 'mnogogrannik.by',
			url: siteAbsoluteUrl('/'),
		},
		publisher: {
			'@id': `${SITE_ORIGIN}/#organization`,
			name: 'mnogogrannik.by',
		},
	};
}

function renderListingPage(posts) {
	const canonical = siteAbsoluteUrl('/blog/');
	const title = 'Блог о мебели и металлоконструкциях на заказ | mnogogrannik.by';
	const description =
		'Статьи о выборе мангала, уходе за лофт-мебелью и материалах для садовых конструкций. Советы мастерской mnogogrannik.by — Минск и Слуцк.';
	const crumbs = [
		{ label: 'Главная', href: '/' },
		{ label: 'Блог', href: '/blog/' },
	];
	const schemaHtml = renderJsonLdBlocks(buildBreadcrumbListSchema(crumbs));
	const cards = posts
		.map(
			(post) => `
			<article class="blog-card">
				<a href="${post.href}" class="blog-card__media">
					${renderCover(post.coverImageAlt)}
				</a>
				<div class="blog-card__body">
					<time class="blog-card__date" datetime="${escapeHtml(post.datePublished)}">${formatDate(post.datePublished)}</time>
					<h2 class="blog-card__title"><a href="${post.href}">${escapeHtml(post.title)}</a></h2>
					<p class="blog-card__excerpt">${escapeHtml(post.excerpt)}</p>
					<a href="${post.href}" class="blog-card__more btn btn_white">Читать статью</a>
				</div>
			</article>`
		)
		.join('\n');

	return `<!DOCTYPE html>
<html lang="ru">
${renderHead({ title, description, canonical, jsonLd: schemaHtml })}
<body>
	<div class="wrapper">
		${renderHeader()}
		<main class="page" data-blog-page="index">
			<section class="page__blog-hero blog-hero">
				<div class="blog-hero__container _container">
					${renderBreadcrumbs(crumbs)}
					<h1 class="blog-hero__title _title">Блог</h1>
					<p class="blog-hero__text">Разбираем выбор мангала, уход за лофт-мебелью и материалы для участка — без воды, с практикой мастерской.</p>
				</div>
			</section>
			<section class="page__blog blog">
				<div class="blog__container _container">
					<div class="blog__list">
						${cards}
					</div>
				</div>
			</section>
			${renderCta('Обсудить проект', 'blog-index-cta-file')}
		</main>
		${renderFooter()}
	</div>
	${renderJs()}
</body>
</html>`;
}

function renderArticlePage(post, posts) {
	const crumbs = [
		{ label: 'Главная', href: '/' },
		{ label: 'Блог', href: '/blog/' },
		{ label: post.title, href: post.href },
	];
	const schemaHtml = renderJsonLdBlocks(
		buildBreadcrumbListSchema(crumbs),
		buildArticleSchema(post)
	);

	return `<!DOCTYPE html>
<html lang="ru">
${renderHead({
	title: post.title,
	description: post.metaDescription,
	canonical: post.canonical,
	ogType: 'article',
	jsonLd: schemaHtml,
})}
<body>
	<div class="wrapper">
		${renderHeader()}
		<main class="page" data-blog-page="article" data-blog-slug="${escapeHtml(post.slug)}">
			<section class="page__blog-hero blog-hero blog-hero_article">
				<div class="blog-hero__container _container">
					${renderBreadcrumbs(crumbs)}
					<p class="blog-hero__date"><time datetime="${escapeHtml(post.datePublished)}">${formatDate(post.datePublished)}</time></p>
					<h1 class="blog-hero__title _title">${escapeHtml(post.title)}</h1>
				</div>
			</section>
			<article class="page__blog-article blog-article">
				<div class="blog-article__container _container">
					${renderCover(post.coverImageAlt)}
					<div class="blog-article__content">
						${post.html}
					</div>
					${renderRelated(posts, post.slug)}
					<p class="blog-article__back"><a href="/blog/" class="blog-article__back-link">← Все статьи</a></p>
				</div>
			</article>
			${renderCta('Обсудить проект', `blog-cta-${post.slug}`)}
		</main>
		${renderFooter()}
	</div>
	${renderJs()}
</body>
</html>`;
}

export const blogPages = async (done) => {
	try {
		const posts = loadBlogPosts();
		if (!posts.length) {
			console.warn('Blog pages: no markdown posts found in src/blog');
			done();
			return;
		}

		const blogRoot = path.join(buildDir, 'blog');
		writeHtml(path.join(blogRoot, 'index.html'), renderListingPage(posts));

		for (const post of posts) {
			writeHtml(path.join(blogRoot, post.slug, 'index.html'), renderArticlePage(post, posts));
		}

		console.log(`Blog pages generated: ${posts.length} articles`);
		done();
	} catch (error) {
		done(error);
	}
};
