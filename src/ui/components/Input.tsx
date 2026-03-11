import { useActionState } from "react";
import { Download, Loader, PencilLine } from "lucide-react";
import { StorageResponse } from "@/types/message";
import { SettingPair } from "@/types/setting";

type RangePairInputProps = {
    label: string,
    startName: string,
    endName: string,
    startPlaceholder: string,
    endPlaceholder: string,
    startDefaultValue: string,
    endDefaultValue: string,
};

/**
 * 開始セルと終了セルの入力欄を1行で表示する。
 * @param props 入力欄ラベル、name、placeholder、初期値
 * @returns セル範囲入力 UI
 */
export function RangePairInput({
    label,
    startName,
    endName,
    startPlaceholder,
    endPlaceholder,
    startDefaultValue,
    endDefaultValue
}: RangePairInputProps) {
    return (
        <label className="mb-2 flex gap-3">
            <span className="text-sm font-medium">{label}</span>
            <div className="flex items-center">
                <input
                    className="h-6 w-24 rounded border-[1.5px] border-gray-500 bg-gray-100 px-2"
                    name={startName}
                    defaultValue={startDefaultValue}
                    placeholder={startPlaceholder}
                    autoComplete="on"
                    required
                />
                <span>：</span>
                <input
                    className="h-6 w-24 rounded border-[1.5px] border-gray-500 bg-gray-100 px-2"
                    name={endName}
                    defaultValue={endDefaultValue}
                    placeholder={endPlaceholder}
                    autoComplete="on"
                    required
                />
            </div>
        </label>
    );
}

type EditableNumberRowProps = {
    unit?: string,
    settingKey: string,
    initialValue: number
    requestFunc: ({ key, value }: SettingPair) => Promise<StorageResponse>,
    onSaved?: (nextValue: number) => void
}

type EditableNumberState = {
    isEditing: boolean,
    value: number,
}

/**
 * 数値設定の 編集/保存 UIを1行で表示する。
 * 初回クリックで編集モードに切り替わり、次のクリックで保存を実行する。
 * @param props コンポーネントに渡す設定
 * @param unit 値の右に表示する単位（例: `円`）
 * @param settingKey 保存対象キー
 * @param initialValue 初期表示値
 * @param requestFunc 保存 API 実行関数
 * @param onSaved 保存成功時に実行する処理
 * @returns 数値編集 UI
 * @remarks `requestFunc` は client 層で定義した関数を渡す想定
 * @see https://ja.react.dev/reference/react/useActionState
 */
export function EditableNumberRow({ unit, settingKey, initialValue, requestFunc, onSaved }: EditableNumberRowProps) {
    const initialState: EditableNumberState = { isEditing: false, value: initialValue}

    /**
     * フォーム送信時の状態遷移を定義する。
     * - 非編集時: 編集モードへ切り替え
     * - 編集時: 入力値を保存して表示値を更新
     */
    async function handleClick(prevFormData: EditableNumberState, formData: FormData): Promise<EditableNumberState> {
        if (!prevFormData.isEditing) {
            return { ...prevFormData, isEditing: true };
        }

        // 入力欄の値をnumberに変換して保存する。
        const value = Number(formData.get("amount"));
        const res = await requestFunc({ key: settingKey, value });
        if (!res.ok || res.error) {
            return { ...prevFormData, isEditing: false };
        }

        // 保存成功時はstorage側の値を表示に反映する。
        const nextValue = res.values[settingKey];
        onSaved?.(nextValue);
        return { isEditing: false, value: nextValue}
    }

    /** useActionState でフォーム送信状態と表示値を管理する。 */
    const [state, formAction, isPending] = useActionState<EditableNumberState, FormData>(handleClick, initialState);

    /** 入力/保存の状態に応じて切り替えるアイコン。 */
    const icon = isPending
        ? <Loader className="h-4 w-4 animate-spin" />
        : state.isEditing ? <Download className="h-4 w-4" />
            : <PencilLine className="h-4 w-4" />;

    return (
        <form action={formAction} className="flex items-end border-b">
            <input
                name="amount"
                type="number"
                min="0"
                step="1"
                defaultValue={state.value}
                disabled={!state.isEditing}
                className="h-6 w-24 rounded px-2 text-right"
            />
            <span className="text-sm">{unit}</span>
            <button
                type="submit"
                disabled={isPending}
                className="px-2 pb-1 text-xs disabled:opacity-50 hover:cursor-pointer"
            >
                {icon}
            </button>
        </form>
    );
}
