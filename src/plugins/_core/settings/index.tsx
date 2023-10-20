import { Devs } from "@utils/constants";
import { transformSettings } from "@utils/misc";
import { PluginDef, SettingsItem } from "@utils/types";

import { PluginsPage } from "../../../components/Settings/PluginsPage";

export const plugin = {
    manifest: {
        name: "Settings",
        description: "Adds settings and stuff",
        authors: [Devs.Dave],
        required: true,
        enabledByDefault: true,
    },
    patches: [
        {
            find: "#Settings_Page_General",
            replacement: [
                {
                    match: /General:{visible:/,
                    replace: "...$self?.getSettingsObjects(),$&",
                },

                {
                    match: /((\i\.PagedSettingsSeparator).{1,200}const \i=function\(\){.{1,200}return)(.{1,100}:.\i)}/,
                    replace: "$1[...$3, $2, ...$self.getSettingsStrings() ]}",
                },
                {
                    match: /(Internal:{visible:)(\i&&\i)/,
                    replace: "$1true",
                },
            ],
        },
    ],

    settingsStuffs: null as Record<string, SettingsItem> | null,

    getSettingsObjects(): Record<string, SettingsItem> {
        if (this.settingsStuffs) return this.settingsStuffs;

        return (this.settingsStuffs = {
            SteamedGeneral: transformSettings({
                visible: true,
                icon: () => <div>:|</div>,
                content: PluginsPage,
                route: "/settings/hehe",
                title: "Steamed Settings",
            }),
        });
    },

    getSettingsStrings() {
        return ["Internal", ...Object.keys(this.getSettingsObjects())];
    },
} satisfies PluginDef & Record<string, any>
