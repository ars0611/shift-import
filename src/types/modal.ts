import { BatchGetResponse } from "./sheet"

/** ModalSectionで表示する内容 */
export type ModalElement = {
    type: "SHIFT_CELL",
    payload: BatchGetResponse
}
