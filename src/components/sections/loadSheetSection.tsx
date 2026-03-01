import { useState } from "react";
import { SheetRangeForm } from "../elements/sheetRangeForm";
import { LoadSheetButton } from "../elements/loadSheetButton";
import { requestLoadSheet } from "@/lib/clients/loadSheetClient";
import type { StringTuple } from "@/types/common";
import type { SheetData } from "@/types/sheet";

export function LoadSheetSection() {
    const [sheetData, setSheetData] = useState<SheetData>([[]]);
    const [loadError, setLoadError] = useState<string>('');
    const [dateRange, setDateRange] = useState<StringTuple>(['', '']);
    const [clockInRange, setClockInRange] = useState<StringTuple>(['', '']);
    const [clockOutRange, setClockOutRange] = useState<StringTuple>(['', '']);

    /**
     * 
     */
    async function onLoad() {
        setLoadError('')
        if (!dateRange[0] || !dateRange[1] || !clockInRange[0] || !clockInRange[1] || !clockOutRange[0] || !clockOutRange[1]) {
            setLoadError("範囲の指定に空欄があります");
            return
        }
        try {
            const res = await requestLoadSheet([`${dateRange[0]}:${dateRange[1]}`, `${clockInRange[0]}:${clockInRange[1]}`, `${clockOutRange[0]}:${clockOutRange[1]}`]);
            setSheetData(res.ok && res.connected ? res.sheetData : [[]]);
            setLoadError(res.error ? res.error : '');
        } catch (e) {
            setLoadError(e instanceof Error ? e.message : String(e));
        }
    }
    return (
        <>
            <SheetRangeForm
                dateRange={dateRange}
                clockInRange={clockInRange}
                clockOutRange={clockOutRange}
                setDateRange={setDateRange}
                setClockInRange={setClockInRange}
                setClockOutRange={setClockOutRange}
            />
            <LoadSheetButton onClickFunc={onLoad} />
            {loadError && <p>{loadError}</p>}
            {sheetData && <p>{sheetData}</p>}
        </>
    )
}
