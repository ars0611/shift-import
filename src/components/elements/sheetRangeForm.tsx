import { RangePairInput } from "./rangePairInput";
import type { StringTuple } from "@/types/common";

type SheetRangeFormProps = {
    dateRange: StringTuple,
    clockInRange: StringTuple,
    clockOutRange: StringTuple,
    setDateRange: (next: StringTuple) => void,
    setClockInRange: (next: StringTuple) => void,
    setClockOutRange: (next: StringTuple) => void,
}
/**
 * 
 * @params
 * @returns 
 */
export function SheetRangeForm({
    dateRange,
    clockInRange,
    clockOutRange,
    setDateRange,
    setClockInRange,
    setClockOutRange
}: SheetRangeFormProps) {
    return (
        <>
            <RangePairInput label="日付のセル" value={dateRange} onChangeFunc={setDateRange} startPlaceholder="例:A8" endPlaceholder="例:A38" />
            <RangePairInput label="出勤のセル" value={clockInRange} onChangeFunc={setClockInRange} startPlaceholder="例:Z8" endPlaceholder="例:Z38" />
            <RangePairInput label="退勤のセル" value={clockOutRange} onChangeFunc={setClockOutRange} startPlaceholder="例:AA8" endPlaceholder="例:AA38" />
        </>
    )
}
