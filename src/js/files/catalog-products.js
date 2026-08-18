import {
	catalogImageSrc,
	escapeHtml,
	formatProductPrice,
	getProductImageAlt,
	getProductText,
	getProductTitle,
	titleMatchesSearchQuery,
	getCatalogSearchQueryFromUrl,
} from './catalog-utils.js';
import {
	getProductOrderSnapshot,
	setProductOrderSnapshot,
} from './product-order-snapshot.js';
import { SHOWCASE_MODE } from './shop-mode.js';
import { applyCatalogSeo } from './catalog-seo.js';
import {
	getProductPath,
	getSectionById,
	hashToCatalogPath,
	normalizeCatalogPathname,
	parseCatalogPathname,
} from './catalog-taxonomy.js';

let catalogProducts = [];
let currentSection = 'loft-furniture';
let currentSub = null;
let searchQuery = '';

function renderProductCard(product) {
	const productId = `c${product.id}`;
	const title = getProductTitle(product);
	const text = getProductText(product);
	const price = formatProductPrice(product);
	const imageSrc = catalogImageSrc(product.image);
	const imageAlt = getProductImageAlt(product);
	const href = getProductPath(product);
	return `
		<article data-pid="${productId}" class="products__item item-product" data-catalog-product>
			<a href="${href}" class="item-product__image -ibg">
				<img src="${imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`}" alt="${escapeHtml(imageAlt)}" loading="lazy">
			</a>
			<div class="item-product__body">
				<div class="item-product__content">
					<h3 class="item-product__title"><a href="${href}">${escapeHtml(title)}</a></h3>
					<div class="item-product__text">${escapeHtml(text)}</div>
				</div>
				<div class="item-product__prices">
					<div class="item-product__price-group">
						<div class="item-product__price">${price}</div>
					</div>
					<a href="${href}" class="actions-product__button btn btn_white">${SHOWCASE_MODE ? 'Подробнее' : 'В корзину'}</a>
				</div>
			</div>
		</article>
	`;
}

function getProductByCardId(cardId) {
	const productId = String(cardId).replace(/^c/, '');
	return catalogProducts.find((product) => String(product.id) === productId) || null;
}

export function openProductDetailsPopup({ id, title, text, price, imageSrc, imageAlt }) {
	const popup = document.getElementById('catalogProduct');
	const imageEl = popup?.querySelector('[data-catalog-popup-image]');
	const titleEl = popup?.querySelector('[data-catalog-popup-title]');
	const textEl = popup?.querySelector('[data-catalog-popup-text]');
	const priceEl = popup?.querySelector('[data-catalog-popup-price]');
	const productInput = popup?.querySelector('[data-catalog-popup-product-input]');
	const priceInput = popup?.querySelector('[data-catalog-popup-price-input]');
	const productIdInput = popup?.querySelector('[data-catalog-popup-id-input]');
	const productImageInput = popup?.querySelector('[data-catalog-popup-image-input]');
	const form = popup?.querySelector('[data-catalog-popup-form]');
	const openButton = document.querySelector('[data-catalog-popup-open]');

	if (!popup || !imageEl || !titleEl || !textEl || !priceEl || !openButton) return;

	const imageUrl = new URL(imageSrc, window.location.href).href;

	imageEl.src = imageSrc;
	imageEl.alt = imageAlt || title;
	titleEl.textContent = title;
	textEl.textContent = text;
	priceEl.textContent = price;

	form?.reset();

	if (productIdInput) productIdInput.value = String(id ?? '');
	if (productInput) productInput.value = title;
	if (priceInput) priceInput.value = price;
	if (productImageInput) productImageInput.value = imageUrl;

	setProductOrderSnapshot({
		productId: id,
		product: title,
		price,
		productImage: imageUrl,
	});

	openButton.click();
}

export function openProductPopupFromCard(card) {
	if (!card) return;

	const pid = card.dataset.pid || '';
	const id = String(pid).replace(/^c/, '');
	const title = card.querySelector('.item-product__title')?.textContent.trim() || '';
	const text = card.querySelector('.item-product__text')?.textContent.trim() || '';
	const price =
		card.querySelector('.item-product__price:not(.item-product__price_old)')?.textContent.trim() ||
		'По запросу';
	const imageSrc = card.querySelector('.item-product__image img')?.getAttribute('src') || '';

	openProductDetailsPopup({ id, title, text, price, imageSrc });
}

export function openCatalogProductPopup(product) {
	if (!product) return;

	openProductDetailsPopup({
		id: product.id,
		title: getProductTitle(product),
		text: getProductText(product),
		price: formatProductPrice(product),
		imageSrc: catalogImageSrc(product.image),
		imageAlt: getProductImageAlt(product),
	});
}

function initCatalogProductPopup() {
	document.addEventListener('formSent', (event) => {
		const form = event.detail?.form;
		if (!form?.matches('[data-catalog-popup-form]')) return;

		window.setTimeout(() => {
			const snapshot = getProductOrderSnapshot();
			if (!snapshot?.productId) return;

			const productIdInput = form.querySelector('[name="productId"]');
			const productInput = form.querySelector('[name="product"]');
			const priceInput = form.querySelector('[name="price"]');
			const productImageInput = form.querySelector('[name="productImage"]');

			if (productIdInput) productIdInput.value = snapshot.productId;
			if (productInput) productInput.value = snapshot.product;
			if (priceInput) priceInput.value = snapshot.price;
			if (productImageInput) productImageInput.value = snapshot.productImage;
		}, 0);
	});
}

function clearCatalogSearchInput() {
	const searchInput = document.querySelector('.search-form__input');
	if (searchInput) searchInput.value = '';
	searchQuery = '';
}

function clearSearchUrlParam() {
	const url = new URL(window.location.href);
	if (!url.searchParams.has('q')) return;
	url.searchParams.delete('q');
	history.replaceState(null, '', `${url.pathname}${url.search}`);
}

function setSearchUrlParam(query) {
	const url = new URL(window.location.href);
	const normalizedQuery = String(query || '').trim();
	if (!normalizedQuery) {
		clearSearchUrlParam();
		return;
	}
	url.searchParams.set('q', normalizedQuery);
	history.replaceState(null, '', `${url.pathname}${url.search}`);
}

function applyCatalogSearch(query, { updateUrl = true } = {}) {
	searchQuery = String(query || '').trim().toLowerCase();
	const searchInput = document.querySelector('.search-form__input');
	if (searchInput) searchInput.value = searchQuery;
	if (updateUrl) {
		if (searchQuery) setSearchUrlParam(searchQuery);
		else clearSearchUrlParam();
	}

	const indexBlock = document.querySelector('[data-catalog-index]');
	const grid = document.querySelector('[data-catalog-grid]');
	if (indexBlock && grid) {
		indexBlock.hidden = Boolean(searchQuery);
		grid.hidden = !searchQuery && document.querySelector('[data-catalog-page="index"]');
	}

	renderProducts();
	updateHeader();
}

function getSectionTitle(sectionId) {
	return getSectionById(sectionId)?.title || '';
}

function getSubTitle(sectionId, subId) {
	const section = getSectionById(sectionId);
	return section?.subs?.find((sub) => sub.id === subId)?.title || '';
}

function sectionHasSubs(sectionId) {
	return Boolean(getSectionById(sectionId)?.subs?.length);
}

function getSubcategoryOrder(sectionId) {
	return (getSectionById(sectionId)?.subs || []).map((sub) => sub.id);
}

function getProductCatalogIndex(product) {
	return catalogProducts.indexOf(product);
}

function sortProductsForSection(items, sectionId) {
	const subOrder = getSubcategoryOrder(sectionId);
	if (!subOrder.length) return items;

	const subRank = new Map(subOrder.map((sub, index) => [sub, index]));

	return [...items].sort((a, b) => {
		const rankA = subRank.get(a.subcategory) ?? subOrder.length;
		const rankB = subRank.get(b.subcategory) ?? subOrder.length;
		if (rankA !== rankB) return rankA - rankB;
		return getProductCatalogIndex(a) - getProductCatalogIndex(b);
	});
}

function updateHeader() {
	const titleEl = document.querySelector('[data-catalog-title]');
	const subtitleEl = document.querySelector('[data-catalog-subtitle]');
	if (!titleEl || !subtitleEl) return;

	if (searchQuery) {
		titleEl.textContent = 'Результаты поиска';
		subtitleEl.hidden = false;
		subtitleEl.textContent = `По запросу «${searchQuery}» в названии`;
		applyCatalogSeo(currentSection, currentSub);
		return;
	}

	if (document.querySelector('[data-catalog-page="index"]')) {
		titleEl.textContent = 'Разделы каталога';
		subtitleEl.hidden = false;
		subtitleEl.textContent = 'Выберите категорию';
		applyCatalogSeo(null, null);
		return;
	}

	titleEl.textContent = getSectionTitle(currentSection);

	if (!sectionHasSubs(currentSection)) {
		subtitleEl.textContent = '';
		subtitleEl.hidden = true;
		applyCatalogSeo(currentSection, currentSub);
		return;
	}

	subtitleEl.hidden = false;
	subtitleEl.textContent = currentSub
		? getSubTitle(currentSection, currentSub)
		: 'Все подкатегории';

	applyCatalogSeo(currentSection, currentSub);
}

function productMatchesSearch(product) {
	if (!searchQuery) return true;
	return titleMatchesSearchQuery(getProductTitle(product), searchQuery);
}

function renderProducts() {
	const grid = document.querySelector('[data-catalog-grid]');
	const empty = document.querySelector('[data-catalog-empty]');
	if (!grid || !empty) return;

	let items;
	if (searchQuery) {
		items = catalogProducts.filter((product) => productMatchesSearch(product));
	} else if (document.querySelector('[data-catalog-page="index"]')) {
		items = [];
	} else {
		items = catalogProducts.filter((product) => product.category === currentSection);
		if (currentSub) {
			items = items.filter((product) => product.subcategory === currentSub);
		}
		items = sortProductsForSection(items, currentSection);
	}

	grid.innerHTML = '';

	if (!items.length) {
		empty.hidden = false;
		empty.textContent = searchQuery
			? 'По вашему запросу ничего не найдено'
			: 'В этой подкатегории пока нет фотографий';
		return;
	}

	empty.textContent = 'В этой подкатегории пока нет фотографий';
	empty.hidden = true;
	grid.insertAdjacentHTML('beforeend', items.map(renderProductCard).join(''));
}

function getCatalogCtaFileKey(file) {
	return `${file.name}-${file.size}-${file.lastModified}`;
}

function initCatalogCtaForm() {
	const form = document.querySelector('.catalog-cta__form');
	if (!form) return;

	const fileInput = form.querySelector('[data-catalog-cta-file]');
	const previews = form.querySelector('[data-catalog-cta-previews]');
	const fileStore = new DataTransfer();
	const previewUrls = new Map();

	const revokePreviewUrls = () => {
		previewUrls.forEach((url) => URL.revokeObjectURL(url));
		previewUrls.clear();
	};

	const syncFileInput = () => {
		if (fileInput) {
			fileInput.files = fileStore.files;
		}
	};

	const removeFileAt = (index) => {
		const files = Array.from(fileStore.files);
		files.splice(index, 1);

		while (fileStore.items.length > 0) {
			fileStore.items.remove(0);
		}

		files.forEach((file) => fileStore.items.add(file));
		syncFileInput();
		renderPreviews();
	};

	const renderPreviews = () => {
		if (!previews) return;

		const files = Array.from(fileStore.files);
		const activeKeys = new Set(files.map(getCatalogCtaFileKey));

		previewUrls.forEach((url, key) => {
			if (!activeKeys.has(key)) {
				URL.revokeObjectURL(url);
				previewUrls.delete(key);
			}
		});

		previews.innerHTML = '';

		if (!files.length) {
			previews.classList.add('_empty');
			previews.innerHTML = '<span class="catalog-cta__previews-placeholder">Добавленные фото появятся здесь</span>';
			return;
		}

		previews.classList.remove('_empty');

		files.forEach((file, index) => {
			const key = getCatalogCtaFileKey(file);
			let url = previewUrls.get(key);
			if (!url) {
				url = URL.createObjectURL(file);
				previewUrls.set(key, url);
			}

			const item = document.createElement('div');
			item.className = 'catalog-cta__preview';
			item.innerHTML = `
				<img src="${url}" alt="">
				<button type="button" class="catalog-cta__preview-remove" aria-label="Удалить фото">&times;</button>
			`;
			item.querySelector('button')?.addEventListener('click', () => removeFileAt(index));
			previews.appendChild(item);
		});
	};

	const clearFiles = () => {
		while (fileStore.items.length > 0) {
			fileStore.items.remove(0);
		}
		syncFileInput();
		revokePreviewUrls();
		renderPreviews();
	};

	fileInput?.addEventListener('change', () => {
		Array.from(fileInput.files || []).forEach((file) => {
			const key = getCatalogCtaFileKey(file);
			const exists = Array.from(fileStore.files).some(
				(existing) => getCatalogCtaFileKey(existing) === key
			);
			if (!exists) fileStore.items.add(file);
		});
		syncFileInput();
		renderPreviews();
		fileInput.value = '';
	});

	form.addEventListener('reset', clearFiles);
}

function resolveRouteFromPath() {
	const parsed = parseCatalogPathname(window.location.pathname);
	if (parsed.kind === 'section' || parsed.kind === 'sub' || parsed.kind === 'product') {
		return {
			section: parsed.section?.id || 'loft-furniture',
			sub: parsed.sub?.id || null,
			productSlug: parsed.productSlug || null,
			kind: parsed.kind,
		};
	}

	const page = document.querySelector('[data-catalog-page]');
	return {
		section: page?.dataset.catalogSection || 'loft-furniture',
		sub: page?.dataset.catalogSub || null,
		productSlug: null,
		kind: page?.dataset.catalogPage || 'index',
	};
}

function redirectLegacyCatalogHash() {
	const rawHash = String(window.location.hash || '').replace(/^#/, '');
	if (!rawHash) return false;

	const target = hashToCatalogPath(rawHash);
	if (!target) return false;

	const targetUrl = new URL(target, window.location.origin);
	const samePath =
		normalizeCatalogPathname(window.location.pathname) ===
		normalizeCatalogPathname(targetUrl.pathname);

	if (samePath) {
		// Already on the pretty URL — drop legacy hash without a navigation.
		const next = `${window.location.pathname}${targetUrl.search || window.location.search}`;
		if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
			history.replaceState(null, '', next);
		}
		return false;
	}

	window.location.replace(`${targetUrl.pathname}${targetUrl.search}`);
	return true;
}

function redirectLegacyPid() {
	const pid = new URLSearchParams(window.location.search).get('pid');
	if (!pid) return false;
	const product = getProductByCardId(pid);
	if (!product?.slug) return false;

	const targetPath = getProductPath(product);
	if (
		normalizeCatalogPathname(window.location.pathname) ===
		normalizeCatalogPathname(targetPath)
	) {
		// Already on the product page — strip ?pid without reloading.
		history.replaceState(null, '', targetPath);
		return false;
	}

	window.location.replace(targetPath);
	return true;
}

const CATALOG_SCROLL_KEY = 'mnogogrannik:catalog-scroll';
let pendingCatalogScrollY = null;

function normalizePathKey(pathname = '', search = '') {
	const path = String(pathname || '/').replace(/\/index\.html$/i, '/').replace(/\/{2,}/g, '/');
	const withSlash = path.endsWith('/') || path === '/' ? path : `${path}/`;
	return `${withSlash}${search || ''}`;
}

function getLocationKey(locationLike = window.location) {
	return normalizePathKey(locationLike.pathname, locationLike.search);
}

function rememberCatalogScrollPosition() {
	try {
		sessionStorage.setItem(
			CATALOG_SCROLL_KEY,
			JSON.stringify({
				path: getLocationKey(),
				y: window.scrollY || window.pageYOffset || 0,
			})
		);
	} catch {
		// ignore quota / private mode
	}
}

function readStoredCatalogScroll() {
	try {
		const raw = sessionStorage.getItem(CATALOG_SCROLL_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!data || data.path !== getLocationKey()) return null;
		const y = Number(data.y);
		if (!Number.isFinite(y) || y < 0) return null;
		return y;
	} catch {
		return null;
	}
}

function applyCatalogScrollY(y) {
	if (!Number.isFinite(y) || y < 0) return;
	window.scrollTo(0, y);
}

function restoreCatalogScrollPosition({ clear = false } = {}) {
	if (pendingCatalogScrollY == null) {
		pendingCatalogScrollY = readStoredCatalogScroll();
	}
	if (pendingCatalogScrollY == null) return false;

	const y = pendingCatalogScrollY;
	applyCatalogScrollY(y);
	requestAnimationFrame(() => {
		applyCatalogScrollY(y);
		requestAnimationFrame(() => applyCatalogScrollY(y));
	});

	if (clear) {
		try {
			sessionStorage.removeItem(CATALOG_SCROLL_KEY);
		} catch {
			// ignore
		}
		pendingCatalogScrollY = null;
		setTimeout(() => applyCatalogScrollY(y), 50);
		setTimeout(() => applyCatalogScrollY(y), 250);
		setTimeout(() => applyCatalogScrollY(y), 600);
	}
	return true;
}

function initCatalogScrollMemory() {
	try {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}
	} catch {
		// ignore
	}

	document.addEventListener(
		'click',
		(event) => {
			const link = event.target.closest('a[href]');
			if (!link || link.target === '_blank' || event.defaultPrevented) return;
			if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
				return;
			}

			const href = link.getAttribute('href');
			if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(href)) return;

			// Только переход из карточки товара (главная / каталог) — не сайдбар и не крошки
			if (!link.closest('.item-product, [data-catalog-product]')) return;

			rememberCatalogScrollPosition();
		},
		true
	);

	restoreCatalogScrollPosition();
}

export async function initCatalogPage() {
	const pageRoot = document.querySelector('[data-catalog-page]');
	initCatalogCtaForm();
	initCatalogProductPopup();
	initCatalogScrollMemory();

	if (!pageRoot && !document.querySelector('[data-catalog-grid]')) return;

	// Hash → pretty path must run before async fetch so /catalog/#section works
	// after Apache's catalog.html → /catalog/ redirect.
	if (redirectLegacyCatalogHash()) return;

	try {
		const response = await fetch('/json/catalog.json');
		if (!response.ok) throw new Error('catalog.json not found');
		const data = await response.json();
		catalogProducts = data.products || [];
		window.__catalogProductsCache = catalogProducts;
	} catch (error) {
		console.error(error);
		return;
	}

	if (redirectLegacyPid()) return;

	const route = resolveRouteFromPath();
	currentSection = route.section;
	currentSub = route.sub;

	const initialSearchQuery = getCatalogSearchQueryFromUrl();
	if (initialSearchQuery) {
		searchQuery = initialSearchQuery.toLowerCase();
		const searchInput = document.querySelector('.search-form__input');
		if (searchInput) searchInput.value = initialSearchQuery;
		applyCatalogSearch(searchQuery, { updateUrl: false });
	} else if (route.kind === 'product') {
		const product =
			catalogProducts.find((item) => item.slug === route.productSlug) ||
			getProductByCardId(pageRoot?.dataset.productId || '') ||
			null;
		applyCatalogSeo(currentSection, currentSub, product);
	} else if (pageRoot?.dataset.catalogSsr !== 'true' && !document.querySelector('[data-catalog-ssr="true"]')) {
		renderProducts();
		updateHeader();
	} else {
		updateHeader();
	}

	// После SSR/рендера сетки браузер мог сбросить скролл — восстановить ещё раз
	restoreCatalogScrollPosition({ clear: true });

	document.addEventListener('catalogSearch', (event) => {
		const query = event.detail?.query || '';
		if (!document.querySelector('[data-catalog-grid]')) {
			window.location.href = `/catalog/?q=${encodeURIComponent(query)}`;
			return;
		}
		applyCatalogSearch(query);
	});
}
