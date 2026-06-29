import {
	changeCartItemQuantity,
	clearCart,
	formatCartPrice,
	getCart,
	getCartTotalPrice,
	removeCartItem,
} from './cart.js';
import { submitCheckoutTelegramOrder } from './telegram-orders.js';

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderCheckoutItem(productId, item) {
	const quantity = item.quantity || 1;
	const linePrice = (item.price || 0) * quantity;

	return `
		<li class="checkout-summary__item" data-checkout-pid="${productId}">
			<div class="checkout-summary__image -ibg">
				<img src="${item.image}" alt="${escapeHtml(item.alt || item.title)}">
			</div>
			<div class="checkout-summary__info">
				<h3 class="checkout-summary__title">${escapeHtml(item.title)}</h3>
				<div class="checkout-summary__meta">
					<span class="checkout-summary__unit">${formatCartPrice(item.price || 0)} / шт.</span>
					<span class="checkout-summary__price">${formatCartPrice(linePrice)}</span>
				</div>
			</div>
			<div class="checkout-summary__actions">
				<div class="checkout-quantity" data-checkout-quantity>
					<button
						type="button"
						class="checkout-quantity__button checkout-quantity__button_minus"
						data-checkout-qty-minus
						aria-label="Уменьшить количество"
						${quantity <= 1 ? 'disabled' : ''}
					></button>
					<span class="checkout-quantity__value" data-checkout-qty-value>${quantity}</span>
					<button
						type="button"
						class="checkout-quantity__button checkout-quantity__button_plus"
						data-checkout-qty-plus
						aria-label="Увеличить количество"
					></button>
				</div>
				<button
					type="button"
					class="checkout-summary__remove"
					data-checkout-remove
					aria-label="Удалить ${escapeHtml(item.title)}"
				>
					<img src="img/icons/close.svg" alt="">
				</button>
			</div>
		</li>
	`;
}

function renderCheckoutItems() {
	const list = document.querySelector('[data-checkout-items]');
	const empty = document.querySelector('[data-checkout-empty]');
	const layout = document.querySelector('[data-checkout-layout]');
	const totalEl = document.querySelector('[data-checkout-total]');
	const submitButton = document.querySelector('[data-checkout-submit]');

	if (!list || !empty || !layout) return;

	const cart = getCart();
	const entries = Object.entries(cart);

	list.innerHTML = '';

	if (!entries.length) {
		empty.hidden = false;
		layout.hidden = true;
		if (submitButton) submitButton.disabled = true;
		return;
	}

	empty.hidden = true;
	layout.hidden = false;
	if (submitButton) submitButton.disabled = false;

	entries.forEach(([productId, item]) => {
		list.insertAdjacentHTML('beforeend', renderCheckoutItem(productId, item));
	});

	if (totalEl) {
		totalEl.textContent = formatCartPrice(getCartTotalPrice(cart));
	}
}

function showCheckoutSuccess() {
	const overlay = document.querySelector('[data-checkout-success-overlay]');
	const success = document.querySelector('[data-checkout-success]');

	clearCart();
	document.querySelector('[data-checkout-layout]')?.setAttribute('hidden', '');
	document.querySelector('[data-checkout-empty]')?.setAttribute('hidden', '');
	document.querySelector('[data-checkout-form]')?.setAttribute('hidden', '');

	if (overlay) overlay.hidden = false;
	if (success) {
		success.classList.remove('_show');
		requestAnimationFrame(() => {
			success.classList.add('_show');
		});
	}

	document.body.classList.add('checkout-success-open');
}

function initCheckoutInteractions() {
	const list = document.querySelector('[data-checkout-items]');
	if (!list) return;

	list.addEventListener('click', (event) => {
		const itemEl = event.target.closest('[data-checkout-pid]');
		if (!itemEl) return;

		const productId = itemEl.dataset.checkoutPid;

		if (event.target.closest('[data-checkout-remove]')) {
			removeCartItem(productId);
			renderCheckoutItems();
			return;
		}

		if (event.target.closest('[data-checkout-qty-minus]')) {
			const quantity = getCart()[productId]?.quantity || 1;
			if (quantity <= 1) return;

			changeCartItemQuantity(productId, -1);
			renderCheckoutItems();
			return;
		}

		if (event.target.closest('[data-checkout-qty-plus]')) {
			changeCartItemQuantity(productId, 1);
			renderCheckoutItems();
		}
	});
}

function initCheckoutForm() {
	const form = document.querySelector('[data-checkout-form]');
	const submitButton = document.querySelector('[data-checkout-submit]');

	if (!form) return;

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		if (!Object.keys(getCart()).length) return;
		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		if (submitButton) submitButton.disabled = true;
		form.classList.add('_sending');

		try {
			await submitCheckoutTelegramOrder(form);
			showCheckoutSuccess();
		} catch (error) {
			alert('Не удалось отправить заказ. Попробуйте позже или позвоните нам.');
			console.error(error);
			if (submitButton) submitButton.disabled = false;
		} finally {
			form.classList.remove('_sending');
		}
	});
}

export function initCheckoutPage() {
	if (!document.querySelector('[data-checkout-page]')) return;

	renderCheckoutItems();
	initCheckoutInteractions();
	initCheckoutForm();
}
