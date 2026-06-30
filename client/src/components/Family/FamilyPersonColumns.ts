import type { ColumnDescriptor } from "../MaintainEntityManager";
import type { PersonRecord } from "../../types/familyTypes";
import { outFormPhotoMarker } from "../../utilities/Family/utils";

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
            key: "primaryPhotoUrl",
            label: "Photo",
            align: "center",
            optional: true,
            render: (value: string | undefined) => outFormPhotoMarker(value), 
        },
    ];
}
