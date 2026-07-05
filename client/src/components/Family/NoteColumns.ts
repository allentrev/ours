import type { ColumnDescriptor } from "../MaintainEntityManager";
import type { NoteRecord } from "../../types/familyTypes";

export function getNoteColumns(): ColumnDescriptor<NoteRecord>[] {
    return [
        {
            key: "handle",
            label: "Note Id",
            align: "center",
            optional: false,
            render: (value: string) => value.slice(-4), 
        },
        {
            key: "text",
            label: "Content",
            align: "left",
            optional: false,
        },
    ];
}
