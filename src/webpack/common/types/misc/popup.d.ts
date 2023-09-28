export interface GenericCallback {
    (popup: TPopup): any;
    id?: string;
    [key: string]: any;
}
export interface PopupManager {
    m_DynamicCSSObserver: MutationObserver;
    m_bSaveRequired: boolean;
    m_bShuttingDown: boolean;
    m_mapPopups: Map<string, TPopup>;
    m_mapRestoreDetails: Map<string, any>;
    m_rgPopupCreatedCallbacks: GenericCallback[];
    m_rgShutdownCallbacks: GenericCallback[];
    m_unCurrentAccountID: number;

    AddPopupCreatedCallback: Function;
    AddShutdownCallback: Function;
    AddTrackedPopup: Function;
    BAnyMenuHasFocus: Function;
    BAnyPopupHasFocus: Function;
    BShuttingDown: Function;
    ClearSavedDimensionStore: Function;
    ClosePopupsOwnedByBrowser: Function;
    DebouncedSaveSavedDimensionStore: Function;
    GetExistingPopup: Function;
    GetLocalStorageKey: Function;
    GetPopups: Function;
    GetRestoreDetails: Function;
    LoadSavedDimensionStore: Function;
    RemoveTrackedPopup: Function;
    SaveSavedDimensionStore: Function;
    SetCurrentLoggedInAccountID: Function;
    SetRestoreDetails: Function;
}

interface TPopup {
    m_bCreateHidden: boolean;
    m_bCreated: boolean;
    m_bExpires: boolean;
    m_bFocused: boolean;
    m_chats: any;

    m_element: HTMLElement;
    window: Window;

    m_onCreateRendered: Function | null;
    m_popup: Window;
    m_popupActionDisposer: Function;
    m_renderWhenReady: {
        m_rgLoadingLinks: string[];
        m_fnRender?: Function | null;
        OnLinkLoad: Function;
    };

    m_rgParams: {
        html_class: string;
        body_class: string;
        minWidth: number;
        minHeight: number;
        strRestoreDetails: string;
        target_browser?: any;
    };

    m_strInitialRestoreDetails: string;
    m_strInitialSavedDimensionsKey: string;
    m_strName: string;
    m_strSavedDimensionsKey: string;
    m_strTitle: string;

    // TODO: type this
    m_tabSet: any;

    OnBeforeUnloadEvent: Function;
    OnBlurInternal: Function;
    OnCreateInternal: Function;
    OnFocusInternal: Function;
    OnMessage: Function;
    OnResizeEvent: Function;
    OnUnload: Function;
    QueryAndStoreWindowPosition: Function;
    RenderInternal: Function;
    SetTitle: Function;
}
