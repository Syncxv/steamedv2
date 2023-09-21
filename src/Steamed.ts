export * as Plugins from "./plugins";
export * as Webpack from "./webpack";
export * as Api from "./api";

export { PlainSettings, Settings };

import "./webpack/patchWebpack";
import { PlainSettings, Settings, init as huh } from "./api/Settings";
import { startAllPlugins } from "./plugins";

export async function init() {
	await huh();
	startAllPlugins();
}
