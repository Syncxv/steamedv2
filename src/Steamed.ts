export * as Api from "./api";
export * as Plugins from "./plugins";
export * as Webpack from "./webpack";

export { PlainSettings, Settings };

import "./webpack/patchWebpack";

import { PlainSettings, Settings } from "./api/Settings";
import { startAllPlugins } from "./plugins";
import { waitForCondition } from "./utils";

export async function init(cb: () => void) {
    waitForCondition(
        () => window?.g_FriendsUIApp?.ready_to_render,
        () => {
            startAllPlugins();
            cb();
        },
    );
}
