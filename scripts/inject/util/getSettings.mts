import vdfparser from "vdf-parser";
import fs from "node:fs/promises";
import { isValidSteamPath } from "./isValidSteamPath.mjs";

export async function getSettings(steamPath: string) {
	console.log("WHYYY");
	if (!isValidSteamPath(steamPath))
		return console.log("getSettings: invalid steampath", steamPath);

	const vdf = await fs.readFile(`${steamPath}/config/config.vdf`, "utf-8");
	const parsed = vdfparser.parse<{
		InstallConfigStore: { WebStorage: { steamed_settings: string } };
	}>(vdf);

	try {
		console.log(parsed.InstallConfigStore.WebStorage);
		const str = parsed.InstallConfigStore.WebStorage.steamed_settings;
		return JSON.parse(str.replace(/\\/g, ""));
	} catch (err) {
		console.error(err, "failedd to get settings");
		return null;
	}
}
