import {
	catalogImageSrc,
	escapeHtml,
	formatProductPrice,
	getProductPrice,
	getProductText,
	getProductTitle,
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
		<article data-pid="${productId}" class="products__item item-product">
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


function parseCatalogHash() {
	const hash = window.location.hash.slice(1);
	if (!hash) return { section: null, sub: null };

	const slashIndex = hash.indexOf('/');
	if (slashIndex === -1) {
		return { section: hash, sub: null };
	}

	return {
		section: hash.slice(0, slashIndex),
		sub: hash.slice(slashIndex + 1) || null,
	};
}

function buildCatalogHash(sectionId, subId = null) {
	return subId ? `#${sectionId}/${subId}` : `#${sectionId}`;
}

function setCatalogHash(sectionId, subId = null) {
	const hash = buildCatalogHash(sectionId, subId);
	if (window.location.hash !== hash) {
		history.replaceState(null, '', hash);
	}
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
	const { section, sub } = parseCatalogHash();
	const firstSection = document.querySelector('[data-catalog-section]')?.dataset.catalogSection;

	if (section && isValidSection(section)) {
		return {
			section,
			sub: isValidSub(section, sub) ? sub : null,
		};
	}

	return {
		section: firstSection || 'loft-furniture',
		sub: null,
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

	const query = searchQuery;
	return (
		getProductTitle(product).toLowerCase().includes(query) ||
		getProductText(product).toLowerCase().includes(query) ||
		product.subcategoryTitle.toLowerCase().includes(query) ||
		product.categoryTitle.toLowerCase().includes(query)
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

function selectSection(sectionId, subId = null, updateHash = true, scrollToTop = false) {
	currentSection = sectionId;
	currentSub = subId;
	openSidebarSection(sectionId);
	updateHeader();
	renderProducts();
	setActiveSubLink();

	if (updateHash) {
		setCatalogHash(sectionId, subId);
	}

	if (scrollToTop) {
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
		const { section, sub } = getSectionFromHash();
		selectSection(section, sub, false, true);
	});
}

export async function initCatalogPage() {
	const grid = document.querySelector('[data-catalog-grid]');
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

	const { section, sub } = getSectionFromHash();
	initSidebarNavigation();
	selectSection(section, sub, false, Boolean(window.location.hash));

	if (!window.location.hash) {
		setCatalogHash(section, sub);
	}

	document.addEventListener('catalogSearch', (event) => {
		searchQuery = event.detail?.query || '';
		renderProducts();
	});
}
