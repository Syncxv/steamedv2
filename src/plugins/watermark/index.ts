import { Devs } from "@utils/constants";
import { addPopupCreatedCallback } from "@utils/popup";
import { insertCss } from "@utils/misc";
import { PluginDef } from "@utils/types";
const css = `.chatEntry.Panel.Focusable::before {
    content: "steamed IS INJECTED :D";
    position: absolute;
    top: -25%;
    right: 3%;
    z-index: 99;
    font-size: .7rem;
}`;
export const plugin: PluginDef = {
    manifest: {
        name: "Chat WaterMark",
        description: "adds a watermark above the chat textarea",
        authors: [Devs.Dave],
    },
    removeCallback: null as Function | null,
    start() {
        console.log(g_PopupManager);

        this.removeCallback = addPopupCreatedCallback(
            (popup) => {
                if (popup.m_strName.startsWith("chat_")) {
                    console.log("cool", popup);
                    insertCss(css, popup.window.document);
                }
            },
            { executeOnExistingPopups: true }
        );
        // this.bruhs = [...g_PopupManager.GetPopups()].map((m) => insertCss(css, m.window.document));
    },

    stop() {
        this.removeCallback && this.removeCallback();
    },
};
