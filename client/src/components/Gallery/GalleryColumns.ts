import type { ColumnDescriptor } from "../../components/MaintainEntityManager";
import { outFormFolderName } from "../../utilities/galleryUtils";
import type { GalleryRecord } from "../../types/galleryTypes";

export function getGalleryColumns(): ColumnDescriptor<GalleryRecord>[] {
  return [
    {
      key: "base",
      label: "Base",
      align: "center",
      optional: false,
      render: (value: string | undefined) => value || "",
    },
    {
      key: "folder",
      label: "Folder",
      align: "center",
      optional: false,
      render: (value: string | undefined) => outFormFolderName(value || ""), // display-friendly
    },
    {
      key: "access",
      label: "Access",
      align: "center",
      optional: false,
      render: (value: string | undefined) => value || "",
    },
    {
      key: "title",
      label: "Title",
      align: "center",
      optional: false,
      render: (value: string | undefined) => value || "",
    },
  ];
}
