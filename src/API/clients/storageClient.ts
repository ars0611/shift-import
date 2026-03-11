import { StorageResponse } from "@/types/message";
import { toRuntimeErrorMessage } from "./runtimeClient";

type RequestToSyncStorageProps = {
    key: string,
    value: number
}

/**
 * background.tsにsync storageへの値の代入を依頼する
 * @param key 代入したい値のキー
 * @param value 代入したい値
 * @returns 依頼の結果のレスポンス
 * @remarks `chrome.runtime.sendMessage` で `{ type: "SET_NUMBER_TO_SYNCSTORAGE" }` を送信し、background.tsからの応答を `StorageResponse`として扱う
 */
export async function requestSetNumberToSyncStorage({ key, value }: RequestToSyncStorageProps): Promise<StorageResponse> {
    try {
        const res = await chrome.runtime.sendMessage({ type: "SET_NUMBER_TO_SYNCSTORAGE", key, value });
        return res;
    } catch (e) {
        return {
            ok: false,
            error: toRuntimeErrorMessage(e, "保存リクエストの送信に失敗しました。"),
            values: {}
        };
    }
}

/**
 * background.tsにsync storageからの値の取得を依頼する
 * @param keys 取得したい値のキーの配列
 * @returns 依頼の結果のレスポンス
 * @remarks `chrome.runtime.sendMessage` で `{ type: "GET_NUMBER_FROM_SYNCSTORAGE" }` を送信し、background.tsからの応答を `StorageResponse`として扱う
 */
export async function requestGetNumberFromSyncStorage(keys: Array<string>): Promise<StorageResponse> {
    try {
        const res = await chrome.runtime.sendMessage({ type: "GET_NUMBER_FROM_SYNCSTORAGE", keys })
        return res;
    } catch (e) {
        return {
            ok: false,
            error: toRuntimeErrorMessage(e, "取得リクエストの送信に失敗しました。"),
            values: {}
        };
    }
}
