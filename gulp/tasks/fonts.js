import fs from 'fs';
import path from 'path';
import fonter from 'gulp-fonter';

const fontsCacheDir = path.resolve('.fonts-cache');

function ensureDir(dir) {
	fs.mkdirSync(dir, { recursive: true });
}

function listFontFiles(dir, ext) {
	if (!fs.existsSync(dir)) return [];
	return fs.readdirSync(dir).filter((name) => name.toLowerCase().endsWith(ext));
}

function fontsDirHasFiles(dir, ext) {
	return listFontFiles(dir, ext).length > 0;
}

function copyFonts(fromDir, toDir, extList = ['.woff', '.woff2']) {
	if (!fs.existsSync(fromDir)) return 0;
	ensureDir(toDir);
	let copied = 0;
	for (const name of fs.readdirSync(fromDir)) {
		const lower = name.toLowerCase();
		if (!extList.some((ext) => lower.endsWith(ext))) continue;
		fs.copyFileSync(path.join(fromDir, name), path.join(toDir, name));
		copied += 1;
	}
	return copied;
}

function runGulpStream(stream) {
	return new Promise((resolve, reject) => {
		stream.on('end', resolve);
		stream.on('finish', resolve);
		stream.on('error', reject);
	});
}

async function convertTtfToWoff() {
	ensureDir(app.path.build.fonts);
	const stream = app.gulp
		.src(`${app.path.srcFolder}/fonts/*.ttf`, { allowEmpty: true })
		.pipe(
			app.plugins.plumber(
				app.plugins.notify.onError({
					title: 'FONTS',
					message: 'Error: <%= error.message %>',
				})
			)
		)
		.pipe(
			fonter({
				formats: ['woff'],
			})
		)
		.pipe(app.gulp.dest(app.path.build.fonts));

	await runGulpStream(stream);
}

async function convertTtfToWoff2() {
	const ttf2woff2 = (await import('gulp-ttf2woff2')).default;
	const stream = app.gulp
		.src(`${app.path.srcFolder}/fonts/*.ttf`, { allowEmpty: true })
		.pipe(
			app.plugins.plumber(
				app.plugins.notify.onError({
					title: 'FONTS',
					message: 'Error: <%= error.message %>',
				})
			)
		)
		.pipe(ttf2woff2())
		.pipe(app.gulp.dest(app.path.build.fonts));

	await runGulpStream(stream);
}

function restoreFromCache() {
	const copied = copyFonts(fontsCacheDir, app.path.build.fonts);
	if (copied) {
		console.log(`Шрифты восстановлены из .fonts-cache (${copied} файлов).`);
	}
	return copied > 0;
}

function saveToCache() {
	const copied = copyFonts(app.path.build.fonts, fontsCacheDir);
	if (copied) {
		console.log(`Шрифты сохранены в .fonts-cache (${copied} файлов).`);
	}
}

export const otfToTtf = () => {
	return app.gulp
		.src(`${app.path.srcFolder}/fonts/*.otf`, { allowEmpty: true })
		.pipe(
			app.plugins.plumber(
				app.plugins.notify.onError({
					title: 'FONTS',
					message: 'Error: <%= error.message %>',
				})
			)
		)
		.pipe(
			fonter({
				formats: ['ttf'],
			})
		)
		.pipe(app.gulp.dest(`${app.path.srcFolder}/fonts/`));
};

export const ttfToWoff = async () => {
	ensureDir(app.path.build.fonts);

	// Dev: если шрифты уже на месте — ничего не делаем
	if (
		app.isDev &&
		fontsDirHasFiles(app.path.build.fonts, '.woff') &&
		fontsDirHasFiles(app.path.build.fonts, '.woff2')
	) {
		console.log('Шрифты в dist/fonts уже есть — пропускаем конвертацию.');
		return;
	}

	// Быстрый путь: взять из кэша (особенно важно после reset на build)
	if (
		!fontsDirHasFiles(app.path.build.fonts, '.woff2') &&
		fontsDirHasFiles(fontsCacheDir, '.woff2')
	) {
		restoreFromCache();
		if (
			fontsDirHasFiles(app.path.build.fonts, '.woff') &&
			fontsDirHasFiles(app.path.build.fonts, '.woff2')
		) {
			return;
		}
	}

	// .woff всегда через fonter (без WASM)
	try {
		await convertTtfToWoff();
	} catch (error) {
		console.warn('Не удалось сконвертировать TTF→WOFF:', error.message || error);
		restoreFromCache();
	}

	// .woff2 через ttf2woff2 (может упасть по OOM)
	try {
		await convertTtfToWoff2();
		saveToCache();
	} catch (error) {
		console.warn('ttf2woff2 недоступен (часто OOM). Пробуем кэш / продолжаем с .woff.');
		console.warn(String(error?.message || error));
		restoreFromCache();

		// Если woff2 так и нет — build не валим: браузеры возьмут .woff
		if (!fontsDirHasFiles(app.path.build.fonts, '.woff2')) {
			console.warn('woff2 не собран. В fonts.scss останется fallback на .woff.');
		} else {
			saveToCache();
		}
	}

	// На всякий случай: если после всего пусто — хотя бы кэш
	if (
		!fontsDirHasFiles(app.path.build.fonts, '.woff') &&
		!fontsDirHasFiles(app.path.build.fonts, '.woff2')
	) {
		if (!restoreFromCache()) {
			throw new Error(
				'Нет шрифтов в dist/fonts и в .fonts-cache. Запустите сборку шрифтов, когда будет достаточно памяти, или положите .woff/.woff2 в .fonts-cache/'
			);
		}
	}
};

export const fonstStyle = () => {
	let fontsFile = `${app.path.srcFolder}/scss/fonts.scss`;
	app.isFontsReW ? fs.unlink(fontsFile, cb) : null;
	fs.readdir(app.path.build.fonts, function (err, fontsFiles) {
		if (fontsFiles && fontsFiles.length) {
			if (!fs.existsSync(fontsFile)) {
				fs.writeFile(fontsFile, '', cb);
				let newFileOnly;
				for (var i = 0; i < fontsFiles.length; i++) {
					let fontFileName = fontsFiles[i].split('.')[0];
					if (newFileOnly !== fontFileName) {
						let fontName = fontFileName.split('-')[0]
							? fontFileName.split('-')[0]
							: fontFileName;
						let fontWeight = fontFileName.split('-')[1]
							? fontFileName.split('-')[1]
							: fontFileName;
						if (fontWeight.toLowerCase() === 'thin') {
							fontWeight = 100;
						} else if (fontWeight.toLowerCase() === 'extralight') {
							fontWeight = 200;
						} else if (fontWeight.toLowerCase() === 'light') {
							fontWeight = 300;
						} else if (fontWeight.toLowerCase() === 'medium') {
							fontWeight = 500;
						} else if (fontWeight.toLowerCase() === 'semibold') {
							fontWeight = 600;
						} else if (fontWeight.toLowerCase() === 'bold') {
							fontWeight = 700;
						} else if (
							fontWeight.toLowerCase() === 'extrabold' ||
							fontWeight.toLowerCase() === 'heavy'
						) {
							fontWeight = 800;
						} else if (fontWeight.toLowerCase() === 'black') {
							fontWeight = 900;
						} else {
							fontWeight = 400;
						}
						fs.appendFile(
							fontsFile,
							`@font-face {\n\tfont-family: ${fontName};\n\tfont-display: swap;\n\tsrc: url("../fonts/${fontFileName}.woff2") format("woff2"), url("../fonts/${fontFileName}.woff") format("woff");\n\tfont-weight: ${fontWeight};\n\tfont-style: normal;\n}\r\n`,
							cb
						);
						newFileOnly = fontFileName;
					}
				}
			} else {
				console.log(
					'Файл scss/fonts/fonts.scss уже существует. Для обновления файла нужно его удалить!'
				);
			}
		} else {
			if (fs.existsSync(fontsFile)) {
				fs.unlink(fontsFile, cb);
			}
		}
	});
	return app.gulp.src(`${app.path.srcFolder}`);
};

function cb() {}
