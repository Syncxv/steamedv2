import { Settings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import { Patch } from "@utils/types";
import Plugins from "~plugins";

const logger = new Logger("PluginManager", "#a6d189");

export const plugins = Plugins;
export const pluginArr = Object.values(plugins);

export const patches: Patch[] = [];

export function isPluginEnabled(p: string) {
	return (
		(Plugins[p]?.required ||
			Plugins[p]?.isDependency ||
			Settings.plugins[p]?.enabled) ??
		false
	);
}

export function startAllPlugins() {
	for (const p of pluginArr) {
		const { name } = p.manifest;

		if (Settings.plugins[name]?.enabled) {
			if (p.start) {
				logger.info("Starting plugin", name);
				if (p.started) {
					logger.warn(`${name} already started`);
					return false;
				}
				try {
					p.start();
					p.started = true;
				} catch (e) {
					logger.error(`Failed to start ${name}\n`, e);
					return false;
				}
			}
		}
	}

	return true;
}
