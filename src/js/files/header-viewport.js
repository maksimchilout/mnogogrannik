/**
 * Прижимает fixed-хедер к визуальному верху экрана.
 * В Telegram / iOS WebView compensируем сдвиг через getBoundingClientRect.
 * Без transform — иначе ломается полноэкранное бургер-меню.
 */
export function initHeaderViewportPin() {
	const headerWrapper = document.querySelector('.header__wrapper');
	const headerBleed = document.querySelector('.header__bleed');
	const menuBody = document.querySelector('.menu__body');
	if (!headerWrapper) return;

	const isTelegram = (() => {
		const ua = navigator.userAgent || '';
		return (
			/Telegram/i.test(ua) ||
			typeof window.TelegramWebviewProxy !== 'undefined' ||
			typeof window.Telegram !== 'undefined'
		);
	})();

	if (isTelegram) {
		document.documentElement.classList.add('is-telegram');
	}

	const isMobileViewport = () => window.matchMedia('(max-width: 991.98px)').matches;
	const isMenuOpen = () => Boolean(menuBody?.classList.contains('_active'));

	const applyPin = (top, left, width) => {
		headerWrapper.style.top = `${top}px`;
		headerWrapper.style.left = left ? `${left}px` : '0px';
		if (width) headerWrapper.style.width = width;

		if (headerBleed) {
			headerBleed.style.top = `${top}px`;
			headerBleed.style.left = left ? `${left}px` : '0px';
			if (width) headerBleed.style.width = width;
		}
	};

	const clearPin = () => {
		headerWrapper.style.top = '';
		headerWrapper.style.left = '';
		headerWrapper.style.width = '';
		if (headerBleed) {
			headerBleed.style.top = '';
			headerBleed.style.left = '';
			headerBleed.style.width = '';
		}
	};

	const sync = () => {
		if (isMenuOpen() || !isMobileViewport()) {
			clearPin();
			return;
		}

		const vv = window.visualViewport;
		const vvTop = vv ? vv.offsetTop : 0;
		const vvLeft = vv ? vv.offsetLeft : 0;
		const width = vv ? `${vv.width}px` : '';

		// Базовый пин по visualViewport
		applyPin(vvTop, vvLeft, width);

		// Доп. компенсация: если хедер всё равно ниже верха экрана (типично для Telegram)
		const gap = headerWrapper.getBoundingClientRect().top;
		if (gap > 0.5) {
			applyPin(vvTop - gap, vvLeft, width);
		}
	};

	let ticking = false;
	const requestSync = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			ticking = false;
			sync();
		});
	};

	sync();
	window.addEventListener('scroll', requestSync, { passive: true });
	window.addEventListener('resize', requestSync);
	window.addEventListener('touchmove', requestSync, { passive: true });
	window.addEventListener('touchend', requestSync, { passive: true });

	if (window.visualViewport) {
		window.visualViewport.addEventListener('resize', requestSync);
		window.visualViewport.addEventListener('scroll', requestSync);
	}

	if (menuBody) {
		const menuObserver = new MutationObserver(requestSync);
		menuObserver.observe(menuBody, {
			attributes: true,
			attributeFilter: ['class'],
		});
	}
}
