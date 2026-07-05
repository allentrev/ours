import type { ColumnDescriptor } from "../MaintainEntityManager";
import type { FamilyRecord } from "../../types/familyTypes";

export function getFamilyColumns(): ColumnDescriptor<FamilyRecord>[] {
    return [
        {
            key: "handle",
            label: "Family Id",
            align: "center",
            optional: false,
            render: (value: string) => value.slice(-4), 
        },
        {
            key: "fatherHandle",
            label: "Father",
            align: "center",
            optional: false,
        },
    ];
}
