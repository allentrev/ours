import type { ColumnDescriptor } from "../MaintainEntityManager";
import type { PersonRecord } from "../../types/familyTypes";

export function getFamilyPersonColumns(): ColumnDescriptor<PersonRecord>[] {
    return [
        {
            key: "grampsId",
            label: "Gramps Id",
            align: "center",
            optional: false,
        },
        {
            key: "displayName",
            label: "Name",
            align: "center",
            optional: false,
        },
        {
            key: "thumbnail",
            label: "Photo",
            align: "center",
            optional: true,
        },
    ];
}
