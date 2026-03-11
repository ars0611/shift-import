import { ModalElement } from "./modal";
import { BatchGetResponse } from "./sheet";

// フロントからlistnerに送る各種メッセージ
type AuthCheckMessage = { type: "AUTH_CHECK" };
type AuthConnectMessage = { type: "AUTH_CONNECT" };
type LoadSheetMessage = { type: "LOAD_SHEET", ranges: Array<string> };
type OpenModalMessage = { type: "OPEN_MODAL", modalElement: ModalElement };
type CloseModalMessage = { type: "CLOSE_MODAL" };
type ImportToCalendarMessage = { type: "IMPORT_TO_CALENDAR", sheetData: BatchGetResponse };
type SetNumberToSyncStorageMessage = { type: "SET_NUMBER_TO_SYNCSTORAGE", key: string, value: number };
type GetNumberFromSyncStorage = { type: "GET_NUMBER_FROM_SYNCSTORAGE", keys: Array<string> }


/** chrome.runtimeが受け取るメッセージ */
export type ExtensionMessage =
    | AuthCheckMessage
    | AuthConnectMessage
    | LoadSheetMessage
    | OpenModalMessage
    | CloseModalMessage
    | ImportToCalendarMessage
    | SetNumberToSyncStorageMessage
    | GetNumberFromSyncStorage

/** `AuthCheckMessage`をbackgroundに送った際のレスポンス */
export type AuthResponse = {
    ok: boolean,
    connected: boolean,
    error?: string
}

/** `LoadSheetMessage`をbackgroundに送った際のレスポンス */
export type LoadSheetResponse = {
    ok: boolean,
    connected: boolean,
    error?: string,
    sheetData: BatchGetResponse,
}

/** `OpenModalMessage`/`CloseModalMessage`をbackgroundに送った際のレスポンス */
export type ModalResponse = {
    ok: boolean,
    error?: string
}

/** `ImportToCalendarMessage`をbackgroundに送った際のレスポンス */
export type ImportToCalendarResponse = {
    ok: boolean,
    connected: boolean,
    error?: string
    deletedCount: number,
    createdCount: number
}

/** `SetNumberToSyncStorageMessage`/`GetNumberFromSyncStorage`をbackgroundに送った際のレスポンス */
export type StorageResponse = {
    ok: boolean,
    error?: string,
    values: Record<string, number>
}
