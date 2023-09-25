import { addPopupCreatedCallback } from "@utils/popup";
import * as Steamed from "./Steamed";

const addSteamedToPopups = () =>
	addPopupCreatedCallback(
		(popup) => {
			Object.defineProperty(popup.window, "Steamed", {
				get: () => Steamed,
				configurable: true,
			});
		},
		{ executeOnExistingPopups: true }
	);

Steamed.init(addSteamedToPopups);
window.Steamed = Steamed;
