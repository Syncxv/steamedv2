import { CMInterface } from "../misc/CMInterface";
import { GenericCallbackObject } from "../misc/friendsUiApp";
import { ChatStore } from "./chat";

export interface UIStore {
	m_CMInterface: CMInterface;
	m_FriendsListSteamDeckActiveTabCallbackList: Omit<
		GenericCallbackObject,
		""
	>[];
	m_bParentalLocked: boolean;
	m_bRestoredPopupState: boolean;
	m_bRestoringPopups: boolean;
	get m_bShowWinterSaleUI(): boolean;
	m_bShuttingDown: boolean;
	m_bSuppressBrowserContextBroadcasting: boolean;
	m_bTheaterMode: boolean;

	m_chatStore: ChatStore;

	m_eFriendsListSteamDeckActiveTab: number;
	m_iLastChatPopupID: number;

	// TODO: type browser context
	m_mapChatBrowserContexts: Map<string, any>;

	m_mapFriendChatBroadcastVisible: {
		enhancer: Function;
		name: string;
		get size(): number;
		_data: Map<any, any>;
		_hasMap: Map<string, any>;
		_keysAtom: {
			name: string;
			isPendingUnobservation: boolean;
			isBeingObserved: boolean;
			lastAccessedBy: number;
			lowestObserverState: number;
			observers: Set<any>;
			diffValue: number;
		};
		get m_nTabActivationCount(): number;
		m_overlayCreatedCallbackList: GenericCallbackObject[];
		m_stateToRestoreFrom: undefined;
		m_vecShowGroupsAfterRestorePopup: [];
		get FriendsListSteamDeckActiveTab(): number;
		SerializePopupState: Function;
		get show_winter_sale_ui(): boolean;
		get m_bShowWinterSaleUI(): Function;
		set m_bShowWinterSaleUI(e: boolean);
		get m_bTheaterMode(): Function;
		set m_bTheaterMode(e: boolean);
		get m_mapFriendChatBroadcastVisible(): Function;
		set m_mapFriendChatBroadcastVisible(e: any);
	};

	m_nTabActivationCount: number;
	m_overlayCreatedCallbackList: GenericCallbackObject[];
	m_stateToRestoreFrom: any;
	m_vecShowGroupsAfterRestorePopup: any[];
}
