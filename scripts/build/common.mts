import { Plugin } from "esbuild";
import { BuildOptions } from "esbuild";
import { existsSync } from "fs";
import { readdir } from "fs/promises";

export const watch = process.argv.includes("--watch");

export const globPlugins: Plugin = {
	name: "globPlugins",
	setup(build) {
		const filter = /^~plugins$/;
		build.onResolve({ filter }, (args) => {
			return {
				namespace: "import-plugins",
				path: args.path,
			};
		});

		build.onLoad({ filter, namespace: "import-plugins" }, async () => {
			const pluginDirs = [
				"plugins/_api",
				"plugins/_core",
				"plugins",
				"userplugins",
			];

			let code = "";
			let plugins = "\n";
			let i = 0;

			for (const dir of pluginDirs) {
				if (!existsSync(`./src/${dir}`)) continue;
				const files = await readdir(`./src/${dir}`);

				for (const file of files) {
					if (file.startsWith("_") || file.startsWith(".")) continue;
					if (file === "index.ts") continue;

					const mod = `p${i}`;
					code += `import * as ${mod} from "./${dir}/${file.replace(
						/\.tsx?$/,
						""
					)}";\n`;
					plugins += `[${mod}.manifest.name]:${mod},\n`;
					i++;
				}
			}

			code += `export default {${plugins}};`;
			return {
				contents: code,
				resolveDir: "./src",
			};
		});
	},
};

export const commonOpts: BuildOptions = {
	logLevel: "info",
	bundle: true,
	minify: !watch,
	sourcemap: watch ? "inline" : undefined,
	plugins: [globPlugins],
};
