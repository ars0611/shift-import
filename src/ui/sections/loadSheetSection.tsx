import { useActionState } from "react";
import { TriggerButton } from "@/ui/components/Button";
import { FormWrapper } from "@/ui/components/Wrapper";
import { RangePairInput } from "@/ui/components/Input";
import { LoadingInline } from "@/ui/components/LoadingInline";
import { requestLoadSheet } from "@/API/clients/loadSheetClient";
import { requestOpenModal } from "@/API/clients/modalClient";
import { validateSheetRangeForm } from "@/utils/validation";
import { toNullableString } from "@/utils/commonUtil";

const formId = "sheetRangeForm";

type SheetRangeValues = {
    dateStart: string,
    dateEnd: string,
    clockInStart: string,
    clockInEnd: string,
    clockOutStart: string,
    clockOutEnd: string
};

type LoadSheetFormState = {
    error: string,
    values: SheetRangeValues,
    version: number
};

const emptyValues: SheetRangeValues = { dateStart: "", dateEnd: "", clockInStart: "", clockInEnd: "", clockOutStart: "", clockOutEnd: "", };
/** useActionStateの初期状態 */
const initialState: LoadSheetFormState = { error: "", values: emptyValues, version: 0 };

export function LoadSheetSection() {
    /** form送信時に実行される処理。 useActionState から呼ばれ、次の画面状態を返す。*/
    async function actionFunc(prevState: LoadSheetFormState, formData: FormData): Promise<LoadSheetFormState> {
        const nextVersion = prevState.version + 1;

        // formの入力値を得る
        const values: SheetRangeValues = {
            dateStart: toNullableString(formData.get("dateStart")),
            dateEnd: toNullableString(formData.get("dateEnd")),
            clockInStart: toNullableString(formData.get("clockInStart")),
            clockInEnd: toNullableString(formData.get("clockInEnd")),
            clockOutStart: toNullableString(formData.get("clockOutStart")),
            clockOutEnd: toNullableString(formData.get("clockOutEnd")),
        }

        // formの入力値のバリデーション
        const validationRes = validateSheetRangeForm(values);
        if (!validationRes.ok) {
            return {
                error: validationRes.error ?? "入力値が正しくありません。",
                values,
                // key更新で入力欄を再マウントし、`defaultValue`を更新する。
                version: nextVersion
            };
        }

        // background.tsにシートの読み込みを依頼
        const { dateStart, dateEnd, clockInStart, clockInEnd, clockOutStart, clockOutEnd } = values;
        const ranges = [`${dateStart}:${dateEnd}`, `${clockInStart}:${clockInEnd}`, `${clockOutStart}:${clockOutEnd}`];
        const loadSheetRes = await requestLoadSheet(ranges);
        if (!loadSheetRes.ok || !loadSheetRes.connected) {
            return {
                error: loadSheetRes.error ?? "シートの読み込みに失敗しました。",
                values,
                // エラー表示時も同様に keyを進めて入力欄の表示を揃える。
                version: nextVersion
            };
        }

        // 読み込んだシートの内容をもとにモーダルを開く
        const openModalRes = await requestOpenModal({ type: "SHIFT_CELL", payload: loadSheetRes.sheetData });
        if (!openModalRes?.ok) {
            return {
                error: openModalRes.error ?? "モーダルの表示に失敗しました。",
                values,
                version: nextVersion
            };
        }
        return {
            error: '',
            values,
            version: nextVersion
        };
    }

    // state: 現在の表示状態, formAction: <form action> に渡す関数, isPending: 送信中フラグ
    const [state, formAction, isPending] = useActionState<LoadSheetFormState, FormData>(actionFunc, initialState);

    return (
        <section className="mt-3">
            <div className="border-b px-1 py-2">
                <h2 className="text-sm font-semibold">読み込み範囲の指定</h2>
            </div>
            <FormWrapper formId={formId} actionFunc={formAction}>
                <p className="my-1 text-sm text-red-700">{state.error}</p>
                <RangePairInput
                    label="日付のセル"
                    startName="dateStart"
                    endName="dateEnd"
                    startPlaceholder="例: A8"
                    endPlaceholder="例: A38"
                    startDefaultValue={state.values.dateStart}
                    endDefaultValue={state.values.dateEnd}
                    // version を key に含めることで、defaultValueの再適用を保証する。
                    key={`date:${state.version}`}
                />
                <RangePairInput
                    label="出勤のセル"
                    startName="clockInStart"
                    endName="clockInEnd"
                    startPlaceholder="例: Z8"
                    endPlaceholder="例: Z38"
                    startDefaultValue={state.values.clockInStart}
                    endDefaultValue={state.values.clockInEnd}
                    // 各入力行は独立して再マウントさせるため、接頭辞を分けている。
                    key={`clockIn:${state.version}`}
                />
                <RangePairInput
                    label="退勤のセル"
                    startName="clockOutStart"
                    endName="clockOutEnd"
                    startPlaceholder="例: AA8"
                    endPlaceholder="例: AA38"
                    startDefaultValue={state.values.clockOutStart}
                    endDefaultValue={state.values.clockOutEnd}
                    key={`clockOut:${state.version}`}
                />
                <div className="mt-2 flex justify-center">
                    <TriggerButton label={isPending ? <LoadingInline /> : "シートを読み込む"} type="submit" disabled={isPending} />
                </div>
            </FormWrapper>
        </section>
    );
}
