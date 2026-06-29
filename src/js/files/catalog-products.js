import {
	catalogImageSrc,
	escapeHtml,
	formatProductPrice,
	getProductPrice,
	getProductText,
	getProductTitle,
	parseCatalogHash,
	titleMatchesSearchQuery,
	getCatalogSearchQueryFromUrl,
} from './catalog-utils.js';

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
	return `
		<article data-pid="${productId}" class="products__item item-product" data-catalog-popup>
			<a href="#" class="item-product__image -ibg">
				<img src="${imageSrc}" alt="${escapeHtml(title)}" loading="lazy">
			</a>
			<div class="item-product__body">
				<div class="item-product__content">
					<h3 class="item-product__title">${escapeHtml(title)}</h3>
					<div class="item-product__text">${escapeHtml(text)}</div>
				</div>
				<div class="item-product__prices">
					<div class="item-product__price-group">
						<div class="item-product__price">${price}</div>
					</div>
					<a href="" class="actions-product__button btn btn_white">В корзину</a>
				</div>
			</div>
		</article>
	`;
}

function getProductByCardId(cardId) {
	const productId = String(cardId).replace(/^c/, '');
	return catalogProducts.find((product) => String(product.id) === productId) || null;
}

function openCatalogProductPopup(product) {
	if (!product) return;

	const popup = document.getElementById('catalogProduct');
	const imageEl = popup?.querySelector('[data-catalog-popup-image]');
	const titleEl = popup?.querySelector('[data-catalog-popup-title]');
	const textEl = popup?.querySelector('[data-catalog-popup-text]');
	const priceEl = popup?.querySelector('[data-catalog-popup-price]');
	const productInput = popup?.querySelector('[data-catalog-popup-product-input]');
	const form = popup?.querySelector('[data-catalog-popup-form]');
	const openButton = document.querySelector('[data-catalog-popup-open]');

	if (!popup || !imageEl || !titleEl || !textEl || !priceEl || !openButton) return;

	const title = getProductTitle(product);
	const text = getProductText(product);
	const price = formatProductPrice(product);
	const imageSrc = catalogImageSrc(product.image);

	imageEl.src = imageSrc;
	imageEl.alt = title;
	titleEl.textContent = title;
	textEl.textContent = text;
	priceEl.textContent = price;
	if (productInput) productInput.value = title;
	form?.reset();
	if (productInput) productInput.value = title;

	openButton.click();
}

function initCatalogProductPopup() {
	const grid = document.querySelector('[data-catalog-grid]');
	if (!grid) return;

	grid.addEventListener('click', (event) => {
		if (event.target.closest('.actions-product__button')) return;

		const card = event.target.closest('[data-catalog-popup]');
		if (!card) return;

		event.preventDefault();
		event.stopPropagation();

		const product = getProductByCardId(card.dataset.pid);
		if (product) {
			openCatalogProductPopup(product);
		}
	});

	document.addEventListener('formSent', (event) => {
		const form = event.detail?.form;
		if (!form?.matches('[data-catalog-popup-form]')) return;
		form.reset();
	});
}


function parseCatalogHashFromLocation() {
	return parseCatalogHash(window.location.hash);
}

function buildCatalogHash(sectionId, subId = null, productId = null) {
	let hash = `#${sectionId}`;
	if (subId) hash += `/${subId}`;
	if (productId) hash += `/${productId}`;
	return hash;
}

function setCatalogHash(sectionId, subId = null, productId = null) {
	const hash = buildCatalogHash(sectionId, subId, productId);
	if (window.location.hash !== hash) {
		history.replaceState(null, '', hash);
	}
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
	history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

function setSearchUrlParam(query) {
	const url = new URL(window.location.href);
	const normalizedQuery = String(query || '').trim();
	if (!normalizedQuery) {
		clearSearchUrlParam();
		return;
	}
	url.searchParams.set('q', normalizedQuery);
	history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

function applyCatalogSearch(query, { updateUrl = true } = {}) {
	searchQuery = String(query || '').trim().toLowerCase();
	const searchInput = document.querySelector('.search-form__input');
	if (searchInput) searchInput.value = searchQuery;
	if (updateUrl) {
		if (searchQuery) setSearchUrlParam(searchQuery);
		else clearSearchUrlParam();
	}
	renderProducts();
	updateHeader();
}

function isValidSection(sectionId) {
	return Boolean(document.querySelector(`[data-catalog-section="${sectionId}"]`));
}

function isValidSub(sectionId, subId) {
	if (!subId) return false;
	return Boolean(
		document.querySelector(`[data-catalog-section="${sectionId}"] [data-catalog-sub="${subId}"]`)
	);
}

function getSectionFromHash() {
	const { section, sub, productId } = parseCatalogHashFromLocation();
	const firstSection = document.querySelector('[data-catalog-section]')?.dataset.catalogSection;

	if (productId) {
		const product = getProductByCardId(productId);
		if (product) {
			return {
				section: product.category,
				sub: product.subcategory,
				productId,
			};
		}
	}

	if (section && isValidSection(section)) {
		return {
			section,
			sub: isValidSub(section, sub) ? sub : null,
			productId: null,
		};
	}

	return {
		section: firstSection || 'loft-furniture',
		sub: null,
		productId: null,
	};
}

function getSectionTitle(sectionId) {
	const item = document.querySelector(`[data-catalog-section="${sectionId}"]`);
	return item?.querySelector('.catalog-sidebar__toggle-text')?.textContent.trim() || '';
}

function getSubTitle(sectionId, subId) {
	const link = document.querySelector(
		`[data-catalog-section="${sectionId}"] [data-catalog-sub="${subId}"]`
	);
	return link?.textContent.trim() || '';
}

function sectionHasSubs(sectionId) {
	return Boolean(
		document.querySelector(`[data-catalog-section="${sectionId}"] [data-catalog-sub]`)
	);
}

function getSubcategoryOrder(sectionId) {
	const links = document.querySelectorAll(
		`[data-catalog-section="${sectionId}"] [data-catalog-sub]`
	);
	return [...links].map((link) => link.dataset.catalogSub);
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
		return;
	}

	titleEl.textContent = getSectionTitle(currentSection);

	if (!sectionHasSubs(currentSection)) {
		subtitleEl.textContent = '';
		subtitleEl.hidden = true;
		return;
	}

	subtitleEl.hidden = false;
	subtitleEl.textContent = currentSub
		? getSubTitle(currentSection, currentSub)
		: 'Все подкатегории';
}

function productMatchesSearch(product) {
	if (!searchQuery) return true;

	return titleMatchesSearchQuery(getProductTitle(product), searchQuery);
}

function renderProducts() {
	const grid = document.querySelector('[data-catalog-grid]');
	const empty = document.querySelector('[data-catalog-empty]');
	if (!grid || !empty) return;

	let items = catalogProducts.filter((product) => product.category === currentSection);
	if (currentSub) {
		items = items.filter((product) => product.subcategory === currentSub);
	}
	if (searchQuery) {
		items = catalogProducts.filter((product) => productMatchesSearch(product));
	} else {
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

function openSidebarSection(sectionId) {
	document.querySelectorAll('[data-catalog-section]').forEach((item) => {
		const isTarget = item.dataset.catalogSection === sectionId;
		item.classList.toggle('catalog-sidebar__item_open', isTarget);
		item.querySelector('[data-catalog-toggle]')?.classList.toggle('_active', isTarget);
	});
}

function setActiveSubLink() {
	document.querySelectorAll('.catalog-sidebar__sub-link').forEach((link) => {
		const item = link.closest('[data-catalog-section]');
		const section = item?.dataset.catalogSection;
		const sub = link.dataset.catalogSub;
		const isActive = section === currentSection && sub === currentSub;
		link.classList.toggle('_active', Boolean(isActive));
	});
}

function scrollToCatalog() {
	requestAnimationFrame(() => {
		const catalog = document.querySelector('.page__catalog');
		const header = document.querySelector('.header');
		const headerOffset = header?.classList.contains('_scroll') ? 86 : 141;
		const top = catalog
			? catalog.getBoundingClientRect().top + window.scrollY - headerOffset
			: 0;

		window.scrollTo({
			top: Math.max(0, top),
			behavior: 'smooth',
		});
	});
}

function scrollToProductCard(productId) {
	requestAnimationFrame(() => {
		const card = document.querySelector(`[data-pid="${productId}"]`);
		if (!card) return;

		const header = document.querySelector('.header');
		const headerOffset = header?.classList.contains('_scroll') ? 86 : 141;
		const top = card.getBoundingClientRect().top + window.scrollY - headerOffset - 16;

		window.scrollTo({
			top: Math.max(0, top),
			behavior: 'smooth',
		});

		card.classList.add('_catalog-highlight');
		window.setTimeout(() => card.classList.remove('_catalog-highlight'), 2200);
	});
}

function selectSection(sectionId, subId = null, updateHash = true, scrollToTop = false, productId = null) {
	if (updateHash && searchQuery) {
		clearCatalogSearchInput();
		clearSearchUrlParam();
	}

	currentSection = sectionId;
	currentSub = subId;
	openSidebarSection(sectionId);
	updateHeader();
	renderProducts();
	setActiveSubLink();

	if (updateHash) {
		setCatalogHash(sectionId, subId, productId);
	}

	if (productId) {
		scrollToProductCard(productId);
	} else if (scrollToTop) {
		scrollToCatalog();
	}
}

function initSidebarNavigation() {
	const sidebar = document.querySelector('.catalog-sidebar');
	if (!sidebar) return;

	const items = sidebar.querySelectorAll('[data-catalog-section]');

	items.forEach((item) => {
		const sectionId = item.dataset.catalogSection;
		const toggle = item.querySelector('[data-catalog-toggle]');

		toggle?.addEventListener('click', () => {
			const isOpen = item.classList.contains('catalog-sidebar__item_open');

			if (isOpen) {
				item.classList.remove('catalog-sidebar__item_open');
				toggle.classList.remove('_active');
				return;
			}

			selectSection(sectionId, null, true, true);
		});

		item.querySelectorAll('[data-catalog-sub]').forEach((link) => {
			link.addEventListener('click', (event) => {
				if (link.getAttribute('href')?.startsWith('#')) {
					event.preventDefault();
				}

				selectSection(sectionId, link.dataset.catalogSub, true, true);
			});
		});
	});

	window.addEventListener('hashchange', () => {
		const { section, sub, productId } = getSectionFromHash();
		if (productId || searchQuery) {
			clearCatalogSearchInput();
			clearSearchUrlParam();
		}
		selectSection(section, sub, false, !productId, productId);
	});
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

			if (!previewUrls.has(key)) {
				previewUrls.set(key, URL.createObjectURL(file));
			}

			const item = document.createElement('div');
			item.className = 'catalog-cta__preview';

			const image = document.createElement('img');
			image.className = 'catalog-cta__preview-img';
			image.src = previewUrls.get(key);
			image.alt = file.name;

			const removeButton = document.createElement('button');
			removeButton.type = 'button';
			removeButton.className = 'catalog-cta__preview-remove';
			removeButton.setAttribute('aria-label', `Удалить фото ${file.name}`);
			removeButton.dataset.catalogCtaRemove = String(index);
			removeButton.textContent = '×';

			item.append(image, removeButton);
			previews.append(item);
		});
	};

	const clearFiles = () => {
		while (fileStore.items.length > 0) {
			fileStore.items.remove(0);
		}
		if (fileInput) {
			fileInput.value = '';
		}
		revokePreviewUrls();
		renderPreviews();
	};

	fileInput?.addEventListener('change', () => {
		Array.from(fileInput.files || []).forEach((file) => {
			const isDuplicate = Array.from(fileStore.files).some(
				(existing) => getCatalogCtaFileKey(existing) === getCatalogCtaFileKey(file)
			);

			if (!isDuplicate) {
				fileStore.items.add(file);
			}
		});

		syncFileInput();
		renderPreviews();
	});

	previews?.addEventListener('click', (event) => {
		const removeButton = event.target.closest('[data-catalog-cta-remove]');
		if (!removeButton) return;

		const index = Number(removeButton.dataset.catalogCtaRemove);
		if (Number.isNaN(index)) return;

		removeFileAt(index);
	});

	form.addEventListener('reset', clearFiles);
}

export async function initCatalogPage() {
	const grid = document.querySelector('[data-catalog-grid]');
	initCatalogCtaForm();
	if (!grid) return;

	try {
		const response = await fetch('json/catalog.json');
		if (!response.ok) throw new Error('catalog.json not found');
		const data = await response.json();
		catalogProducts = data.products || [];
	} catch (error) {
		console.error(error);
		return;
	}

	const { section, sub, productId } = getSectionFromHash();
	const initialSearchQuery = getCatalogSearchQueryFromUrl();
	initSidebarNavigation();
	initCatalogProductPopup();

	if (initialSearchQuery) {
		searchQuery = initialSearchQuery.toLowerCase();
		const searchInput = document.querySelector('.search-form__input');
		if (searchInput) searchInput.value = initialSearchQuery;
	} else if (productId) {
		clearCatalogSearchInput();
	}

	selectSection(section, sub, false, !productId && !initialSearchQuery, productId);

	if (!window.location.hash) {
		setCatalogHash(section, sub);
	}

	document.addEventListener('catalogSearch', (event) => {
		applyCatalogSearch(event.detail?.query || '');
	});
}
