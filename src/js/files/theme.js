const THEME_STORAGE_KEY = 'mnogogrannik-theme';

export function getStoredTheme() {
	return localStorage.getItem(THEME_STORAGE_KEY);
}

export function getPreferredTheme() {
	const stored = getStoredTheme();
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme);
}

export function initThemeToggle() {
	const toggle = document.querySelector('[data-theme-toggle]');
	if (!toggle) return;

	applyTheme(getPreferredTheme());

	toggle.addEventListener('click', () => {
		const current = document.documentElement.getAttribute('data-theme') || 'light';
		const next = current === 'dark' ? 'light' : 'dark';
		applyTheme(next);
		localStorage.setItem(THEME_STORAGE_KEY, next);
	});
}
