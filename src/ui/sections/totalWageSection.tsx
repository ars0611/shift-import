import { useEffect, useState } from "react";
import { EditableNumberRow } from "@/ui/components/Input";
import { LoadingInline } from "@/ui/components/LoadingInline";
import { requestGetNumberFromSyncStorage, requestSetNumberToSyncStorage } from "@/API/clients/storageClient";

type MonthlyWageRow = {
    month: number,
    expectedWage: number,
    actualWage: number,
    actualWageKey: string
};

/** カンマ区切りの数字にフォーマットする
 * @param value フォーマットしたい数字
 * @returns フォーマット後の数字
 */
function formatYen(value: number): string {
    return `${Math.round(value).toLocaleString()}円`;
}

/**
 * 今年の予想月収と実月収を表形式で表示する
 * @returns 給与情報表示セクション
 */
export function TotalWageSection() {
    /** 今年を初期値とする */
    const currentYear = new Date().getFullYear();
    /** テーブルに表示する年数 */
    const [year, setYear] = useState<number>(currentYear);
    /** テーブルに表示するデータ */
    const [rows, setRows] = useState<Array<MonthlyWageRow>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    /** 予想月収の合計 */
    const expectedTotal = rows.reduce((sum, row) => sum + row.expectedWage, 0);
    /** 実月収の合計 */
    const actualTotal = rows.reduce((sum, row) => sum + row.actualWage, 0);

    /** yearが変わるたびにstorageから予想/実月収を取得 */
    useEffect(() => {
        void (async () => {
            setIsLoading(true);
            setError("");

            // 月ごとに予想と実の2キーを作って、まとめて取得する。
            // Arrayは0-indexedなので、mm月に合わせる
            const months = Array.from({ length: 12 }, (_, idx) => idx + 1);
            const keys = months.flatMap((month) => [
                buildMonthlyWageStorageKey({ kind: "expected", year, month }),
                buildMonthlyWageStorageKey({ kind: "actual", year, month }),
            ]);

            // storageから各キーの値を取得
            const res = await requestGetNumberFromSyncStorage(keys);
            if (!res.ok || res.error) {
                setError(res.error ?? "給与情報の取得に失敗しました。");
                setRows([]);
                setIsLoading(false);
                return;
            }

            // 未保存の月は 0 扱いで表示し、テーブルは常に 12 か月分維持する。
            const nextRows = months.map((month) => {
                const expectedWageKey = buildMonthlyWageStorageKey({ kind: "expected", year, month });
                const actualWageKey = buildMonthlyWageStorageKey({ kind: "actual", year, month });

                return {
                    month,
                    expectedWage: res.values[expectedWageKey] ?? 0,
                    actualWage: res.values[actualWageKey] ?? 0,
                    actualWageKey,
                };
            });

            // テーブルに表示するデータを更新
            setRows(nextRows);
            setIsLoading(false);
        })();
    }, [year]);

    return (
        <section className="mt-3">
            <div className="border-b px-1 py-2">
                <h2 className="text-sm font-semibold">給与情報の確認</h2>
            </div>
            <div className="px-1 py-2">
                <div className="mb-2 flex items-center justify-center gap-3 text-sm">
                    <button
                        type="button"
                        onClick={() => setYear((prev) => prev - 1)}
                        className="rounded border px-2 py-0.5 hover:bg-gray-100 hover:cursor-pointer"
                        aria-label="前年を表示"
                    >
                        {"<"}
                    </button>
                    <p className="min-w-20 text-center font-semibold text-gray-700">{year}年</p>
                    <button
                        type="button"
                        onClick={() => setYear((prev) => prev + 1)}
                        className="rounded border px-2 py-0.5 hover:bg-gray-100 hover:cursor-pointer"
                        aria-label="翌年を表示"
                    >
                        {">"}
                    </button>
                </div>
                <p className="mb-2 text-sm text-gray-600">{year}年の予想月収と実月収</p>
                <div className="border">
                    <table className="w-full table-fixed border-collapse text-sm">
                        <colgroup>
                            <col className="w-[18%]" />
                            <col className="w-[32%]" />
                            <col className="w-[50%]" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th className="border px-2 py-1 font-medium">月</th>
                                <th className="border px-2 py-1 font-medium">予想月収</th>
                                <th className="border px-2 py-1 font-medium">実月収</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td className="border px-2 py-2 text-center text-gray-500" colSpan={3}><LoadingInline /></td>
                                </tr>
                            )}
                            {!isLoading && rows.length === 0 && (
                                <tr>
                                    <td className="border px-2 py-2 text-center text-gray-500" colSpan={3}>表示できるデータがありません。</td>
                                </tr>
                            )}
                            {!isLoading && rows.map((row) => (
                                <tr key={`${year}-${row.month}`}>
                                    <td className="border px-2 py-1 text-center">{row.month}月</td>
                                    <td className="border px-2 py-1 text-right">{formatYen(row.expectedWage)}</td>
                                    <td className="border px-1 py-1 align-middle">
                                        <div className="flex justify-end overflow-hidden">
                                            <EditableNumberRow
                                                // 保存値が変わったときに入力欄の初期値を更新するため、値込みでkeyを持たせる。`actualWage`が変わるたびにマウントし直す
                                                key={`${row.actualWageKey}:${row.actualWage}`}
                                                settingKey={row.actualWageKey}
                                                initialValue={row.actualWage}
                                                requestFunc={requestSetNumberToSyncStorage}
                                                unit="円"
                                                onSaved={(nextValue) => {
                                                    // 保存できた行だけ更新して、一覧の再取得はしない。
                                                    setRows((prevRows) => prevRows.map((prevRow) =>
                                                        prevRow.actualWageKey === row.actualWageKey
                                                            ? { ...prevRow, actualWage: nextValue }
                                                            : prevRow
                                                    ));
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && rows.length > 0 && (
                                <tr className="bg-gray-50">
                                    <td className="border px-2 py-1 text-center font-semibold">合計</td>
                                    <td className="border px-2 py-1 text-right font-semibold">{formatYen(expectedTotal)}</td>
                                    <td className="border px-2 py-1 text-right font-semibold">{formatYen(actualTotal)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
            </div>
        </section>
    )
}
