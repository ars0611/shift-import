import { ExtensionMessage } from "@/types/message";
import { BatchGetResponse } from "@/types/sheet";
import { createRoot, Root } from "react-dom/client";
import tailwindCss from "@/entrypoints/popup/style.css?inline"; // tailwindcss有効化
import { ModalElement } from "@/types/modal";
import { ModalSection } from "@/ui/sections/modalSection";

/** モーダルを開く前のダミーデータ */
const initialBatchGetResponse: BatchGetResponse = {
    spreadSheetId: "",
    valueRanges: [
        { range: "", majorDimension: "COLUMNS", values: [[]] },
        { range: "", majorDimension: "COLUMNS", values: [[]] },
        { range: "", majorDimension: "COLUMNS", values: [[]] },
    ],
}

/**
 * Google スプレッドシート画面上で、モーダル用UIを表示するcontent script。
 * backgroundからの `OPEN_MODAL` / `CLOSE_MODAL`メッセージを受けて、Shadow DOM上にマウント/アンマウントする。
 */
export default defineContentScript({
    matches: ["https://docs.google.com/*"],
    cssInjectionMode: "ui",
    /**
     * content script の初期化処理。
     * @param ctx WXT が提供する content script 実行コンテキスト
     */
    async main(ctx) {
        /** モーダル UI が現在マウント済みかどうか */
        let mounted = false;
        /** モーダルが参照する最新の表示データ */
        let currentModalElement: ModalElement = {
            type: "SHIFT_CELL",
            payload: initialBatchGetResponse
        }
        /** Shadow DOM 内に作成したReact root */
        let rootRef: Root | null = null;

        /** 現在保持している modalElement で再描画する */
        function renderModal(): void {
            if (!rootRef) { return; }
            rootRef.render(<ModalSection modalElement={currentModalElement} />)
        }

        /** モーダル UI を閉じて参照を破棄する */
        function closeModal(): void {
            if (!mounted) { return; }
            ui.remove();
            mounted = false;
            rootRef = null;
        }

        /**
         * モーダル UI を開く。
         * 初回は mount、2回目以降は payload を更新して再描画する。
         */
        function openModal(modalElement: ModalElement): void {
            currentModalElement = modalElement;
            if (!mounted) {
                ui.mount();
                mounted = true;
                return;
            }
            renderModal();
        }

        const ui = await createShadowRootUi(ctx, {
            name: "shift-importer-modal",
            position: "modal",
            anchor: "body",
            css: tailwindCss, // Shadow DOMへTailwind注入
            onMount(container) {
                // WXTが用意したコンテナ配下にReactの描画先を作る。
                const wrapper = document.createElement("div");
                container.append(wrapper);
                const root = createRoot(wrapper);
                rootRef = root;
                renderModal();
                return { root, wrapper }
            },
            onRemove(elements) {
                // Shadow UI 破棄時にReactツリーとDOMを確実に解放する。
                elements?.root.unmount();
                elements?.wrapper.remove();
            },
        });

        /** background からのモーダル制御メッセージを処理する */
        chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
            if (message.type === "OPEN_MODAL") {
                openModal(message.modalElement);
                sendResponse({ ok: true });
                return;
            } else if (message.type === "CLOSE_MODAL") {
                closeModal();
                sendResponse({ ok: true });
                return
            }
        })
    },
});
