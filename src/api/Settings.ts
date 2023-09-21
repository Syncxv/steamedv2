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

let settings: Settings | undefined = DefaultSettings;

export async function init() {
	const _settings: Settings = await getSettings();
	mergeDefaults(_settings, DefaultSettings);

	settings = _settings;
	Settings = makeProxy(settings);
}

export async function getSettings() {
	try {
		const str = await SteamClient.Storage.GetString("steamed_settings");
		return JSON.parse(str);
	} catch (err) {
		console.error("failed to load settings", err);
		return mergeDefaults({} as Settings, DefaultSettings);
	}
}

export async function setSettings(settins: string) {
	await SteamClient.Storage.SetString("steamed_settings", settins);
}

type SubscriptionCallback = ((newValue: any, path: string) => void) & {
	_paths?: Array<string>;
};
const subscriptions = new Set<SubscriptionCallback>();

const proxyCache = {} as Record<string, any>;

function makeProxy(settings: any, root = settings, path = ""): Settings {
	return (proxyCache[path] ??= new Proxy(settings, {
		get(target, p: string) {
			const v = target[p];

			// using "in" is important in the following cases to properly handle falsy or nullish values
			if (!(p in target)) {
				// Return empty for plugins with no settings
				if (path === "plugins" && p in plugins)
					return (target[p] = makeProxy(
						{
							enabled:
								plugins[p].required ?? plugins[p].enabledByDefault ?? false,
						},
						root,
						`plugins.${p}`
					));

				// ill figure it out later
				// // Since the property is not set, check if this is a plugin's setting and if so, try to resolve
				// // the default value.
				// if (path.startsWith("plugins.")) {
				//     const plugin = path.slice("plugins.".length);
				//     if (plugin in plugins) {
				//         const setting = plugins[plugin].options?.[p];
				//         if (!setting) return v;
				//         if ("default" in setting)
				//             // normal setting with a default value
				//             return (target[p] = setting.default);
				//         if (setting.type === OptionType.SELECT) {
				//             const def = setting.options.find(o => o.default);
				//             if (def)
				//                 target[p] = def.value;
				//             return def?.value;
				//         }
				//     }
				// }
				return v;
			}

			// Recursively proxy Objects with the updated property path
			if (typeof v === "object" && !Array.isArray(v) && v !== null)
				return makeProxy(v, root, `${path}${path && "."}${p}`);

			// primitive or similar, no need to proxy further
			return v;
		},

		set(target, p: string, v) {
			// avoid unnecessary updates to React Components and other listeners
			if (target[p] === v) return true;

			target[p] = v;
			// Call any listeners that are listening to a setting of this path
			const setPath = `${path}${path && "."}${p}`;
			delete proxyCache[setPath];
			for (const subscription of subscriptions) {
				if (!subscription._paths || subscription._paths.includes(setPath)) {
					subscription(v, setPath);
				}
			}
			// And don't forget to persist the settings!
			//PlainSettings.cloud.settingsSyncVersion = Date.now();
			localStorage.Steamed_settingsDirty = true;
			//saveSettingsOnFrequentAction();
			setSettings(JSON.stringify(root));
			return true;
		},
	}));
}

/**
 * Same as {@link Settings} but unproxied. You should treat this as readonly,
 * as modifying properties on this will not save to disk or call settings
 * listeners.
 * WARNING: default values specified in plugin.options will not be ensured here. In other words,
 * settings for which you specified a default value may be uninitialised. If you need proper
 * handling for default values, use {@link Settings}
 */
export const PlainSettings = settings;

/**
 * A smart settings object. Altering props automagically saves
 * the updated settings to disk.
 * This recursively proxies objects. If you need the object non proxied, use {@link PlainSettings}
 */
export let Settings: Settings = DefaultSettings;
