import { ModalResponse } from "@/types/message";
import { ModalElement } from "@/types/modal";
import { toRuntimeErrorMessage } from "./runtimeClient";

/**
 * background.tsにモーダルを開くよう依頼する
 * @returns モーダル制御の結果を表すレスポンス
 * @remarks `chrome.runtime.sendMessage` で `{ type: "OPEN_MODAL" }` を送信し、background.tsからの応答を `ModalResponse`として扱う
 */
export async function requestOpenModal(modalElement: ModalElement): Promise<ModalResponse> {
    try {
        const res = await chrome.runtime.sendMessage({ type: "OPEN_MODAL", modalElement: modalElement });
        return res;
    } catch (e) {
        return {
            ok: false,
            error: toRuntimeErrorMessage(e, "モーダル表示リクエストの送信に失敗しました。")
        };
    }
}

/**
 * background.tsにモーダルを閉じるよう依頼する
 * @returns モーダル制御の結果を表すレスポンス
 * @remarks `chrome.runtime.sendMessage` で `{ type: "CLOSE_MODAL" }` を送信し、background.tsからの応答を `ModalResponse`として扱う
 */
export async function requestCloseModal(): Promise<ModalResponse> {
    try {
        const res = await chrome.runtime.sendMessage({ type: "CLOSE_MODAL" });
        return res;
    } catch (e) {
        return {
            ok: false,
            error: toRuntimeErrorMessage(e, "モーダルクローズリクエストの送信に失敗しました。")
        };
    }
}
