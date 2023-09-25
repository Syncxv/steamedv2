import { GenericCallback } from "globals";
import { generateUuid } from "./misc";

export const addPopupCreatedCallback = (
	callback: GenericCallback,
	opt: { executeOnExistingPopups: boolean } = { executeOnExistingPopups: false }
): (() => void) => {
	const newCallback: GenericCallback = (popup) => {
		try {
			callback(popup);
		} catch (e) {
			console.error("Error in popup created callback", e);
		}
	};
	newCallback.id = generateUuid("pop-up-callback");

	g_PopupManager.m_rgPopupCreatedCallbacks.push(newCallback);

	if (opt.executeOnExistingPopups) {
		for (const popup of g_PopupManager.m_mapPopups.values()) {
			newCallback(popup);
		}
	}

	return () => {
		g_PopupManager.m_rgPopupCreatedCallbacks =
			g_PopupManager.m_rgPopupCreatedCallbacks.filter(
				(cb) => cb.id !== newCallback.id
			);
	};
};
