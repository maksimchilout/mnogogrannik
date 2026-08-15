import del from "del";

export const reset = () => {
	// В dev не трогаем img и fonts — иначе OOM на сотнях фото и на ttf2woff2
	if (app.isDev) {
		return del([
			`${app.path.buildFolder}/**/*`,
			`!${app.path.buildFolder}/img`,
			`!${app.path.buildFolder}/img/**`,
			`!${app.path.buildFolder}/fonts`,
			`!${app.path.buildFolder}/fonts/**`,
		]);
	}

	return del(app.path.clean);
};
