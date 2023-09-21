import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { isWsl } from "./util/isWsl.mjs";
import path from "node:path";
import { build } from "../build.mjs";

const wsl = isWsl();
const args = process.argv.slice(2);

//TODO: test on windows
const steamPath =
	args[0] ?? wsl
		? "/mnt/c/Program Files (x86)/Steam"
		: "C:/Program Files (x86)/Steam";

function html(strings, ...values) {
	const content = strings.reduce((accumulator, currentString, i) => {
		return accumulator + currentString + (values[i] || "");
	}, "");

	const div = document.createElement("div");
	div.innerHTML = content;

	return div.firstElementChild;
}

async function main() {
	console.log(path.resolve(steamPath), wsl);
	if (!existsSync(steamPath) && !existsSync(steamPath + "/steam.exe"))
		return console.error("Invalid steam path");

	if (!existsSync("dist/main.js")) await build();

	const sharedJsContextHTML = await fs.readFile(
		`${steamPath}/steamui/index.html`,
		"utf-8"
	);
	document.documentElement.innerHTML = sharedJsContextHTML;
	const toSwap = document.head.querySelector('[src^="/libraries/"]');
	document.head.insertBefore(toSwap, toSwap.previousElementSibling);

	document.head.prepend(html`<script src="./steamed.js"></script>`);

	const steamedContents = await fs.readFile("dist/main.js", "utf-8");

	await fs.writeFile(`${steamPath}/steamui/steamed.js`, steamedContents, {
		encoding: "utf-8",
	});

	await fs.writeFile(
		`${steamPath}/steamui/index.html`,
		document.documentElement.innerHTML,
		"utf-8"
	);
}

main();
