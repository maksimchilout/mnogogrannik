import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { catalogPath, siteAbsoluteUrl } from './catalog-taxonomy.js';
import { firstParagraph, parseFrontmatter, renderMarkdown } from './markdown.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, '../../blog');

const CATALOG_BY_CATEGORY = {
	'mangal-zony': {
		href: catalogPath('mangal-zony'),
		label: 'каталоге мангалов и костровых зон',
	},
	'loft-mebel': {
		href: catalogPath('loft-mebel'),
		label: 'каталоге лофт-мебели',
	},
	'sadovaya-mebel': {
		href: catalogPath('sadovaya-mebel'),
		label: 'каталоге садовой мебели',
	},
};

const ARTICLE_ENRICHMENT = {
	'kak-vybrat-mangal': {
		datePublished: '2026-08-12',
		catalogAfterH2: 2,
		images: [
			{
				afterH2: 1,
				caption: 'Сравнение толщины стали жаровни: тонкий лист коробится, толстый держит жар',
			},
			{
				afterH2: 2,
				caption: 'Стационарная мангальная зона с дровницей и рабочей столешницей на участке',
			},
			{
				afterH2: 4,
				caption: 'Выдвижной зольник и крышка на металлическом мангале крупным планом',
			},
		],
	},
	'uhod-za-loft-mebelyu': {
		datePublished: '2026-08-15',
		catalogAfterH2: 2,
		images: [
			{
				afterH2: 1,
				caption: 'Уход за окрашенным металлическим каркасом лофт-стола мягкой тканью',
			},
			{
				afterH2: 2,
				caption: 'Столешница из массива с масляным покрытием: протирание без луж воды',
			},
			{
				afterH2: 3,
				caption: 'Садовые качели лофт зимой под защитным чехлом',
			},
		],
	},
	'derevo-ili-metall': {
		datePublished: '2026-08-18',
		catalogAfterH2: 3,
		images: [
			{
				afterH2: 1,
				caption: 'Металлические опоры навеса в контакте с площадкой — несущая конструкция',
			},
			{
				afterH2: 4,
				caption: 'Стол лофт: металлический каркас и столешница из массива дерева',
			},
			{
				afterH2: 5,
				caption: 'Садовая беседка: металлический каркас и деревянный настил',
			},
		],
	},
};

function imagePlaceholder(description) {
	const text = String(description || '').trim();
	return `<figure class="blog-figure">
	<!-- IMAGE: ${text} -->
	<div class="blog-figure__placeholder" role="img" aria-label="${escapeAttr(text)}">
		<span class="blog-figure__hint">${escapeHtml(text)}</span>
	</div>
</figure>`;
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function escapeAttr(value) {
	return escapeHtml(value);
}

function insertAfterNthH2(html, n, snippet) {
	if (!snippet || n < 1) return html;
	let count = 0;
	return html.replace(/<h2[\s\S]*?<\/h2>/g, (match) => {
		count += 1;
		return count === n ? `${match}\n${snippet}` : match;
	});
}

function stripLeadingH1(html) {
	return html.replace(/^\s*<h1[\s\S]*?<\/h1>\s*/i, '');
}

function excerptFrom(text, max = 170) {
	const compact = String(text || '').replace(/\s+/g, ' ').trim();
	if (compact.length <= max) return compact;
	const cut = compact.slice(0, max - 1);
	const sp = cut.lastIndexOf(' ');
	return `${(sp > 80 ? cut.slice(0, sp) : cut).replace(/[.,;:—-]+$/g, '')}…`;
}

export function loadBlogPosts() {
	if (!fs.existsSync(BLOG_DIR)) return [];

	const files = fs
		.readdirSync(BLOG_DIR)
		.filter((name) => name.endsWith('.md'))
		.sort();

	const posts = files.map((fileName) => {
		const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), 'utf8');
		const { data, body } = parseFrontmatter(raw);
		const slug = data.slug || fileName.replace(/\.md$/i, '');
		const extra = ARTICLE_ENRICHMENT[slug] || {};
		const catalog = CATALOG_BY_CATEGORY[data.category] || null;
		let html = stripLeadingH1(renderMarkdown(body));

		for (const image of extra.images || []) {
			html = insertAfterNthH2(html, image.afterH2, imagePlaceholder(image.caption));
		}

		if (catalog) {
			const linkHtml = `<p class="blog-article__catalog-link">Готовые решения смотрите в <a href="${catalog.href}">${escapeHtml(catalog.label)}</a> — можно взять за основу или заказать под свои размеры.</p>`;
			html = insertAfterNthH2(html, extra.catalogAfterH2 || 2, linkHtml);
		}

		const excerpt = excerptFrom(firstParagraph(body));
		const href = `/blog/${slug}/`;

		return {
			slug,
			title: data.title || slug,
			metaDescription: data.meta_description || excerpt,
			category: data.category || '',
			coverImageAlt: data.cover_image_alt || data.title || '',
			datePublished: extra.datePublished || '2026-08-18',
			excerpt,
			href,
			canonical: siteAbsoluteUrl(href),
			html,
			catalog,
			body,
		};
	});

	const order = ['kak-vybrat-mangal', 'uhod-za-loft-mebelyu', 'derevo-ili-metall'];
	posts.sort((a, b) => {
		const rank = (slug) => {
			const index = order.indexOf(slug);
			return index === -1 ? order.length : index;
		};
		return rank(a.slug) - rank(b.slug);
	});

	return posts;
}

export function getBlogSitemapEntries() {
	const posts = loadBlogPosts();
	return [
		{ loc: siteAbsoluteUrl('/blog/'), priority: '0.7', changefreq: 'weekly' },
		...posts.map((post) => ({
			loc: post.canonical,
			priority: '0.6',
			changefreq: 'monthly',
		})),
	];
}
