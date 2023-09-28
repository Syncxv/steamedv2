import { Devs } from "@utils/constants";
import { Manifest, PluginPatch } from "@utils/types";

export const manifest: Manifest = {
    name: "Test",
    description: "test plugin",
    authors: [Devs.Dave],
};

export const start = () => {
    console.log("test started");
};

export const stop = () => {
    console.log("test stopped");
};

export const patches: PluginPatch[] = [
    {
        find: "SteamApp Init - Before Login",
        replacement: {
            match: /SteamApp Init - Before Login/,
            replace: "$& WOAH",
        },
    },
];
