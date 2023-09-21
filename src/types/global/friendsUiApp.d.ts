/*
 * Steamed, a modification for the Steam Client
 * Copyright (c) 2023 Syncxv
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { ChatStore } from "../stores/chat";
import { UIStore } from "../stores/ui";
import { CMInterface } from "./CMInterface";
import { GenericCallback } from "./popup";

export interface GenericCallbackObject {
	m_vecCallbacks: GenericCallback
}

export interface GenericConnectCallbacks {
	m_ClientConnectionCallbacks: GenericCallbackObject[]
	m_bRunOnce: boolean
	m_mapServerTypeCallbacks: Map<number, GenericCallbackObject[]>
}

export interface Handler { invoke: Function, unregister: Function }
export interface HandlerMsgClass { invoke: Function, msgClass: Function }

export interface SteamID {
	m_ulSteamID: {
		low: number,
		high: number,
		unsigned: boolean
	}
}

export interface Storage {
	GetString: Function
	RemoveObject: Function
	StoreString: Function
}

export interface FriendsUIApp {
	m_CMInterface: CMInterface
	get CMInterface(): CMInterface

	m_UIStore: UIStore
	get UIStore(): UIStore

	m_ChatStore: ChatStore
	get ChatStore(): ChatStore

	m_Storage: Storage
	get Storage(): Storage

	[other: string]: any
}
