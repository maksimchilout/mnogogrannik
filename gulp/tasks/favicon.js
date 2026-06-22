import sharp from "sharp";
import toIco from "to-ico";
import { writeFile } from "fs/promises";

const logoPath = "./src/img/logo.jpg";

async function createRoundPng(size) {
	const mask = Buffer.from(
		`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
	);

	return sharp(logoPath)
		.resize(size, size, { fit: "cover" })
		.composite([{ input: mask, blend: "dest-in" }])
		.png()
		.toBuffer();
}

export const favicon = async () => {
	try {
		const png16 = await createRoundPng(16);
		const png32 = await createRoundPng(32);
		const png180 = await createRoundPng(180);
		const buildRoot = app.path.build.html;

		await writeFile(`${buildRoot}favicon.png`, png32);
		await writeFile(`${buildRoot}apple-touch-icon.png`, png180);
		await writeFile(`${buildRoot}favicon.ico`, await toIco([png16, png32]));
	} catch (error) {
		console.error("Favicon generation failed:", error);
		throw error;
	}
};
