type BuildMonthlyWageStorageKeyProps = {
    kind: "expected" | "actual",
    year: number,
    month: number
}

/**
 * 月給保存用のsync storageキーを作る
 * @param kind expected:予想月給 / actual:実月給
 * @param year 対象年
 * @param month 対象月
 * @returns 月給保存用キー
 */
export function buildMonthlyWageStorageKey({ kind, year, month }: BuildMonthlyWageStorageKeyProps): string {
    const prefix = kind === "expected" ? "expectedMonthlyWage" : "actualMonthlyWage";
    const twoDigitMonth = String(month).padStart(2, "0");
    return `${prefix}_${year}_${twoDigitMonth}`;
}
