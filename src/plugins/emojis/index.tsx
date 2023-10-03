import * as DataStore from "@api/DataStore";
import { Devs } from "@utils/constants";
import { waitForCondition } from "@utils/misc";
import { PluginDef } from "@utils/types";

import emojisJSON from "./emojis.json";

export interface IEmoji {
    emoji: string;
    name: string;
    slug: string;
    group: string;
    emoji_version: string;
    unicode_version: string;
    skin_tone_support: boolean;
}
const emojis = Object.entries(emojisJSON).map(([emoji, data]) => ({
    ...data,
    emoji,
})) as IEmoji[];

const emojiKey = (name: string) => `EmojiStuff_emoji_${name}`;

export const plugin: PluginDef = {
    manifest: {
        name: "EmojiTesting",
        authors: [Devs.Dave],
        description: "hehe",
        enabledByDefault: true,
    },

    patches: [
        {
            find: "SlashCommand",
            replacement: [
                {
                    match: /OnEmoticonSuggestionSelected\(\i\,\i\){/,
                    replace:
                        "$&if($self.onEmoticonSuggestionSelected(this, arguments[1])) return;",
                },
                {
                    match: /OnEmoticonSelected\(.{1,10}\){/,
                    replace:
                        "$&if($self.isSteamedEmoji(arguments[0])) { return this.InsertAtCursor($self.getEmoji(arguments[0])) }",
                },
                // remove the space infront of emoji if 4th arg is true
                {
                    match: /(ReplaceSuggestedText\(.{1,30}\){.{1,350})&&(\(.{1,10}\))/,
                    replace: "$1&&!arguments[3]&&$2",
                },
            ],
        },
        {
            find: "emoticonStore.SearchEmoticons",
            replacement: {
                match: /(renderMatch\(\i\){return .{1,300})(\i\.createElement\(\i\.Emoticon,{.{1,100}Store}\))/,
                replace:
                    "$1$self.isSteamedEmoji(arguments[0]?.name) ? $self.renderEmoji(arguments[0]?.name) : $2",
            },
        },

        {
            find: "#AddonPicker_RecentlyUsed",
            replacement: {
                match: /(render\(\){)(const{emoticon:)/,
                replace:
                    "$1if($self.isSteamedEmoji(this.props.emoticon)) {return $self.renderEmoji(this.props.emoticon)}$2",
            },
        },
    ],
    emojis,

    isSteamedEmoji(name: string) {
        const rgEmoji =
            g_FriendsUIApp.ChatStore.EmoticonStore.m_rgEmoticons.find(
                (m) => m.name === name
            );
        const reEmoji = emojis.find((m) => m.slug === name);
        return reEmoji != null && rgEmoji?.is_steamed;
    },

    renderEmoji(name: string) {
        const res = emojis.find((m) => m.slug === name)!;
        return <div>{res.emoji}</div>;
    },

    getEmoji(name: string) {
        return emojis.find((m) => m.slug === name)?.emoji;
    },

    start() {
        waitForCondition(
            () =>
                g_FriendsUIApp.ChatStore.EmoticonStore.BInitialized() &&
                g_FriendsUIApp.ChatStore.EmoticonStore.m_rgEmoticons.length,

            async () => {
                console.log(
                    "READY?",
                    g_FriendsUIApp.ChatStore.EmoticonStore.m_rgEmoticons
                );

                const res = await Promise.all(
                    Object.values(emojis).map(
                        async (e) =>
                            (await DataStore.get(emojiKey(e.slug))) ?? {
                                name: e.slug,
                                last_used: 1663606897,
                                use_count: 1,
                                is_steamed: true,
                            }
                    )
                );

                g_FriendsUIApp.ChatStore.EmoticonStore.m_rgEmoticons =
                    g_FriendsUIApp.ChatStore.EmoticonStore.m_rgEmoticons.concat(
                        res
                    );
            }
        );
    },

    onEmoticonSuggestionSelected(_this: any, emoji: string) {
        const obj = emojis.find((m) => emoji === m.slug);
        if (!obj) return false;

        _this.FocusTextInput();
        _this.ReplaceSuggestedText(":", obj.emoji, undefined, true);
        this.updateEmojis(obj);

        return true;
    },

    async updateEmojis(obj: IEmoji) {
        const storedEmoji = await DataStore.get(emojiKey(obj.slug));

        console.log(storedEmoji);
        const res =
            storedEmoji != null
                ? {
                    ...storedEmoji,
                    last_used: Date.now(),
                    use_count: storedEmoji.use_count + 1,
                }
                : {
                    name: obj.slug,
                    last_used: Date.now(),
                    use_count: 1,
                    is_steamed: true,
                };
        await DataStore.set(emojiKey(obj.slug), res);

        const bru = g_FriendsUIApp.ChatStore.EmoticonStore.m_rgEmoticons.find(
            (e) => e.name === obj.slug
        );
        if (bru) {
            bru.last_used = res.last_used;
            bru.use_count = res.use_count;
        }

        g_FriendsUIApp.ChatStore.EmoticonStore.OnEmoticonListReceived(
            g_FriendsUIApp.ChatStore.EmoticonStore.m_rgEmoticons
        );
    },
};
