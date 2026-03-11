import { ReactNode } from "react";
import { ClickHandler } from "@/types/common";

type TriggerButtonProps = {
    label: ReactNode,
    type?: "button" | "submit",
    onClickFunc?: ClickHandler,
    disabled?: boolean
}

/**
 * 実行ボタンを表示する
 * @param label ボタンに表示するテキストまたは要素
 * @param type buttonの属性
 * @param onClickFunc ボタンクリック時に呼ばれる処理
 * @param disabled buttonの属性
 * @returns 実行用のボタンUI
 */
export function TriggerButton({ label, type, onClickFunc, disabled }: TriggerButtonProps) {
    return (
        <button
            type={type}
            onClick={onClickFunc}
            disabled={disabled}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 hover:cursor-pointer"
        >
            {label}
        </button>
    )

}
type CancelButtonProps = {
    onClickFunc: ClickHandler
    label?: string
}

/**
 * キャンセルボタンを表示する
 * @param onClickFunc クリック時に呼ばれる処理
 * @param label ボタンに表示する文字。基本キャンセル
 * @returns キャンセルのボタンUI
 */
export function CancelButton({ onClickFunc, label = "キャンセル" }: CancelButtonProps) {
    return (
        <button
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 hover:cursor-pointer"
            onClick={onClickFunc}
        >
            {label}
        </button>
    )
}
