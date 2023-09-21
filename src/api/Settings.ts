import { Logger } from "@utils/Logger";
import { mergeDefaults } from "@utils/misc";

import plugins from "~plugins";

const logger = new Logger("Settings");

export interface Settings {
	plugins: {
		[plugin: string]: {
			enabled: boolean;
			[setting: string]: any;
		};
	};
}

// ill add some when we need it
const DefaultSettings: Settings = { plugins: {} };

(async () => {
	try {
		var settings: Settings = await getSettings();
		mergeDefaults(settings, DefaultSettings);
	} catch (err) {
		var settings: Settings = mergeDefaults({} as Settings, DefaultSettings);
		logger.error(
			"An error occurred while loading the settings. Corrupt settings file?\n",
			err
		);
	}
})();

export async function getSettings() {
	try {
		const str = await SteamClient.Storage.GetJSON("steamed_settings");
		return JSON.parse(str);
	} catch (err) {
		console.error("failed to load settings", err);
		return mergeDefaults({} as Settings, DefaultSettings);
	}
}

export async function setSettings(settins: Settings) {
	await SteamClient.Storage.SetObject("steamed_settings", settins);
}
