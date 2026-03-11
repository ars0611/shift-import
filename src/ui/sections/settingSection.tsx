import { useEffect, useState } from "react";
import { EditableNumberRow } from "@/ui/components/Input";
import { requestGetNumberFromSyncStorage, requestSetNumberToSyncStorage } from "@/API/clients/storageClient";

/**
 * 時給と交通費を編集してstorageに保存する表
 * @returns 時給・交通費設定セクション
 */
export function SettingSection() {
    const [hourlyWage, setHourlyWage] = useState(0);
    const [transportationFee, setTransportationFee] = useState(0);

    // 初回表示時に、保存済みの時給/交通費を同期ストレージから読み込む
    useEffect(() => {
        void (async () => {
            const res = await requestGetNumberFromSyncStorage(["hourlyWage", "transportationFee"]);
            if (res.ok && !res.error) {
                setHourlyWage(res.values["hourlyWage"]);
                setTransportationFee(res.values["transportationFee"]);
            }
        })();
    }, []);

    return (
        <section className="mt-3">
            <div className="border-b px-1 py-2">
                <h2 className="text-sm font-semibold">時給・交通費の設定</h2>
            </div>
            <table className="mt-2 w-full table-fixed border-collapse text-sm">
                <thead>
                    <tr>
                        <th className="border px-2 py-1 font-medium">時給</th>
                        <td className="border px-2 py-1 text-right">
                            <EditableNumberRow
                                // 保存値が変わったときに入力欄の初期値を更新するため、値込みでkeyを持たせる。`hourlyWage`が変わるたびにマウントし直す
                                key={`hourlyWage:${hourlyWage}`}
                                unit="円"
                                settingKey="hourlyWage"
                                initialValue={hourlyWage}
                                requestFunc={requestSetNumberToSyncStorage}
                            />
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th className="border px-2 py-1 font-medium">交通費</th>
                        <td className="border px-2 py-1 text-right">
                            <EditableNumberRow
                                // 時給と同様、保存後の値を入力欄に反映するための key。`transportationFee`が変わるたびにマウントし直す
                                key={`transportationFee:${transportationFee}`}
                                unit="円"
                                settingKey="transportationFee"
                                initialValue={transportationFee}
                                requestFunc={requestSetNumberToSyncStorage}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    );
}
