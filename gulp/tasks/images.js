import { Transform } from "stream";
import sharp from "sharp";
import webp from "gulp-webp";

function imagesErrorHandler(error) {
	const message = String(error?.message || error)
		.replace(/\0/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 400);

	console.error(`[IMAGES] ${message}`);
}

function optimizeImages() {
	return new Transform({
		objectMode: true,
		async transform(file, _enc, callback) {
			if (file.isNull() || file.isStream() || !file.contents) {
				callback(null, file);
				return;
			}

			const ext = String(file.extname || "").toLowerCase();
			const isJpeg = ext === ".jpg" || ext === ".jpeg";
			const isPng = ext === ".png";
			const isGif = ext === ".gif";

			if (!isJpeg && !isPng && !isGif) {
				callback(null, file);
				return;
			}

			try {
				let pipeline = sharp(file.contents, {
					failOn: "none",
					animated: isGif,
				}).rotate();

				if (isJpeg) {
					pipeline = pipeline.jpeg({
						quality: 82,
						mozjpeg: true,
						progressive: true,
					});
				} else if (isPng) {
					pipeline = pipeline.png({
						compressionLevel: 8,
						quality: 80,
					});
				} else if (isGif) {
					pipeline = pipeline.gif();
				}

				file.contents = await pipeline.toBuffer();
				callback(null, file);
			} catch (error) {
				imagesErrorHandler({
					message: `${file.relative}: ${error.message}`,
				});
				callback(null, file);
			}
		},
	});
}

export const images = () => {
	return app.gulp.src(app.path.src.images)
		.pipe(app.plugins.plumber({
			errorHandler: imagesErrorHandler,
		}))
		.pipe(
			app.plugins.if(
				app.isBuild,
				app.plugins.newer(app.path.build.images)
			)
		)
		.pipe(
			app.plugins.if(
				app.isBuild,
				webp()
			)
		)
		.pipe(
			app.plugins.if(
				app.isBuild,
				app.gulp.dest(app.path.build.images)
			)
		)
		.pipe(
			app.plugins.if(
				app.isBuild,
				app.gulp.src(app.path.src.images)
			)
		)
		.pipe(
			app.plugins.if(
				app.isBuild,
				app.plugins.newer(app.path.build.images)
			)
		)
		.pipe(
			app.plugins.if(
				app.isBuild,
				optimizeImages()
			)
		)
		.pipe(app.gulp.dest(app.path.build.images))
		.pipe(app.gulp.src(app.path.src.svg))
		.pipe(app.gulp.dest(app.path.build.images))
		.pipe(app.plugins.browsersync.reload({ stream: true }));
};
