import { ReactNode } from "react";

type ModalWrapperProps = {
    children: ReactNode
}

/**
 * モーダル風にpropsのUIを表示する
 * @param children 
 * @returns
 * @remarks 画面左に寄って表示される（popupと重なるのを防ぐため）
 */
export function ModalWrapper({ children }: ModalWrapperProps) {
    return (
        <div className="fixed inset-0 z-[998244353] grid place-items-center bg-black/50 justify-start p-4 pl-6">
            <div className="w-full max-w-md rounded border bg-white">
                {children}
            </div>
        </div>
    )
}

type FormWrapperProps = {
    formId: string,
    actionFunc: (FormData: FormData) => void | Promise<void>,
    children: ReactNode
}

/**
 * 注意書きとフォームを表示する
 * @returns フォームのラッパーUI
 * @see https://ja.react.dev/reference/react-dom/components/form
 */
export function FormWrapper({ formId, actionFunc, children }: FormWrapperProps) {
    return (
        <>
            <p className="my-1 text-sm text-red-700">
                ※すべて必須です。
            </p>
            <form id={formId} action={actionFunc} autoComplete="on">
                {children}
            </form>
        </>
    )
}
