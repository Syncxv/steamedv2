import { Devs } from "@utils/constants";
import { PluginDef } from "@utils/types";

export const plugin: PluginDef = {
    manifest: {
        name: "CommandsExecutor",
        description: "this plugin patches the fuckinnnnn slash commands sheet",
        authors: [Devs.Dave],
        required: true,
        enabledByDefault: true,
    },
    patches: [
        {
            find: '"SlashCommand"',
            replacement: [
                {
                    match: /(OnSubmit\(\i\){.{1,50},)(this\.props\.chatView)/,
                    replace:
                        "async $1await Steamed.Api.Commands.processCommand(this);$2",
                },
                {
                    match: /(\i\.bAvailableInChina.{1,25})return (.{1,2})\}/,
                    replace: "$1return {...$self.getCommands(), ...$2}}",
                },
            ],
        },
    ],

    commands: [
        {
            name: "test",
            description: "hehe",
            execute: (args) => {
                console.log(args);

                return {
                    result: "hii",
                };
            },
        },
    ],

    getCommands() {
        return Object.values(Steamed.Api.Commands.commands)
            .map((c) => ({
                ...c,
                strDescriptionToken: `#SteamedSlashCommandDescription_${c.name}`,
                bAvailableInChina: true,
            }))
            .reduce((prev, curr) => ({ ...prev, [`/${curr.name}`]: curr }), {});
    },
};
