import type { ColumnDescriptor } from "../MaintainEntityManager";
import type { PlaceRecord } from "../../types/familyTypes";

export function getPlaceColumns(): ColumnDescriptor<PlaceRecord>[] {
    return [
        {
            key: "grampsId",
            label: "Gramps Id",
            align: "center",
            optional: false,
        },
        {
            key: "shortName",
            label: "Village/Town/City/Country",
            align: "center",
            optional: true,
        },
    ];
}
