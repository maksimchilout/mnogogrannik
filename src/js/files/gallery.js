/*
Документация: https://www.lightgalleryjs.com/docs/
*/

import lightGallery from 'lightgallery';
import { isMobile, bodyLock, forceBodyUnlock } from './functions.js';

const TAP_MOVE_THRESHOLD = 12;

let galleryScrollY = 0;
let openGalleriesCount = 0;

function isTouchDevice() {
	return (
		isMobile.any()
		|| window.matchMedia('(pointer: coarse)').matches
		|| navigator.maxTouchPoints > 0
	);
}

function lockPageScroll() {
	if (openGalleriesCount === 0) {
		galleryScrollY = window.scrollY || window.pageYOffset || 0;
		bodyLock(0);
		document.body.style.position = 'fixed';
		document.body.style.top = `-${galleryScrollY}px`;
		document.body.style.left = '0';
		document.body.style.right = '0';
		document.body.style.width = '100%';
	}
	openGalleriesCount += 1;
}

function unlockPageScroll() {
	openGalleriesCount = Math.max(0, openGalleriesCount - 1);
	if (openGalleriesCount > 0) return;

	document.body.style.position = '';
	document.body.style.top = '';
	document.body.style.left = '';
	document.body.style.right = '';
	document.body.style.width = '';
	forceBodyUnlock();
	window.scrollTo(0, galleryScrollY);
}

function bindScrollLock(gallery) {
	gallery.addEventListener('lgAfterOpen', lockPageScroll);
	gallery.addEventListener('lgBeforeClose', unlockPageScroll);
}

function bindDesktopSideClickNavigation(gallery, lg) {
	gallery.addEventListener('lgAfterOpen', () => {
		const container = document.querySelector('.lg-container.lg-show');
		if (!container || container.dataset.sideNavBound) return;
		container.dataset.sideNavBound = 'true';

		const onSurfaceClick = (e) => {
			if (e.pointerType === 'touch') return;
			if (e.target.closest('.lg-close, .lg-next, .lg-prev, .lg-toolbar, .lg-components')) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			if (e.clientX < window.innerWidth / 2) {
				lg.goToPrevSlide();
			} else {
				lg.goToNextSlide();
			}
		};

		container.addEventListener('click', onSurfaceClick, true);

		gallery.addEventListener(
			'lgBeforeClose',
			() => {
				container.removeEventListener('click', onSurfaceClick, true);
				delete container.dataset.sideNavBound;
			},
			{ once: true }
		);
	});
}

/**
 * На тач-устройствах: короткий тап по половинам экрана листает,
 * горизонтальный свайп остаётся у lightGallery.
 */
function bindTouchTapNavigation(gallery, lg) {
	gallery.addEventListener('lgAfterOpen', () => {
		const container = document.querySelector('.lg-container.lg-show');
		if (!container || container.dataset.touchNavBound) return;
		container.dataset.touchNavBound = 'true';

		let startX = 0;
		let startY = 0;
		let tracking = false;

		const onTouchStart = (e) => {
			if (e.target.closest('.lg-close, .lg-toolbar, .lg-components')) {
				tracking = false;
				return;
			}

			const touch = e.changedTouches?.[0] || e.touches?.[0];
			if (!touch) return;

			tracking = true;
			startX = touch.clientX;
			startY = touch.clientY;
		};

		const onTouchEnd = (e) => {
			if (!tracking) return;
			tracking = false;

			if (e.target.closest('.lg-close, .lg-toolbar, .lg-components')) {
				return;
			}

			const touch = e.changedTouches?.[0];
			if (!touch) return;

			const deltaX = touch.clientX - startX;
			const deltaY = touch.clientY - startY;

			// Свайп — оставляем lightGallery
			if (Math.abs(deltaX) > TAP_MOVE_THRESHOLD || Math.abs(deltaY) > TAP_MOVE_THRESHOLD) {
				return;
			}

			if (touch.clientX < window.innerWidth / 2) {
				lg.goToPrevSlide();
			} else {
				lg.goToNextSlide();
			}
		};

		container.addEventListener('touchstart', onTouchStart, { passive: true });
		container.addEventListener('touchend', onTouchEnd, { passive: true });

		gallery.addEventListener(
			'lgBeforeClose',
			() => {
				container.removeEventListener('touchstart', onTouchStart);
				container.removeEventListener('touchend', onTouchEnd);
				delete container.dataset.touchNavBound;
			},
			{ once: true }
		);
	});
}

export function initGalleries() {
	const galleries = document.querySelectorAll('[data-gallery]');
	if (!galleries.length) return;

	const touchDevice = isTouchDevice();

	galleries.forEach((gallery) => {
		if (gallery.classList.contains('lg-initialized')) return;

		const sideNav = gallery.hasAttribute('data-gallery-side-nav');

		const lg = lightGallery(gallery, {
			licenseKey: '7EC452A9-0CFD441C-BD984C7C-17C8456E',
			speed: 400,
			selector: 'a',
			download: false,
			// Стрелки скрыты на таче и при side-nav (там клик/тап по половинам)
			controls: !touchDevice && !sideNav,
			enableSwipe: true,
			enableDrag: true,
			swipeThreshold: 50,
			swipeToClose: touchDevice,
			closeOnTap: false,
			loop: sideNav,
			getCaptionFromTitleOrAlt: false,
			mobileSettings: {
				controls: false,
				showCloseIcon: true,
				download: false,
			},
		});

		bindScrollLock(gallery);

		if (!sideNav) return;

		if (touchDevice) {
			bindTouchTapNavigation(gallery, lg);
		} else {
			bindDesktopSideClickNavigation(gallery, lg);
		}
	});
}
