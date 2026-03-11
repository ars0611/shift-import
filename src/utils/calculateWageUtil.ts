import { BatchGetResponse } from "@/types/sheet";

/** 分単位で表した休憩時間帯 */
type BreakRange = {
    startMinute: number;
    endMinute: number;
};

// 休憩時間（分単位）
const BREAK_RANGES: Array<BreakRange> = [
    { startMinute: 11 * 60 + 30, endMinute: 12 * 60 + 30 }, // 11:30-12:30
    { startMinute: 14 * 60, endMinute: 14 * 60 + 10 },      // 14:00-14:10
    { startMinute: 15 * 60 + 40, endMinute: 15 * 60 + 50 }, // 15:40-15:50
    { startMinute: 17 * 60 + 20, endMinute: 17 * 60 + 30 }, // 17:20-17:30
    { startMinute: 19 * 60, endMinute: 19 * 60 + 30 },      // 19:00-19:30
];

/**
 * シートの時刻セル値（例: `9.5`）を分に変換する。
 * @param value 時刻セル値（hh時を10進数で表した値）
 * @returns 0:00からの経過分。変換不可の場合は `null`
 */
function toMinute(value: string | number | null | undefined): number | null {
    // セルが空の場合
    if (value === null || value === undefined || value === "") { return null; }
    const num = typeof value === "number" ? value : Number(value);
    // ありえないが、セル値が数字出なかった場合
    if (Number.isNaN(num)) { return null; }
    return Math.round(num * 60);
}

type GetOverlapMinutesProps = {
    startMinute: number;
    endMinute: number;
    breakRange: BreakRange;
};

/**
 * 勤務区間と休憩区間の重なり分（分単位）を求める
 * @param startMinute 出勤時刻（分単位）
 * @param endMinute 退勤時刻（分単位）
 * @param breakRange 休憩区間（分単位）
 * @returns 重複している分数
 */
function getOverlapMinutes({ startMinute, endMinute, breakRange }: GetOverlapMinutesProps): number {
    const overlapStart = Math.max(startMinute, breakRange.startMinute);
    const overlapEnd = Math.min(endMinute, breakRange.endMinute);
    return Math.max(0, overlapEnd - overlapStart);
}

type CalculateDailyWageProps = {
    clockInCell: string | number | null | undefined;
    clockOutCell: string | number | null | undefined;
    hourlyWage: number;
    transportationFee: number;
};

/**
 * 1日分の給料を計算する
 * @param clockInCell 出勤時間のセル値 （例: 10.5）
 * @param clockOutCell 退勤時間のセル値（例: 16）
 * @param hourlyWage 時給
 * @param transportationFee 交通費
 * @returns 1日分の給料（円）
 */
export function calculateDailyWage({ clockInCell, clockOutCell, hourlyWage, transportationFee, }: CalculateDailyWageProps): number {
    // セルの入力値が渡されるので分単位に戻す
    const startMinute = toMinute(clockInCell);
    const endMinute = toMinute(clockOutCell);
    if (startMinute === null || endMinute === null || endMinute <= startMinute) {
        return 0;
    }

    // 勤務時間に含まれる休憩時間を求めて、実働を出す
    const workMinutes = endMinute - startMinute;
    const breakMinutes = BREAK_RANGES.reduce(
        (sum, breakRange) => sum + getOverlapMinutes({ startMinute, endMinute, breakRange }),
        0
    );

    // 実働をもとに給与を出し、交通費も含めて返す
    const paidMinutes = Math.max(0, workMinutes - breakMinutes);
    const baseWage = Math.round((paidMinutes / 60) * hourlyWage);
    return baseWage + transportationFee;
}

type CalculateEstimatedMonthlyWageProps = {
    batchGetResponse: BatchGetResponse;
    hourlyWage: number;
    transportationFee: number;
};

/**
 * batchGetResponse から月の合計給料を計算する
 * @param batchGetResponse batchGetレスポンス
 * @param hourlyWage 時給
 * @param transportationFee 交通費
 * @returns 月の合計給料
 */
export function calculateEstimatedMonthlyWage({ batchGetResponse, hourlyWage, transportationFee, }: CalculateEstimatedMonthlyWageProps): number {
    // valueRanges は [日付列, 出勤列, 退勤列] の想定
    const clockInCells = batchGetResponse.valueRanges[1]?.values?.[0] ?? [];
    const clockOutCells = batchGetResponse.valueRanges[2]?.values?.[0] ?? [];
    // 列長がずれるケースを考慮して最短長で走査
    const rowCount = Math.min(clockInCells.length, clockOutCells.length);

    let totalWage = 0;
    for (let i = 0; i < rowCount; i++) {
        const wage = calculateDailyWage({ clockInCell: clockInCells[i], clockOutCell: clockOutCells[i], hourlyWage, transportationFee, });
        totalWage += wage;
    }

    return totalWage;
}
