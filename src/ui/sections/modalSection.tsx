import { useState } from "react";
import { CancelButton, TriggerButton } from "@/ui/components/Button";
import { ModalWrapper } from "@/ui/components/Wrapper";
import { LoadingInline } from "@/ui/components/LoadingInline";
import { requestCloseModal } from "@/API/clients/modalClient";
import { requestImportToCalendar } from "@/API/clients/importToCalendarClient";
import { parseBatchGetResponse, toTimeLabel } from "@/utils/sheetMetaUtil";
import { SheetData } from "@/types/sheet";
import { ModalElement } from "@/types/modal";

type ShiftCellProps = {
    sheetData: SheetData,
    onImport: () => Promise<void>
    isLoading?: boolean,
    error?: string
    success?: string
}

/**
 * スプレッドシートから読み取った値をもとに、表形式で出勤日を表示する
 * @param sheetData 整形済みのsheetData
 * @param onImport TriggerButtonで発火する関数
 * @param isLoading 読み込み中の状態
 * @param error エラーメッセージ
 * @param success 成功メッセージ
 * @returns 出勤日の表
 */
function ShiftCell({ sheetData, onImport, isLoading, error, success }: ShiftCellProps) {
    return (
        <>
            <div className="border-b px-4 py-3">
                <h2 className=" text-sm font-semibold">以下の内容でカレンダーに取り込みます。</h2>
                <p className="text-sm text-gray-600">表を確認して問題なければ「取り込む」を押してください。</p>
                <p className="text-sm text-red-700">読み込み中はタブを切り替えないでください。</p>
            </div>

            <div className="px-4 py-3">
                <div className="max-h-[50vh] overflow-auto border">
                    <table className="w-full table-fixed border-collapse text-sm">
                        <thead>
                            <tr>
                                <th className="border px-2 py-1 font-medium">日付</th>
                                <th className="border px-2 py-1 font-medium">出勤</th>
                                <th className="border px-2 py-1 font-medium">退勤</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sheetData[0].map((_, idx) => (
                                <tr key={idx}>
                                    <td className="border px-2 py-1 text-center">{sheetData[0][idx] ?? ""}</td>
                                    <td className="border px-2 py-1 text-center">{sheetData[1][idx] ?? ""}</td>
                                    <td className="border px-2 py-1 text-center">{sheetData[2][idx] ?? ""}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {error && <p className="px-4 pb-2 text-sm text-red-700">{error}</p>}
            {success && <p className="px-4 pb-2 text-sm text-green-800">{success}</p>}
            <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
                <CancelButton onClickFunc={requestCloseModal} label="閉じる" />
                <TriggerButton label={isLoading ? <LoadingInline /> : "この内容で取り込む"} type="submit" onClickFunc={onImport} disabled={isLoading} />
            </div>
        </>
    )
}

type ModalSectionProps = {
    modalElement: ModalElement
}

/**
 * 引数のtypeに応じてモーダル風な画面を表示する
 * @param modalElement
 * @returns モーダル風UI
 */
export function ModalSection({ modalElement }: ModalSectionProps) {
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const shiftPayload = modalElement.payload;

    /**
     * 取り込むボタンクリック時に実行される処理
     * @returns
     */
    async function onImport() {
        if (isLoading) { return; }
        setError('');
        setSuccess('');
        setIsLoading(true);
        const res = await requestImportToCalendar(shiftPayload);

        if (!res.ok || !res.connected) {
            setError(res.error ?? "カレンダーへの取り込みに失敗しました。");
            setIsLoading(false);
            return;
        }

        setSuccess(`既存のシフトを${res.deletedCount}件削除しました。\n 新たにシフトを${res.createdCount}件作成しました。`);
        setIsLoading(false);
    }

    const rawSheetData = parseBatchGetResponse(shiftPayload);
    const sheetData: SheetData = [
        rawSheetData[0] ?? [],
        (rawSheetData[1] ?? []).map((cell) => toTimeLabel(cell)),
        (rawSheetData[2] ?? []).map((cell) => toTimeLabel(cell)),
    ];
    return (
        <ModalWrapper>
            <ShiftCell sheetData={sheetData} onImport={onImport} isLoading={isLoading} error={error} success={success} />
        </ModalWrapper>
    )
}
