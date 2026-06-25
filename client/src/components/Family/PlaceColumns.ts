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
            key: "line1",
            label: "line1",
            align: "center",
            optional: false,
        },
        {
            key: "urbanArea",
            label: "Village/Town/City",
            align: "center",
            optional: true,
        },
    ];
}
