import type { CalendarEventIdSourcePair } from "@/types/calendar";

/**
 * sourceがshift-importの予定IDだけを返す
 * @param items :Array<CalendarEventIdSourcePair>
 * @returns `item.id`の配列
 */
export function getShiftImportEventIds(items: CalendarEventIdSourcePair[]): string[] {
    return items
        .filter((item) => item.source === "shift-import" && item.id)
        .map((item) => item.id as string);
}
