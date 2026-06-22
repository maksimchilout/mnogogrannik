
/*
Документация по работе в шаблоне: https://www.lightgalleryjs.com/docs/
Документация плагина: https://www.lightgalleryjs.com/docs/
Сниппет(HTML):
*/

// Подключение базового набора функционала
import lightGallery from 'lightgallery';

// Плагины
// lgZoom, lgAutoplay, lgComment, lgFullscreen, lgHash, lgPager, lgRotate, lgShare, lgThumbnail, lgVideo, lgMediumZoom
// import lgThumbnail from 'lightgallery/plugins/thumbnail'

// Базовые стили
// import '@/scss/libs/gallery/lightgallery.scss';
// Стили дополнений
// import '@scss/libs/gallery/lg-thumbnail.scss';
// import '@scss/libs/gallery/lg-video.scss';
// import '@scss/libs/gallery/lg-autoplay.scss';
// import '@scss/libs/gallery/lg-zoom.scss';
// import '@scss/libs/gallery/lg-pager.scss';
// import '@scss/libs/gallery/lg-fullscreen.scss';
// import '@scss/libs/gallery/lg-share.scss';
// import '@scss/libs/gallery/lg-comments.scss';s
// import '@scss/libs/gallery/lg-rotate.scss';
// import '@scss/libs/gallery/lg-medium-zoom.scss';
// import '@scss/libs/gallery/lg-relative-caption.scss';

// Все стили
// import '@scss/libs/gallery/lightgallery-bundle.scss';

function bindSideClickNavigation(gallery, lg) {
	gallery.addEventListener('lgAfterOpen', () => {
		const container = document.querySelector('.lg-container.lg-show');
		if (!container || container.dataset.sideNavBound) return;
		container.dataset.sideNavBound = 'true';

		const onSurfaceClick = (e) => {
			if (e.target.closest('.lg-close')) return;

			e.preventDefault();
			e.stopPropagation();

			if (e.clientX < window.innerWidth / 2) {
				lg.goToPrevSlide();
			} else {
				lg.goToNextSlide();
			}
		};

		const onSurfaceTouch = (e) => {
			if (e.target.closest('.lg-close')) return;

			const touch = e.changedTouches[0];
			if (!touch) return;

			e.preventDefault();
			e.stopPropagation();

			if (touch.clientX < window.innerWidth / 2) {
				lg.goToPrevSlide();
			} else {
				lg.goToNextSlide();
			}
		};

		container.addEventListener('click', onSurfaceClick, true);
		const touchOptions = { capture: true, passive: false };
		container.addEventListener('touchend', onSurfaceTouch, touchOptions);

		gallery.addEventListener(
			'lgBeforeClose',
			() => {
				container.removeEventListener('click', onSurfaceClick, true);
				container.removeEventListener('touchend', onSurfaceTouch, touchOptions);
				delete container.dataset.sideNavBound;
			},
			{ once: true }
		);
	});
}

// Запуск
export function initGalleries() {
	const galleries = document.querySelectorAll('[data-gallery]');
	if (galleries.length) {
		galleries.forEach((gallery) => {
			if (gallery.classList.contains('lg-initialized')) return;

			const sideNav = gallery.hasAttribute('data-gallery-side-nav');

			const lg = lightGallery(gallery, {
				licenseKey: '7EC452A9-0CFD441C-BD984C7C-17C8456E',
				speed: 500,
				selector: 'a',
				download: false,
				controls: false,
				...(sideNav && {
					closeOnTap: false,
					swipeToClose: false,
					loop: true,
					getCaptionFromTitleOrAlt: false,
				}),
			});

			if (sideNav) {
				bindSideClickNavigation(gallery, lg);
			}
		});
	}
}


