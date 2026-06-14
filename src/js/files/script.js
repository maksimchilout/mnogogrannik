// Импорт функционала ==============================================================================================================================================================================================================================================================================================================================
import { isMobile } from "./functions.js";
import { removeClasses } from "./functions.js";
import {
	addToCartStorage,
	removeFromCartStorage,
	restoreCartFromStorage,
} from "./cart.js";
import { initProductCatalog } from "./products-catalog.js";

function formatPrice(value) {
	if (!value) return '';
	return `${String(value).replace(/\./g, ' ')} ₽`;
}

window.onload = function () {
	restoreCartFromStorage();
	initProductCatalog();
	initSubscribeForm();

	document.addEventListener("click", documentActions);

	function documentActions(e) {
		const targetElement = e.target;

		if (window.innerWidth > 768 && isMobile.any()) {
			if (targetElement.classList.contains('menu__arrow')) {
				targetElement.closest('.menu__item').classList.toggle('_hover');
			}
			if (!targetElement.closest('.menu__item') && document.querySelectorAll('.menu__item._hover').length > 0) {
				removeClasses(document.querySelectorAll('.menu__item._hover'), "_hover");
			}
		}
		if (targetElement.classList.contains('search-form__icon')) {
			document.querySelector('.search-form').classList.toggle('_active');
		} else if (!targetElement.closest('.search-form') && document.querySelector('.search-form._active')) {
			document.querySelector('.search-form').classList.remove('_active');
		}
		if (targetElement.classList.contains('products__more')) {
			getProducts(targetElement);
			e.preventDefault();
		}
		if (targetElement.classList.contains('actions-product__button')) {
			const productId = targetElement.closest('.item-product').dataset.pid;
			addToCart(targetElement, productId);
			e.preventDefault();
		}

		if (targetElement.classList.contains('cart-header__icon') || targetElement.closest('.cart-header__icon')) {
			if (document.querySelector('.cart-list').children.length > 0) {
				document.querySelector('.cart-header').classList.toggle('_active');
			}
			e.preventDefault();
		} else if (!targetElement.closest('.cart-header') && !targetElement.classList.contains('actions-product__button')) {
			document.querySelector('.cart-header').classList.remove('_active');
		}

		if (targetElement.classList.contains('cart-list__delete')) {
			const productId = targetElement.closest('.cart-list__item').dataset.cartPid;
			removeFromCartStorage(productId);
			e.preventDefault();
		}
	}

	const headerElement = document.querySelector('.header');

	if (headerElement) {
		const callback = function (entries) {
			if (entries[0].isIntersecting) {
				headerElement.classList.remove('_scroll');
			} else {
				headerElement.classList.add('_scroll');
			}
		};
		const headerObserver = new IntersectionObserver(callback);
		headerObserver.observe(headerElement);
	}

	async function getProducts(button) {
		if (!button.classList.contains('_hold')) {
			button.classList.add('_hold');
			const file = "json/products.json";
			let response = await fetch(file, {
				method: "GET"
			});
			if (response.ok) {
				let result = await response.json();
				loadProducts(result);
				button.classList.remove('_hold');
				button.remove();
				document.dispatchEvent(new CustomEvent('productsUpdated'));
			} else {
				alert("Ошибка загрузки товаров");
				button.classList.remove('_hold');
			}
		}
	}

	function loadProducts(data) {
		const productItems = document.querySelector('.products__items');
		data.products.forEach(item => {
			const productId = item.id;
			const productUrl = item.url;
			const productImage = item.image;
			const productTitle = item.title;
			const productText = item.text;
			const productPrice = item.price;
			const productOldPrice = item.priceOld;
			const productShareUrl = item.shareUrl || '#';
			const productLikeUrl = item.likeUrl || '#';
			const productLabels = Array.isArray(item.labels) ? item.labels : [];

			let productTemplateStart = `<article data-pid="${productId}" class="products__item item-product">`;
			let productTemplateEnd = `</article>`;

			let productTemplateLabels = ``;
			if (productLabels.length) {
				let productTemplateLabelStart = `<div class="item-product__labels">`;
				let productTemplateLabelEnd = `</div>`;
				let productTemplateLabelContent = ``;

				productLabels.forEach(labelItem => {
					productTemplateLabelContent += `<div class="item-product__label item-product__label_${labelItem.type}">${labelItem.value}</div>`
				});

				productTemplateLabels += productTemplateLabelStart;
				productTemplateLabels += productTemplateLabelContent;
				productTemplateLabels += productTemplateLabelEnd;
			}

			let productTemplateImage = `<a href="${productUrl}" class="item-product__image -ibg"><img src="img/products/${productImage}" alt="${productTitle}"></a>`;

			let productTemplateBodyStart = `<div class="item-product__body">`;
			let productTemplateBodyEnd = `</div>`;

			let productTemplateContent = `
				<div class="item-product__content">
					<h3 class="item-product__title">${productTitle}</h3>
					<div class="item-product__text">${productText}</div>
				</div>
			`;

			let productTemplatePrices = '';
			let productTemplatePricesStart = '<div class="item-product__prices">';
			let productTemplatePricesCurrent = `<div class="item-product__price">${formatPrice(productPrice)}</div>`;
			let productTemplatePricesOld = `<div class="item-product__price item-product__price_old">${formatPrice(productOldPrice)}</div>`;
			let productTemplatePricesEnd = `</div>`;

			productTemplatePrices = productTemplatePricesStart;
			productTemplatePrices += productTemplatePricesCurrent;
			if (productOldPrice) {
				productTemplatePrices += productTemplatePricesOld;
			}
			productTemplatePrices += productTemplatePricesEnd;

			let productTEmplateActions = `
			<div class="item-product__actions actions-product">
				<div class="actions-product__body">
					<a href="" class="actions-product__button btn btn_white">В корзину</a>
					<a href="${productShareUrl}" class="actions-product__link _icon-share">Поделиться</a>
					<a href="${productLikeUrl}" class="actions-product__link _icon-favorite">В избранное</a>
				</div>
			</div>
			`;

			let productTemplateBody = '';
			productTemplateBody += productTemplateBodyStart;
			productTemplateBody += productTemplateContent;
			productTemplateBody += productTemplatePrices;
			productTemplateBody += productTEmplateActions;
			productTemplateBody += productTemplateBodyEnd;

			let productTemplate = '';
			productTemplate += productTemplateStart;
			productTemplate += productTemplateLabels;
			productTemplate += productTemplateImage;
			productTemplate += productTemplateBody;
			productTemplate += productTemplateEnd;

			productItems.insertAdjacentHTML('beforeend', productTemplate);
		});
	}

	function addToCart(productButton, productId) {
		if (!productButton.classList.contains('_hold')) {
			productButton.classList.add('_hold');
			productButton.classList.add('_fly');

			const cart = document.querySelector('.cart-header__icon');
			const product = document.querySelector(`[data-pid="${productId}"]`);
			const productImage = product.querySelector('.item-product__image');

			const productImageFly = productImage.cloneNode(true);

			const productImageFlyWidth = productImage.offsetWidth;
			const productImageFlyHeight = productImage.offsetHeight;
			const productImageFlyTop = productImage.getBoundingClientRect().top;
			const productImageFlyleft = productImage.getBoundingClientRect().left;

			productImageFly.setAttribute('class', '_flyImage -ibg');
			productImageFly.style.cssText =
				`
			left: ${productImageFlyleft}px;
			top: ${productImageFlyTop}px;
			width: ${productImageFlyWidth}px;
			height: ${productImageFlyHeight}px;
			`;

			document.body.append(productImageFly);

			const cartFlyLeft = cart.getBoundingClientRect().left;
			const cartFlyTop = cart.getBoundingClientRect().top;

			productImageFly.style.cssText =
				`
			left: ${cartFlyLeft}px;
			top: ${cartFlyTop}px;
			width: 0px;
			height: 0px;
			opacity: 0;
			`;

			productImageFly.addEventListener('transitionend', function () {
				if (productButton.classList.contains('_fly')) {
					productImageFly.remove();
					addToCartStorage(productId, product);
					productButton.classList.remove('_fly');
					productButton.classList.remove('_hold');
				}
			});
		}
	}
}

function initSubscribeForm() {
	document.addEventListener('formSent', (e) => {
		const form = e.detail.form;

		if (form.dataset.message === 'subscribe') {
			const success = form.parentElement.querySelector('.subscribe__success');
			if (success) {
				success.hidden = false;
				setTimeout(() => {
					success.hidden = true;
				}, 4000);
			}
		}
	});
}

function bildSliders() {
	let sliders = document.querySelectorAll('[class*="_swiper"]:not(.swiper-wrapper)');
	if (sliders) {
		for (let index = 0; index < sliders.length; index++) {
			let slider = sliders[index];
			if (!slider.classList.contains('swiper-bild')) {
				let slider_items = slider.children;
				if (slider_items) {
					for (let index = 0; index < slider_items.length; index++) {
						let el = slider_items[index];
						el.classList.add('swiper-slide');
					}
				}
				let slider_content = slider.innerHTML;
				let slider_wraper = document.createElement('div');
				slider_wraper.classList.add('swiper-wrapper');
				slider_wraper.innerHTML = slider_content;
				slider.innerHTML = '';
				slider.appendChild(slider_wraper);
				slider.classList.add('swiper-bild');

				if (slider.classList.contains('_swiper_scroll')) {
					let sliderScroll = document.createElement('div');
					sliderScroll.classList.add('swier-scrollbar');
					slider.appendChild(sliderScroll);
				}
			}
		}
	}
}

function initSliders() {
	bildSliders();

	if (document.querySelector('.slider-main__body')) {
		new Swiper('.slider-main__body', {
			loop: true,
			observer: true,
			observeParents: true,
			slidesPerView: 1,
			spaceBetween: 32,
			watchOverflow: true,
			speed: 800,
			autoplay: {
				delay: 3000,
			},
			loopAdditionalSlides: 5,
			preloadImages: false,
			parallax: true,
			autoHeight: true,
			pagination: {
				el: '.controls-slider-main__dotts',
				clickable: true,
			},
			navigation: {
				nextEl: '.slider-main .slider-arrow_next',
				prevEl: '.slider-main .slider-arrow_prev',
			},
		});
	}

	if (document.querySelector('.slider-rooms__body')) {
		new Swiper('.slider-rooms__body', {
			loop: true,
			observer: true,
			observeParents: true,
			slidesPerView: 'auto',
			spaceBetween: 25,
			watchOverflow: true,
			speed: 800,
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
			},
			loopAdditionalSlides: 5,
			preloadImages: false,
			parallax: true,
			pagination: {
				el: '.slider-rooms__dotts',
				clickable: true,
			},
			navigation: {
				nextEl: '.slider-rooms .slider-arrow_next',
				prevEl: '.slider-rooms .slider-arrow_prev',
			},
		});
	}

	if (document.querySelector('.slider-tips__body')) {
		new Swiper('.slider-tips__body', {
			observer: true,
			observeParents: true,
			slidesPerView: 3,
			spaceBetween: 32,
			watchOverflow: true,
			loop: true,
			speed: 800,
			pagination: {
				el: '.slider-tips__dotts',
				clickable: true,
			},
			navigation: {
				nextEl: '.slider-tips .slider-arrow_next',
				prevEl: '.slider-tips .slider-arrow_prev',
			},
			breakpoints: {
				320: {
					slidesPerView: 1.1,
					spaceBetween: 15
				},
				768: {
					slidesPerView: 2,
					spaceBetween: 20
				},
				992: {
					slidesPerView: 3,
					spaceBetween: 32
				},
			}
		});
	}

	const furniture = document.querySelector('.furniture__body');
	if (furniture && !isMobile.any()) {
		const furnitureItems = document.querySelector('.furniture__items');
		const furnitureColumn = document.querySelectorAll('.furniture__column');

		const speed = furniture.dataset.speed;

		let positionX = 0;
		let coordXprocent = 0;

		function setMouseGalleryStyle() {
			let furnitureItemWidth = 0;
			furnitureColumn.forEach(element => {
				furnitureItemWidth += element.offsetWidth;
			});

			const furnitureDifferent = furnitureItemWidth - furniture.offsetWidth;
			const distX = Math.floor(coordXprocent - positionX);

			positionX = positionX + (distX * speed);
			let position = furnitureDifferent / 200 * positionX;

			furnitureItems.style.cssText = `transform: translate3d(${-position}px,0,0);`;

			if (Math.abs(distX) > 0) {
				requestAnimationFrame(setMouseGalleryStyle);
			} else {
				furniture.classList.remove('_init');
			}
		}
		furniture.addEventListener("mousemove", function (e) {
			const furnitureWidth = furniture.offsetWidth;
			const coordX = e.pageX - furnitureWidth / 2;
			coordXprocent = coordX / furnitureWidth * 200;

			if (!furniture.classList.contains('_init')) {
				requestAnimationFrame(setMouseGalleryStyle);
				furniture.classList.add('_init');
			}
		})
	}
}

window.addEventListener("load", function () {
	initSliders();
});
