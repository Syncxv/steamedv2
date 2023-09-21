import {
	GenericCallbackObject,
	GenericConnectCallbacks,
	Handler,
	HandlerMsgClass,
	SteamID,
} from "./friendsUiApp";

export interface CMInterface {
	ClientServersAvailableHandler: Handler;
	m_ServiceTransport: {
		SendMsg: Function;
		SendNotification: Function;
		MakeReady: Function;
	};

	get m_bCompletedInitialConnect(): boolean;
	get m_bConnected(): boolean;
	m_bConnectionFailed: boolean;
	m_bForceDisconnect: boolean;
	get m_bLoggedOn(): boolean;
	get m_bPerformedInitialClockAdjustment(): boolean;
	m_bShouldChangePersonaStatusOnDisconnect: boolean;

	m_callbacksOnConnect: GenericConnectCallbacks;
	m_callbacksOnConnectOneTime: GenericConnectCallbacks;
	m_callbacksOnDisconnect: GenericConnectCallbacks;

	m_hEMsgRegistrationObserver: Function;
	m_hSharedConnection: number;

	m_messageHandlers: {
		m_mapCallbacks: Map<number, GenericCallbackObject[]>;
		m_mapServiceMethodHandlers: Map<`${string}#1`, HandlerMsgClass>;
	};

	get m_rgRegisteredEMsgs(): number[];
	get m_rgRegisteredServiceMethodHandlers(): string[];

	m_nPerfClockServerMSOffset: number;
	m_nWallClockDriftMS: number;

	m_onConnect: Promise<undefined>;

	get m_rtReconnectThrottleExpiration(): number;
	get m_rtReconnectThrottleStart(): number;

	m_setConnectedServers: Set<number>;
	m_setEMsgHandlers: Set<number>;
	m_setServiceMethodHandlers: Set<string>;

	m_steamid: SteamID;

	get m_strIPCountry(): string;
	get m_strPersonaName(): string;
	get m_unAccountFlags(): number;

	get OnConnectionAttemptThrottled(): Function;
	get account_flags(): number;
	get has_completed_initial_connect(): boolean;
	get logged_on(): boolean;
	get messageHandlers(): any;
	get persona_name(): string;
	get rtReconnectThrottleExpiration(): number;
	get rtReconnectThrottleStart(): number;

	GetServiceTransport: () => any;
	GetAnonymousServiceTransport: () => any;
	MakeReady: () => any;
	RunWhenLoggedOn: (e: any, t: any) => any;
	WaitUntilLoggedOn: () => any;
	AddOnLogonCallback: (e: any, t: any) => any;
	AddOnDisconnectCallback: (e: any, t: any) => any;
	ForceDisconnect: () => any;
	Send: (e: any) => any;
	BInternalShouldDispatchMessage: (e: any) => boolean;
	ResolveAwaitWithTransportError: (e: any, t: any, r: any, y: any) => any;
	DispatchMessage: () => any;
	BIsConnected: () => boolean;
	OnConnect: () => any;
	OnLoggedOn: () => any;
	OnDisconnect: () => any;
	DEBUG_LogCMInterfaceActivity: (e: any, t: any) => any;
	DEBUG_LogMessage: (e: any) => any;
	InternalAdjustClock: () => any;
	BPerformedInitialClockAdjustment: () => boolean;
	GetServerTimeMS: () => any;
	GetServerRTime32: () => number;
	RTime32ToDate: (e: number) => Date;
}
