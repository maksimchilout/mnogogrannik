import {
	catalogImageSrc,
	escapeHtml,
	formatProductPrice,
	getProductPrice,
	getProductText,
	getProductTitle,
	buildCatalogHref,
	textMatchesSearchQuery,
	valuesMatchSearchQuery,
} from './catalog-utils.js';

const MIN_QUERY_LENGTH = 2;

let catalogProducts = [];
let categoryIndex = [];
let debounceTimer = null;
let catalogReady = false;

function matchesQuery(...parts) {
	return (query) => valuesMatchSearchQuery(query, ...parts);
}

function buildCategoryIndex(products) {
	const map = new Map();

	products.forEach((product) => {
		const key = `${product.category}/${product.subcategory}`;
		if (map.has(key)) return;

		map.set(key, {
			category: product.category,
			subcategory: product.subcategory,
			categoryTitle: product.categoryTitle,
			subcategoryTitle: product.subcategoryTitle,
			image: product.image,
		});
	});

	return Array.from(map.values());
}

function searchCatalog(query) {
	if (!catalogReady) {
		return { categories: [], products: [] };
	}

	const matcher = matchesQuery;
	const categories = categoryIndex.filter((item) =>
		matcher(item.subcategoryTitle, item.categoryTitle)(query)
	);

	const products = catalogProducts.filter((product) =>
		matcher(
			getProductTitle(product),
			getProductText(product),
			product.subcategoryTitle,
			product.categoryTitle,
			product.description
		)(query)
	);

	return {
		categories,
		products,
	};
}

function renderCategoryItem(item) {
	const href = buildCatalogHref(item.category, item.subcategory);
	const imageSrc = catalogImageSrc(item.image);

	return `
		<a href="${href}" class="search-results__item search-results__item_category">
			<span class="search-results__thumb">
				<img src="${imageSrc}" alt="" loading="lazy">
			</span>
			<span class="search-results__info">
				<span class="search-results__name">${escapeHtml(item.subcategoryTitle)}</span>
				<span class="search-results__meta">${escapeHtml(item.categoryTitle)}</span>
			</span>
		</a>
	`;
}

function renderProductItem(product) {
	const href = buildCatalogHref(product.category, product.subcategory, product.id);
	const imageSrc = catalogImageSrc(product.image);
	const title = getProductTitle(product);
	const price = formatProductPrice(product);

	return `
		<a href="${href}" class="search-results__item">
			<span class="search-results__thumb">
				<img src="${imageSrc}" alt="" loading="lazy">
			</span>
			<span class="search-results__info">
				<span class="search-results__name">${escapeHtml(title)}</span>
				<span class="search-results__price">${price}</span>
			</span>
		</a>
	`;
}

function renderResults(query, resultsEl) {
	if (!catalogReady) {
		resultsEl.innerHTML = '<div class="search-results__empty">Загрузка каталога...</div>';
		resultsEl.hidden = false;
		return;
	}

	const { categories, products } = searchCatalog(query);

	if (!categories.length && !products.length) {
		resultsEl.innerHTML = '<div class="search-results__empty">Ничего не найдено</div>';
		resultsEl.hidden = false;
		return;
	}

	let html = '';

	if (categories.length) {
		html += `
			<div class="search-results__group">
				<div class="search-results__label">Категории</div>
				${categories.map(renderCategoryItem).join('')}
			</div>
		`;
	}

	if (products.length) {
		html += `
			<div class="search-results__group">
				<div class="search-results__label">Товары</div>
				${products.map(renderProductItem).join('')}
			</div>
		`;
	}

	resultsEl.innerHTML = html;
	resultsEl.hidden = false;
}

function hideResults(resultsEl) {
	resultsEl.hidden = true;
	resultsEl.innerHTML = '';
}

function dispatchSearchEvent(query) {
	document.dispatchEvent(
		new CustomEvent('catalogSearch', {
			detail: { query: String(query || '').toLowerCase().trim() },
		})
	);
}

async function loadCatalogData() {
	const catalogUrl = new URL('json/catalog.json', window.location.href).href;
	const response = await fetch(catalogUrl);
	if (!response.ok) throw new Error('catalog.json not found');

	const data = await response.json();
	catalogProducts = data.products || [];
	categoryIndex = buildCategoryIndex(catalogProducts);
	catalogReady = true;
}

export function initCatalogSearch() {
	const searchInput = document.querySelector('.search-form__input');
	const searchForm = document.querySelector('.search-form__item');
	const searchWrap = document.querySelector('.search-form');
	const searchField = document.querySelector('.search-form__field');
	const isCatalogPage = Boolean(document.querySelector('[data-catalog-grid]'));

	if (!searchInput || !searchForm) return;

	let resultsEl = document.querySelector('[data-search-results]');
	if (!resultsEl) {
		const host = searchField || searchForm.parentElement;
		if (!host) return;

		resultsEl = document.createElement('div');
		resultsEl.className = 'search-form__results search-results';
		resultsEl.setAttribute('data-search-results', '');
		resultsEl.hidden = true;
		host.appendChild(resultsEl);
	}

	const handleInput = () => {
		const query = searchInput.value.trim();

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (isCatalogPage) {
				dispatchSearchEvent(query);
			}

			if (query.length < MIN_QUERY_LENGTH) {
				hideResults(resultsEl);
				return;
			}

			renderResults(query, resultsEl);
		}, 180);
	};

	searchInput.addEventListener('input', handleInput);

	searchInput.addEventListener('focus', () => {
		searchWrap?.classList.add('_active');
		if (searchInput.value.trim().length >= MIN_QUERY_LENGTH) {
			renderResults(searchInput.value.trim(), resultsEl);
		}
	});

	searchForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const query = searchInput.value.trim();

		if (isCatalogPage) {
			dispatchSearchEvent(query);
		}

		if (query.length < MIN_QUERY_LENGTH) return;

		const { categories, products } = searchCatalog(query);
		const targetProduct = products[0];
		const targetCategory = categories[0];

		if (!targetProduct && !targetCategory) return;

		if (targetProduct) {
			window.location.href = buildCatalogHref(
				targetProduct.category,
				targetProduct.subcategory,
				targetProduct.id
			);
			return;
		}

		window.location.href = buildCatalogHref(targetCategory.category, targetCategory.subcategory);
	});

	resultsEl.addEventListener('click', () => {
		hideResults(resultsEl);
		searchWrap?.classList.remove('_active');
	});

	document.addEventListener('click', (event) => {
		if (!event.target.closest('.search-form')) {
			hideResults(resultsEl);
		}
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			hideResults(resultsEl);
		}
	});

	loadCatalogData()
		.then(() => {
			const query = searchInput.value.trim();
			if (query.length >= MIN_QUERY_LENGTH && document.activeElement === searchInput) {
				renderResults(query, resultsEl);
			}
		})
		.catch((error) => {
			console.error(error);
			catalogReady = false;
		});
}
