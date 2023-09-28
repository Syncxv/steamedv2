import { Devs } from "@utils/constants";
import { transformSettings } from "@utils/misc";
import { PluginDef, SettingsItem } from "@utils/types";

export const plugin: PluginDef = {
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
                    match: /Internal:{visible:(\i&&\i)/,
                    replace: "$&true",
                },
            ],
        },
    ],

    getSettingsObjects(): Record<string, SettingsItem> {
        if (this.settingStuffs) return this.settingStuffs;

        return (this.settingsStuffs = {
            SteamedGeneral: transformSettings({
                visible: true,
                icon: () => <div>:|</div>,
                content: () => {
                    return <div>WOAH</div>;
                },
                route: "/settings/hehe",
                title: "Steamed Settings",
            }),
        });
    },

    getSettingsStrings() {
        return Object.keys(this.getSettingsObjects());
    },
};
