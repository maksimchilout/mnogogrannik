import fs from "fs";
import path from "path";
import merge from "merge-stream";
import rename from "gulp-rename";

export const copy = () => {
	const filesStream = app.gulp
		.src(app.path.src.files, { allowEmpty: true })
		.pipe(app.gulp.dest(app.path.build.files));

	const seoStream = app.gulp
		.src(
			[
				`${app.path.srcFolder}/robots.txt`,
				`${app.path.srcFolder}/.htaccess`,
			],
			{ allowEmpty: true }
		)
		.pipe(app.gulp.dest(app.path.buildFolder));

	const apiStream = app.gulp
		.src(`${app.path.srcFolder}/api/**/*.*`, { allowEmpty: true })
		.pipe(app.gulp.dest(`${app.path.buildFolder}/api`));

	const telegramConfigPath = path.resolve(
		`${app.path.srcFolder}/js/telegram-config.js`
	);
	const telegramConfigExample = path.resolve(
		`${app.path.srcFolder}/js/telegram-config.example.js`
	);
	const telegramSrc = fs.existsSync(telegramConfigPath)
		? telegramConfigPath
		: telegramConfigExample;

	const telegramStream = app.gulp
		.src(telegramSrc, { allowEmpty: true })
		.pipe(rename("telegram-config.js"))
		.pipe(app.gulp.dest(`${app.path.buildFolder}/js`));

	return merge(filesStream, seoStream, apiStream, telegramStream);
};
