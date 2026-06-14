let currentFilter = 'all';
let currentQuery = '';
let applyFiltersCallback = null;

function productMatchesFilters(item) {
	const title = item.querySelector('.item-product__title')?.textContent.toLowerCase() || '';
	const text = item.querySelector('.item-product__text')?.textContent.toLowerCase() || '';
	const matchesSearch = !currentQuery || title.includes(currentQuery) || text.includes(currentQuery);
	const hasSale = item.querySelector('.item-product__label_sale');
	const hasNew = item.querySelector('.item-product__label_new');
	let matchesFilter = true;

	if (currentFilter === 'sale') matchesFilter = Boolean(hasSale);
	if (currentFilter === 'new') matchesFilter = Boolean(hasNew);

	return matchesSearch && matchesFilter;
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
	const searchInput = document.querySelector('.search-form__input');
	const searchForm = document.querySelector('.search-form__item');
	const filterButtons = document.querySelectorAll('[data-filter]');
	const productsSection = document.querySelector('.page__products');

	if (!document.querySelector('.products__items')) return;

	applyFiltersCallback = applyProductFilters;

	searchInput?.addEventListener('input', () => {
		currentQuery = searchInput.value.trim().toLowerCase();
		applyProductFilters();
	});

	searchForm?.addEventListener('submit', (e) => {
		e.preventDefault();
		currentQuery = searchInput.value.trim().toLowerCase();
		applyProductFilters();
		productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		document.querySelector('.search-form')?.classList.remove('_active');
	});

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
