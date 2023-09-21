import { ObservableMap } from "mobx";
import { CMInterface } from "../misc/CMInterface";

export interface ChatRoomEffectSetting {
	buttonToken: `#ChatRoomEffect_${string}`;
	locToken: `#ChatRoomEffect_${string}`;
	render: (effect: any) => React.ReactNode;
	renderButton: () => React.ReactNode;
	renderEffectIcon: () => React.ReactNode;
	timeout: number;
}

export interface ParseBBCodeOptions {
	bAnimate: boolean;
	bUseLargeEmoticons: boolean;
	// TODO: type chat
	chat: any;
	key: string;
	onAnimationEnd: () => void;
	onAnimationStart: () => number;
	onLoad: Function;
	rtTimestamp: number;
	unAccountIDSender: number;
}

interface Accumulator {
	new (): { m_rctElements: React.ReactNode[] };
	AppendText(text: string): void;
}

export interface ChatStore {
	m_CMInterface: CMInterface;

	m_ChatRoomBBCodeParser: {
		m_accumulatorType: Accumulator;
		m_dictComponents: {
			[key: string]: React.ComponentClass;
		};
		ParseBBCode: (bbcode: string) => React.ReactNode;
		// TODO: type chat
		Parse_BuildReactComponents: (
			codeOpt: { type: number; text: string },
			chat: any
		) => React.ReactNode;
	};
	m_ChatRoomEffectSettings: {
		[effect: string]: ChatRoomEffectSetting;
	};

	m_ChatRoomGroupDisplayPrefs: {
		// TODO: type settings store
		m_SettingsStore: any;
		m_mapDisplayPrefs: ObservableMap;
	};

	m_bReadyToRender: boolean;
	get m_bReceivedChatGroupList(): boolean;
	m_bSendActiveGroupsQueued: boolean;
	m_bSendingActiveGroups: boolean;

	m_fnOnReadyToRender?: Function;

	// stores
	get CMInterface(): any;
	get ChatRoomBBCodeParser(): any;
	get ChatRoomEffectSettings(): any;
	get ChatRoomGroupDisplayPrefs(): any;
	get ClanChatRooms(): any;
	get EmbedStore(): any;
	get EmoticonStore(): EmoticonStore;
	get FriendChatBBCodeParser(): any;
	get FriendChatStore(): any;
	get FriendStore(): any;
	get GameInviteStore(): any;
	get InviteStore(): any;
	get NotificationBBCodeParser(): any;
	get TextFilterStore(): any;
	get VoiceChat(): any;

	get chat_group_list_ready(): boolean;
	get currentChatRoomGroups(): any[];

	// TODO: finish it
}

interface Emoticon {
	name: string;
	last_used: number;
	use_count: number;
	appid: number;
}
interface Sticker {
	name: string;
	count: number;
	time_received: number;
	appid: number;
	time_last_used: number;
	use_count: number;
}
interface EmoticonStore {
	m_bEmoticonListRequested: false;
	m_emoticonTrackerCallback: null;
	m_rgEffects: any[];
	m_rgEmoticons: Emoticon[];
	m_rgFlairs: any[];
	m_rgStickers: Sticker[];
	m_stickerTrackerCallback: null;
	get m_bInitialized(): boolean;
	get m_rtLastStickerOrEffect(): number;
	get m_rtMostRecentEmoticon(): undefined;

	// proto
	BInitialized: () => boolean;
	GetServerTime: () => any;
	RequestEmoticonListInternal: () => any;

	OnEmoticonListReceived: (e: any) => void;
}
