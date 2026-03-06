type TriggerButtonProps = {
    label: string,
    type?: "button" | "submit",
    onClickFunc?: () => void | Promise<void>
}

/**
 * 実行ボタンを表示する
 * @param label ボタンに表示するテキスト
 * @param onClickFunc ボタンクリック時に呼ばれる処理
 * @returns 実行用のボタンUI
 */
export function TriggerButton({ label, type, onClickFunc }: TriggerButtonProps) {
    return (
        <button
            type={type}
            onClick={onClickFunc}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
            {label}
        </button>
    )
}
type CancelButtonProps = {
    onClickFunc: () => void | Promise<void>
}
/**
 * キャンセルボタンを表示する
 * @param onClickFunc クリック時に呼ばれる処理
 * @returns キャンセルのボタンUI
 */
export function CancelButton({ onClickFunc }: CancelButtonProps) {
    return (
        <button
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            onClick={onClickFunc}
        >
            キャンセル
        </button>
    )
}
