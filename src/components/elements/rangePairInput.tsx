import { StringTuple } from "@/types/common"

type RangePairInputProps = {
    label: string,
    value: StringTuple,
    onChangeFunc: (next: StringTuple) => void,
    startPlaceholder: string,
    endPlaceholder: string
}
export function RangePairInput({
    label,
    value,
    onChangeFunc,
    startPlaceholder,
    endPlaceholder
}: RangePairInputProps) {
    return (
        <label className="flex gap-3">
            <span>{label}</span>
            <div className="flex items-center">
                <input
                    className="w-16 border border-black rounded"
                    value={value[0]}
                    onChange={e => onChangeFunc([e.target.value, value[1]])}
                    placeholder={startPlaceholder}
                />
                <span>：</span>
                <input
                    className="w-16 border border-black rounded"
                    value={value[1]}
                    onChange={e => onChangeFunc([value[0], e.target.value])}
                    placeholder={endPlaceholder}
                />
            </div>
        </label>
    )
}
