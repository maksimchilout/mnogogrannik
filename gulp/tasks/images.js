import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import webp from "gulp-webp";
import { Transform } from "stream";

const COPY_CONCURRENCY = 4;
const SHARP_CONCURRENCY = 2;
const IMAGE_EXT = new Set([
	".jpg",
	".jpeg",
	".png",
	".gif",
	".webp",
	".svg",
]);

function imagesErrorHandler(error) {
	const message = String(error?.message || error)
		.replace(/\0/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 400);

	console.error(`[IMAGES] ${message}`);
}

function createConcurrencyGate(limit) {
	let active = 0;
	const queue = [];

	const pump = () => {
		while (active < limit && queue.length) {
			active += 1;
			const { run, resolve, reject } = queue.shift();
			Promise.resolve()
				.then(run)
				.then((value) => {
					active -= 1;
					resolve(value);
					pump();
				})
				.catch((error) => {
					active -= 1;
					reject(error);
					pump();
				});
		}
	};

	return (run) =>
		new Promise((resolve, reject) => {
			queue.push({ run, resolve, reject });
			pump();
		});
}

const runCopy = createConcurrencyGate(COPY_CONCURRENCY);
const runSharp = createConcurrencyGate(SHARP_CONCURRENCY);

async function ensureDir(dirPath) {
	await fs.mkdir(dirPath, { recursive: true });
}

async function needsCopy(srcFile, destFile) {
	try {
		const [srcStat, destStat] = await Promise.all([
			fs.stat(srcFile),
			fs.stat(destFile),
		]);
		return srcStat.mtimeMs > destStat.mtimeMs || srcStat.size !== destStat.size;
	} catch {
		return true;
	}
}

async function collectImageFiles(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectImageFiles(fullPath)));
			continue;
		}
		if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
			files.push(fullPath);
		}
	}

	return files;
}

async function copyImageTree() {
	const srcRoot = path.resolve(`${app.path.srcFolder}/img`);
	const destRoot = path.resolve(app.path.build.images);
	await ensureDir(destRoot);

	const files = await collectImageFiles(srcRoot);
	let copied = 0;
	let skipped = 0;

	await Promise.all(
		files.map((srcFile) =>
			runCopy(async () => {
				const relative = path.relative(srcRoot, srcFile);
				const destFile = path.join(destRoot, relative);

				if (!(await needsCopy(srcFile, destFile))) {
					skipped += 1;
					return;
				}

				await ensureDir(path.dirname(destFile));
				await fs.copyFile(srcFile, destFile);
				copied += 1;
			})
		)
	);

	console.log(`[IMAGES] copied ${copied}, skipped ${skipped}`);
}

function readFilteredFiles() {
	return new Transform({
		objectMode: true,
		highWaterMark: 1,
		async transform(file, _enc, callback) {
			if (file.isDirectory()) {
				callback();
				return;
			}

			try {
				file.contents = await fs.readFile(file.path);
				callback(null, file);
			} catch (error) {
				imagesErrorHandler({
					message: `${file.relative}: ${error.message}`,
				});
				callback();
			}
		},
	});
}

function optimizeImages() {
	return new Transform({
		objectMode: true,
		highWaterMark: 1,
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
				file.contents = await runSharp(async () => {
					let pipeline = sharp(file.contents, {
						failOn: "none",
						animated: isGif,
						limitInputPixels: false,
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

					return pipeline.toBuffer();
				});
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

function optimizeBuildImages() {
	return app.gulp
		.src(app.path.src.images, { read: false, allowEmpty: true })
		.pipe(
			app.plugins.plumber({
				errorHandler: imagesErrorHandler,
			})
		)
		.pipe(app.plugins.newer(app.path.build.images))
		.pipe(readFilteredFiles())
		.pipe(webp())
		.pipe(app.gulp.dest(app.path.build.images))
		.pipe(app.gulp.src(app.path.src.images, { read: false, allowEmpty: true }))
		.pipe(app.plugins.newer(app.path.build.images))
		.pipe(readFilteredFiles())
		.pipe(optimizeImages())
		.pipe(app.gulp.dest(app.path.build.images))
		.pipe(app.gulp.src(app.path.src.svg, { read: false, allowEmpty: true }))
		.pipe(app.plugins.newer(app.path.build.images))
		.pipe(readFilteredFiles())
		.pipe(app.gulp.dest(app.path.build.images));
}

export const images = (done) => {
	const finish = (error) => {
		if (error) {
			imagesErrorHandler(error);
			done(error);
			return;
		}

		app.plugins.browsersync.reload();
		done();
	};

	if (app.isBuild) {
		optimizeBuildImages()
			.on("error", finish)
			.on("end", finish);
		return;
	}

	copyImageTree().then(() => finish()).catch(finish);
};
