import gulp from "gulp";
import { path } from "./gulp/config/path.js";
// import all plugins
import { plugins } from "./gulp/config/plugins.js";

global.app = {
	isBuild: process.argv.includes('--build'),
	isDev: !process.argv.includes('--build'),
	path: path,
	gulp: gulp,
	plugins: plugins
}

import { copy } from "./gulp/tasks/copy.js";
import { json } from "./gulp/tasks/json.js";
import { reset } from "./gulp/tasks/reset.js";
import { html } from "./gulp/tasks/html.js";
import { catalogPages } from "./gulp/tasks/catalog-pages.js";
import { blogPages } from "./gulp/tasks/blog-pages.js";
import { schemaHome } from "./gulp/tasks/schema-home.js";
import { server } from "./gulp/tasks/server.js";
import { scss } from "./gulp/tasks/scss.js";
import { js } from "./gulp/tasks/js.js";
import { images } from "./gulp/tasks/images.js";
import { favicon } from "./gulp/tasks/favicon.js";
import { otfToTtf, ttfToWoff, fonstStyle } from "./gulp/tasks/fonts.js";
import { svgSprive } from "./gulp/tasks/svgSprive.js";
import { zip } from "./gulp/tasks/zip.js";

const catalogSources = [
	`${path.srcFolder}/json/catalog.json`,
	`${path.srcFolder}/js/files/catalog-taxonomy.js`,
	`${path.srcFolder}/js/files/catalog-utils.js`,
	`${path.srcFolder}/js/files/catalog-schema.js`,
	`${path.srcFolder}/js/files/catalog-meta.js`,
	`${path.srcFolder}/js/files/blog-posts.js`,
	`${path.srcFolder}/js/files/markdown.js`,
	`${path.srcFolder}/js/files/shop-mode.js`,
	`${path.srcFolder}/html/**/*.*`,
];

function watcher() {
	gulp.watch(path.watch.files, copy);
	gulp.watch([
		`${path.srcFolder}/robots.txt`,
		`${path.srcFolder}/.htaccess`,
		`${path.srcFolder}/api/**/*.*`,
		`${path.srcFolder}/js/telegram-config.js`,
		`${path.srcFolder}/js/telegram-config.example.js`,
	], copy);
	gulp.watch([path.watch.html, path.watch.htmlPartials, `${path.srcFolder}/js/files/catalog-schema.js`], gulp.series(schemaHome, html, catalogPages, blogPages));
	gulp.watch(path.watch.scss, scss);
	gulp.watch(path.watch.js, js);
	gulp.watch(path.watch.images, images);
	gulp.watch(path.watch.logo, favicon);
	gulp.watch(path.watch.json, gulp.series(json, catalogPages));
	gulp.watch(catalogSources, gulp.series(schemaHome, catalogPages, blogPages));
	gulp.watch(`${path.srcFolder}/blog/**/*.md`, blogPages);
}

export { svgSprive }


// Последовательная обработака шрифтов
const fonts = gulp.series(otfToTtf, ttfToWoff, fonstStyle);

const mainTasks = gulp.series(
	fonts,
	schemaHome,
	gulp.parallel(copy, html, scss, json, js, favicon),
	// Картинки отдельно — не конкурируют с webpack за память
	images,
	catalogPages,
	blogPages
);

// create script to do tasks
const dev = gulp.series(reset, mainTasks, gulp.parallel(watcher, server));
const build = gulp.series(reset, mainTasks);
const deployZIP = gulp.series(reset, mainTasks, zip);
// const deployFTP = gulp.series(reset, mainTasks, ftp);

export { dev }
export { build }
export { deployZIP }
export { html }
export { catalogPages }
export { blogPages }
export { schemaHome }
export { images }
export { favicon }
// export { deployFTP }

gulp.task('default', dev);



// function json() {
// 	return src(path.src.json)
// 		.pipe(plumber())
// 		.pipe(dest(path.build.json))
// }
