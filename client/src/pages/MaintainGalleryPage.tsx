import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import MaintainPageLayout from "../layouts/MaintainPageLayout";
import { MaintainEntityManager } from "../components/MaintainEntityManager";
import { Commands } from "../components/Commands";
import backgroundImage from "../assets/green1.jpg";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";

import type { GalleryRecord } from "../types/galleryTypes";
import { getGalleryColumns } from "../components/Gallery/GalleryColumns";
import EditFormArea from "../components/Gallery/GalleryEditFormArea";
import { ThumbnailPanel } from "../components/Gallery/Thumbnail";
import type { Image } from "../types/galleryTypes";
import { createGallery, updateGallery, deleteGallery, getAllGallery, getGalleryImages, importFile, deleteImageFromCDN } from "../utilities";
import { useConfirmDialog } from "../hooks/useConfirmDialog";

const MaintainGalleryPage: React.FC = () => {
  const { confirm, dialog } = useConfirmDialog();
  const { isAuthenticated } = useAuth();

  const [gallery, setGallery] = useState<GalleryRecord[]>([]);
  const [selectedItems, setSelectedItems] = useState<GalleryRecord[]>([]);
  const [itemBeingEdited, setItemBeingEdited] = useState<GalleryRecord | null>(null);
  const [isNewEdit, setIsNewEdit] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [imagesMode, setImagesMode] = useState(false);

  const [images, setImages] = useState<Image[]>([]);
  const [selectedThumbnails, setSelectedThumbnails] = useState<Image[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTarget, setUploadTarget] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllGallery();
        setGallery(data);
      } catch (error) {
        console.error("Failed to load Gallery data:", error);
        toast.error("Failed to load Gallery data");
      }
    };
    fetchData();
  }, []);

  const isSelected = (item: GalleryRecord) => selectedItems.some((i) => i._id === item._id);
  const onSelectItem = (item: GalleryRecord) => setSelectedItems((prev) =>
    prev.some((i) => i._id === item._id) ? prev.filter((i) => i._id !== item._id) : [...prev, item]
  );

  const newGallery: GalleryRecord = { base: "2026", access: "public", title: "", folder: "", cover: "", images: [] };
  const validateGallery = (g: GalleryRecord | null) => {
    if (!g) return { valid: false, error: "Gallery is missing." };
    if (!g.folder?.trim()) return { valid: false, error: "Folder name is required." };
    if (!g.title?.trim()) return { valid: false, error: "Gallery title is required." };
    return { valid: true };
  };

  const resetState = () => {
    setEditMode(false);
    setImagesMode(false);
    setItemBeingEdited(null);
    setSelectedItems([]);
    setImages([]);
    setSelectedThumbnails([]);
    setUploadProgress(0);
    setUploadTarget(0);
  };

  const handleCreate = () => { setItemBeingEdited(newGallery); setIsNewEdit(true); setSelectedItems([]); setEditMode(true); setImagesMode(false); };
  const handleEditSelected = () => { if (selectedItems.length === 1) { setItemBeingEdited(selectedItems[0]); setIsNewEdit(false); setEditMode(true); setImagesMode(false); } };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;
    const itemToDelete = selectedItems[0];
    const images = await getGalleryImages(itemToDelete.base, itemToDelete.folder);
    if (images.length > 0) { toast.error("Cannot delete: gallery is not empty"); return; }
    const shouldDelete = await confirm({ title: "Delete Gallery", message: "Are you sure you want to delete this gallery?", confirmLabel: "Delete", cancelLabel: "Cancel" });
    if (!shouldDelete) return;
    try { await deleteGallery(itemToDelete); setGallery((prev) => prev.filter((g) => g._id !== itemToDelete._id)); toast.success("Gallery deleted successfully"); resetState(); }
    catch (err) { console.error("Delete failed:", err); toast.error(`Delete failed: ${(err as Error).message}`); }
  };

  const handleSave = async () => {
    if (!itemBeingEdited) return;
    const result = validateGallery(itemBeingEdited);
    if (!result.valid) { toast.error(result.error); return; }
    try {
      const saved = isNewEdit ? await createGallery(itemBeingEdited) : await updateGallery(itemBeingEdited);
      setGallery((prev) => { const exists = prev.some((g) => g._id === saved._id); return exists ? prev.map((g) => (g._id === saved._id ? saved : g)) : [...prev, saved].sort((a,b) => a.folder.localeCompare(b.folder)); });
      toast.success(isNewEdit ? "Gallery created successfully" : "Gallery updated successfully");
      resetState();
    } catch (err) { console.error("Save error:", err); toast.error((err as Error).message || "Failed to save gallery"); }
  };

  const handleOpenImages = async () => {
    if (!selectedItems[0]) return;
    setImagesMode(true); setEditMode(false); setItemBeingEdited(null);
    const folder = selectedItems[0].folder;
    const base = selectedItems[0].base;
    //console.log("handleOpenImages");
    //console.log(base,folder);
    try {
      const images: Image[] = await getGalleryImages(base, folder);
      setImages( images );
      setSelectedThumbnails([]);
    } catch (err) { console.error("Failed to load images:", err); toast.error("Failed to load images"); }
  };

  const handleUploadFiles = async (files: File[]) => {
    if (!selectedItems[0] || files.length === 0) return;
    const folder = selectedItems[0].folder;
    const base = selectedItems[0].base;
    const cdnFolder = `/${base}/${folder}`;
    setUploadTarget(files.length);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      try {
        await importFile(files[i], cdnFolder);
        setUploadProgress(i + 1);
      } catch (err) {
        console.error("Upload failed:", err);
        toast.error(`Failed to upload: ${files[i].name}`);
      }
    }

    setUploadProgress(0);
    setUploadTarget(0);

    if (imagesMode) {
      const images = await getGalleryImages(base, folder);
      setImages( images );
    }

    toast.success("Upload complete!");
  };

  const handleDeleteImages = async () => {
    if (selectedThumbnails.length === 0) return;
    const shouldDelete = await confirm({ title: "Delete Images", message: `Delete ${selectedThumbnails.length} image(s)?`, confirmLabel: "Delete", cancelLabel: "Cancel" });
    if (!shouldDelete) return;

    try {
      //const folder = selectedItems[0].folder;
      //const base = selectedItems[0].base;
      //console.log("Delete Images, base, folder");
      //console.log(base, folder);
      //console.log(selectedThumbnails);
      for (const image of selectedThumbnails) await deleteImageFromCDN(image);
      //setImages(prev => prev.filter(p => !selectedThumbnails.includes(p)));
      setImages(prev => {
        const updatedImages = prev.filter(
          p => !selectedThumbnails.some(sel => sel.url === p.url)
        );
        return updatedImages; // If empty, ThumbnailPanel will show "No images found"
      });
      setSelectedThumbnails([]);
      toast.success("Selected images deleted successfully");
    } catch (err) { console.error("Image delete error:", err); toast.error((err as Error).message || "Failed to delete images"); }
  };

  const handleSetCover = async () => {
    if (selectedThumbnails.length !== 1 || !selectedItems[0]) return;
    const image = selectedThumbnails[0];
    const galleryToUpdate = selectedItems[0];
    try {
      const savedGallery = await updateGallery({ ...galleryToUpdate, cover: image.url });
      setGallery(prev => prev.map(g => g._id === savedGallery._id ? savedGallery : g));
      toast.success("Cover image updated successfully!");
    } catch (error) { console.error("Set cover failed:", error); toast.error(`Failed to set cover: ${(error as Error).message}`); }
  };

  if (!isAuthenticated) return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
      <p>Please log in to access this page.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <SEO title="Maintain Gallery and Images" description="Admin interface for editing Galleries and uploading images" />
      {dialog}
      <MaintainPageLayout
        backgroundImage={backgroundImage as string}
        title="Maintain Gallery & Images"
        editMode={editMode || imagesMode}
        commands={
          <Commands
            editMode={editMode}
            imageMode={imagesMode}
            canEdit={selectedItems.length === 1 && isAuthenticated}
            canDelete={selectedItems.length === 1 && isAuthenticated}
            canSetCover={selectedThumbnails.length === 1}
            canDeleteImages={selectedThumbnails.length > 0}
            onCreate={handleCreate}
            onEdit={handleEditSelected}
            onDelete={selectedThumbnails.length > 0 ? handleDeleteImages : handleDeleteSelected}
            onSave={handleSave}
            onCancel={resetState}
            onSetCover={handleSetCover}
            onOpenImages={handleOpenImages}
            onUploadFile={handleUploadFiles} // multiple files handler
            uploadProgress={uploadProgress}
            uploadTarget={uploadTarget}
          />
        }
        listPanel={
          <MaintainEntityManager
            columns={getGalleryColumns()}
            entities={gallery}
            selectedItems={selectedItems}
            onSelectItem={onSelectItem}
            onSelectAll={(checked) => setSelectedItems(checked ? [...gallery] : [])}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isSelected={isSelected}
          />
        }
        editPanel={
          editMode && itemBeingEdited ? (
            <EditFormArea item={itemBeingEdited} setItem={setItemBeingEdited} isNew={isNewEdit} />
          ) : imagesMode ? (
            <ThumbnailPanel images={images} selected={selectedThumbnails} setSelected={setSelectedThumbnails} currentCoverUrl={itemBeingEdited?.cover} />
          ) : null
        }
      />
    </div>
  );
};

export default MaintainGalleryPage;
