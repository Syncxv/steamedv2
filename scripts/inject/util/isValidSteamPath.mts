import { existsSync } from "node:fs";

export const isValidSteamPath = (steamPath: string) =>
	existsSync(steamPath) || existsSync(`${steamPath}/steam.exe`);
