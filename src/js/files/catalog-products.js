import {
	catalogImageSrc,
	escapeHtml,
	formatProductPrice,
	getProductPrice,
	getProductText,
	getProductTitle,
	parseCatalogHash,
	valuesMatchSearchQuery,
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

	return valuesMatchSearchQuery(
		searchQuery,
		getProductTitle(product),
		getProductText(product),
		product.subcategoryTitle,
		product.categoryTitle
	);
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
		return;
	}

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
		if (productId) {
			clearCatalogSearchInput();
		}
		selectSection(section, sub, false, !productId, productId);
	});
}

function initCatalogCtaForm() {
	const form = document.querySelector('.catalog-cta__form');
	if (!form) return;

	const fileInput = form.querySelector('[data-catalog-cta-file]');
	const fileName = form.querySelector('[data-catalog-cta-file-name]');

	fileInput?.addEventListener('change', () => {
		const file = fileInput.files?.[0];
		if (!fileName) return;

		if (file) {
			fileName.textContent = file.name;
			fileName.hidden = false;
		} else {
			fileName.textContent = '';
			fileName.hidden = true;
		}
	});

	form.addEventListener('reset', () => {
		if (fileName) {
			fileName.textContent = '';
			fileName.hidden = true;
		}
	});
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
	initSidebarNavigation();
	initCatalogProductPopup();

	if (productId) {
		clearCatalogSearchInput();
	}

	selectSection(section, sub, false, !productId, productId);

	if (!window.location.hash) {
		setCatalogHash(section, sub);
	}

	document.addEventListener('catalogSearch', (event) => {
		searchQuery = event.detail?.query || '';
		renderProducts();
	});
}
