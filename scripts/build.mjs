import esbuild from "esbuild";
import URL from "node:url";

export const watch = process.argv.includes("--watch");

/**
 * @type {import("esbuild").BuildOptions}
 */
export const commonOpts = {
	logLevel: "info",
	bundle: true,
	minify: !watch,
	sourcemap: watch ? "inline" : "",
};

export async function build() {
	return new Promise(async (res) => {
		const contexts = await Promise.all([
			esbuild.context({
				...commonOpts,
				entryPoints: ["src/index.ts"],
				outfile: "dist/main.js",
			}),
		]);

		contexts.forEach(async (ctx, i) => {
			if (watch) return await ctx.watch();

			await ctx.rebuild();
			await ctx.dispose();
			if (i === contexts.length) res(true);
		});
	});
}

const __filename = URL.fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
if (process.argv[1] === __filename) {
	console.log("BUILDING");
	build();
}
