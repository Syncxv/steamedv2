import { Plugin } from "esbuild";
import { BuildOptions } from "esbuild";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { getDefaultSteamPath } from "../inject/util/steamPath.mjs";
import { insertSteamed } from "../inject/index.mjs";

export const watch = process.argv.includes("--watch");
export const insertToSteam =
	process.argv.find((m) => m.startsWith("--insert="))?.split("=")[1] ??
	/* default */ (process.argv.includes("--insert") && getDefaultSteamPath());

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
					const plugin = `plugin${i}`;
					code += `import * as ${mod} from "./${dir}/${file.replace(
						/\.tsx?$/,
						""
					)}";\n`;
					code += `const ${plugin} = ${mod}.plugin || ${mod}.default || ${mod};\n`;
					plugins += `[${plugin}.manifest.name]:${plugin},\n`;
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

export const insertSteamedPlugin: Plugin = {
	name: "insertSteamed",
	setup(build) {
		build.onEnd((res) => {
			if (res.errors.length || !insertToSteam) return;

			insertSteamed(insertToSteam);
		});
	},
};

export const commonOpts: BuildOptions = {
	logLevel: "info",
	bundle: true,
	minify: !watch,
	sourcemap: watch ? "inline" : undefined,
	plugins: [globPlugins, insertSteamedPlugin],
	logOverride: { "import-is-undefined": "silent" },
};
