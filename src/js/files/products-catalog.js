const HOME_PRODUCTS_INITIAL_VISIBLE = 8;

let currentFilter = 'all';
let applyFiltersCallback = null;

function initHomeProductsVisibility() {
	const section = document.querySelector('.page__products');
	if (!section) return;

	const productItems = section.querySelector('.products__items');
	const moreButton = section.querySelector('.products__more');
	if (!productItems) return;

	const items = productItems.querySelectorAll('.products__item');
	if (items.length <= HOME_PRODUCTS_INITIAL_VISIBLE) {
		moreButton?.remove();
		return;
	}

	items.forEach((item, index) => {
		if (index >= HOME_PRODUCTS_INITIAL_VISIBLE) {
			item.classList.add('_hidden');
		}
	});
}

export function showMoreHomeProducts(button) {
	const section = document.querySelector('.page__products');
	const productItems = section?.querySelector('.products__items');
	if (!productItems) return false;

	const hiddenItems = productItems.querySelectorAll('.products__item._hidden');
	if (!hiddenItems.length) return false;

	hiddenItems.forEach((item) => item.classList.remove('_hidden'));
	button.remove();
	document.dispatchEvent(new CustomEvent('productsUpdated'));
	return true;
}

function productMatchesFilters(item) {
	const hasSale = item.querySelector('.item-product__label_sale');
	const hasNew = item.querySelector('.item-product__label_new');

	if (currentFilter === 'sale') return Boolean(hasSale);
	if (currentFilter === 'new') return Boolean(hasNew);
	return true;
}

export function applyProductFilters() {
	const items = document.querySelectorAll('.products__item');
	const emptyEl = document.querySelector('.products__empty');
	let visibleCount = 0;

	items.forEach((item) => {
		const visible = productMatchesFilters(item);
		item.classList.toggle('_hidden', !visible);
		if (visible) visibleCount += 1;
	});

	if (emptyEl) {
		emptyEl.hidden = visibleCount > 0;
	}
}

export function initProductCatalog() {
	const filterButtons = document.querySelectorAll('[data-filter]');
	const productsSection = document.querySelector('.page__products');

	if (!document.querySelector('.products__items')) return;

	initHomeProductsVisibility();
	applyFiltersCallback = applyProductFilters;

	filterButtons.forEach((button) => {
		button.addEventListener('click', () => {
			filterButtons.forEach((btn) => btn.classList.remove('_active'));
			button.classList.add('_active');
			currentFilter = button.dataset.filter || 'all';
			applyProductFilters();
			productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});

	document.addEventListener('productsUpdated', applyProductFilters);
}

export function refreshProductFilters() {
	if (applyFiltersCallback) {
		applyFiltersCallback();
	} else {
		applyProductFilters();
	}
}
