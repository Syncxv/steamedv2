import { GlobalRegistrator } from "@happy-dom/global-registrator";

import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { isWsl } from "./util/isWsl.mjs";
import { build } from "../build/build.mjs";
import { isValidSteamPath } from "./util/isValidSteamPath.mjs";
import { getSettings } from "./util/getSettings.mjs";

const wsl = isWsl();
const args = process.argv.slice(2);

//TODO: test on windows
const steamPath =
	args.length > 0
		? args[0]
		: wsl
		? "/mnt/c/Program Files (x86)/Steam"
		: "C:/Program Files (x86)/Steam";

function html(strings: TemplateStringsArray, ...values: string[]) {
	const content = strings.reduce((accumulator, currentString, i) => {
		return accumulator + currentString + (values[i] || "");
	}, "");

	const div = document.createElement("div");
	div.innerHTML = content;

	return div.firstElementChild!;
}

async function main() {
	console.log("PATH = ", steamPath, args[0] ?? ":|");
	if (!isValidSteamPath(steamPath)) return console.error("Invalid steam path");

	if (!existsSync("dist/main.js")) await build();

	let steamedContents = await fs.readFile("dist/main.js", "utf-8");

	await fs.writeFile(`${steamPath}/steamui/steamed.js`, steamedContents, {
		encoding: "utf-8",
	});

	const sharedJsContextHTML = await fs.readFile(
		`${steamPath}/steamui/index.html`,
		"utf-8"
	);

	modifyHTML(sharedJsContextHTML);

	await fs.writeFile(
		`${steamPath}/steamui/index.html`,
		document.documentElement.innerHTML,
		"utf-8"
	);
}

function modifyHTML(sharedJsContextHTML: string) {
	GlobalRegistrator.register();
	document.documentElement.innerHTML = sharedJsContextHTML;

	if (!document.head.querySelector('script[src="./steamed.js"]'))
		document.head.prepend(html`<script src="./steamed.js"></script>`);

	// we want library.js to be first since that has webpack in it.
	// why? because when we patch webpack we want all the modules but webpack hasnt been initialized since
	// library.js executes 2nd. so there are like 50 modules in the webpack chunk before the push is even defined.
	// so we miss a lot of modules
	const toSwap = document.head.querySelector('[src^="/library.js"]');
	const prevSibling = toSwap?.previousElementSibling;
	if (
		!toSwap ||
		!prevSibling ||
		prevSibling.tagName !== "SCRIPT" ||
		!(prevSibling as HTMLScriptElement).src.includes("/libraries")
	)
		return;

	document.head.insertBefore(toSwap, toSwap.previousElementSibling);
}

main();
