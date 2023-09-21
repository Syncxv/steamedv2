import { Patch } from "@utils/types";
import Plugins from "~plugins";

export const plugins = Plugins;
export const pluginArr = Object.values(plugins);

export const patches: Patch[] = [];

for (const p of pluginArr) {
}
