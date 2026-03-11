/** 予定1つのプロパティ */
export type CalendarEventItem = {
    id?: string;
    extendedProperties?: {
        private?: {
            source?: string;
        };
    };
};

/** list:getで得た予定群 */
export type CalendarEventsListResponse = {
    items?: Array<CalendarEventItem>
}

/** 予定のプロパティから抜粋したpair  */
export type CalendarEventIdSourcePair = {
    id?: string;
    source?: string;
};
