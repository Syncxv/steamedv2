import { existsSync } from "node:fs";
import { isWsl } from "./isWsl.mjs";

export const isValidSteamPath = (steamPath: string) =>
    existsSync(steamPath) || existsSync(`${steamPath}/steam.exe`);

export const getDefaultSteamPath = () =>
    isWsl()
        ? "/mnt/c/Program Files (x86)/Steam"
        : "C:/Program Files (x86)/Steam";
