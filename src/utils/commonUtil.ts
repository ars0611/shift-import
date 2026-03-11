/**
 * formData.getで得た値を文字列に整形する
 * @param value formData.getで得た値
 * @return `value` 整形後のvalue
 * @remarks `FormDataEntryValue`という型により、生の値のままvalidateに渡せないため必要
 */
export function toNullableString(value: FormDataEntryValue | null): string {
    return typeof value === "string" ? value : '';
}

type GetNextYearMonthProps = {
    year: number,
    month: number
}

/**
 * 年月から翌月の年月を得る
 * @param year 元の年
 * @param month 元の月
 * @returns 翌月の年月
 */
export function getNextYearMonth({ year, month }: GetNextYearMonthProps): { year: number, month: number } {
    if (month === 12) {
        return { year: year + 1, month: 1 };
    }
    return { year, month: month + 1 };
}
