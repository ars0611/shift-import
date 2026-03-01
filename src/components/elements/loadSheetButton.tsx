type LoadSheetButtonProp = {
    onClickFunc: () => void | Promise<void>
}

export function LoadSheetButton({ onClickFunc }: LoadSheetButtonProp) {
    return (
        <button
            type="button"
            onClick={onClickFunc}
            className="rounded border border-black"
        >
            閲覧中のシートを読み込む
        </button>
    )
}
