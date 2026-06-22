let currentFilter = 'all';
let applyFiltersCallback = null;

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
