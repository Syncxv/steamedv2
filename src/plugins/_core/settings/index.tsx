import { Devs } from "@utils/constants";
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
			find: "#Settings_Page_Internal",
			replacement: {
				match: /Internal:{visible:/,
				replace: "...(console.log($self), []),$&",
			},
		},
	],

	getSettingsStuff(): SettingsItem[] {
		return [
			{
				visible: true,
				icon: () => {
					return <div></div>;
				},
				content: () => {
					return <div>hi</div>;
				},
				route: "/settings/hehe",
				title: "HI",
			},
		];
	},
};
