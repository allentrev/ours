import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import MaintainPageLayout from "../layouts/MaintainPageLayout";
import { MaintainEntityManager } from "../components/MaintainEntityManager";
import { Commands } from "../components/Commands";
import backgroundImage from '../assets/green1.jpg';
import { useAuth } from '../auth/useAuth';
import { toast } from 'react-toastify';

import type { PlaceRecord } from "../types/familyTypes";
import { getPlaceColumns } from '../components/Family/PlaceColumns';
import EditFormArea from "../components/Family/PlaceEditFormArea";
import { createPlace, updatePlace, deletePlace, getAllPlaces,fetchFamilyPlaceOptions } from 'utilities'; // Adjust path as needed
import FilterBar from '../components/FilterBar';
import { useConfirmDialog } from "../hooks/useConfirmDialog";

const MaintainPlacePage: React.FC = () => {
  const { confirm, dialog } = useConfirmDialog();
  const { isAuthenticated } = useAuth();

  const [place, setPlace] = useState<PlaceRecord[]>([]);
  
  const [selectedItems, setSelectedItems] = useState<PlaceRecord[]>([]);
  const [isNewEdit, setIsNewEdit] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] = useState<PlaceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [filterKey, setFilterKey] = useState('');
  const [filterText, setFilterText] = useState('');

  // Load all Places
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPlaces();
        const familyPlaces = await fetchFamilyPlaceOptions();
        console.log(data);
        console.log(familyPlaces);
        setPlace(data);

      } catch (error) {
        console.error("Failed to load places:", error);
        toast.error("Failed to load places");
      }
    };
    fetchData();
  }, []);

  const filterOptions = [
    { key: '', label: 'All' },
    { key: "village", label: "Village" },
    { key: "town", label: "Town" },
    { key: "city", label: "City" },
    { key: "county", label: "County" },
    { key: "country", label: "Country" },
  ];

  const PlaceFilterFunction = (e: PlaceRecord, filterText?: string, filterKey?: string): boolean => {
    const trimmed = filterText?.trim().toLowerCase() || '';
    const key = filterKey?.trim().toLowerCase() || '';

    const matchesKey = key === '' || e.type?.trim().toLowerCase() === key;

    if (trimmed === '' && key === '') {
      return true;
    }

    if (trimmed === '') {
      return matchesKey;
    }

    const matchesText = Object.values(e).some(
      (val) => typeof val === 'string' && val.toLowerCase().includes(trimmed)
    );

    return matchesKey && matchesText;
  };

  const isSelected = (item: PlaceRecord) =>
    selectedItems.some(i => i.grampsId === item.grampsId);

  const onSelectItem = (item: PlaceRecord) => {
    setSelectedItems(prev =>
      prev.some(i => i.grampsId === item.grampsId)
        ? prev.filter(i => i.grampsId !== item.grampsId)
        : [...prev, item]
    );
  };

  interface ValidationResult {
    valid: boolean;
    error?: string;
  }

function validatePlace(place: PlaceRecord | null | undefined): ValidationResult {
    if (!place) {
      return { valid: false, error: "Place is missing." };
    }
    //if (!refData.webPage || refData.webPage.trim() === "") {
    //  return { valid: false, error: "RefData webPage is required." };
    //}
    return { valid: true };
  }

  const newRefData: PlaceRecord = {
    handle: "",
    grampsId:  "",
    type:  "",
    line1:  "",
    line2:  "",
    urbanArea:  "",
    county:  "",
    country:  [],
    code:  "",
    displayPlace:  "",
    latitude:  0,
    longitude: 0,
    noteHandles: [],
  };

  const handleCreate = () => {
    if (!isAuthenticated) return;
    setItemBeingEdited(newRefData);
    setIsNewEdit(true);
    setSelectedItems([]);
    setEditMode(true);
  };

  const handleEditSelected = () => {
    if (!isAuthenticated || selectedItems.length !== 1) return;
    setItemBeingEdited(selectedItems[0]);
    setIsNewEdit(false);
    setEditMode(true);
  };

  const handleDeleteSelected = async (): Promise<void> => {
    if (!isAuthenticated || selectedItems.length === 0) return;

    const shouldDelete = await confirm({
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });

    if (!shouldDelete) return;

    const wGrampsId = selectedItems[0].grampsId;
    if (!wGrampsId) return;

    try {
      await deletePlace(wGrampsId);
      toast.success("Place deleted successfully");
      setPlace(prev => prev.filter(e => e.grampsId !== wGrampsId));
    } catch (error) {
      console.log(`Delete failed: ${(error as Error).message}`);
      toast.error(`Delete failed: ${(error as Error).message}`);
    }
    setEditMode(false);
    setItemBeingEdited(null);
    setSelectedItems([]);
  };

  const handleCancel = () => {
    setEditMode(false);
    setItemBeingEdited(null);
    setSelectedItems([]);
  };

  const handleSave = async () => {
    if (!itemBeingEdited) return;
    try {
      let savedItem: PlaceRecord;
            const result = validatePlace(itemBeingEdited);
      if (!result.valid) {
        toast.error(result.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return; // Prevent update
      }

      if (isNewEdit) {
        savedItem = await createPlace(itemBeingEdited);
        toast.success("Place created successfully");
      } else {
        savedItem = await updatePlace(itemBeingEdited);
        toast.success("Place updated successfully");
      }

      setPlace(prev => {
        const updated = prev.some(e => e.grampsId === savedItem.grampsId)
          ? prev.map(e => (e.grampsId === savedItem.grampsId ? savedItem : e))
          : [...prev, savedItem];

        return [...updated].sort((a, b) => a.grampsId.localeCompare(b.grampsId));
      });

      setEditMode(false);
      setItemBeingEdited(null);
      setSelectedItems([]);
    } catch (error) {
      console.error("Save error:", error);
      toast.error((error as Error).message || "Failed to save Place");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <SEO
        title="Maintain Place"
        description="Admin interface for editing place data"
      />
      <div>{dialog}</div>
      <MaintainPageLayout
        backgroundImage={backgroundImage as string}
        title="Maintain Place"
        editMode={editMode}
        filter={
          <FilterBar
            filterText={filterText}
            setFilterText={setFilterText}
            filterKey={filterKey}
            setFilterKey={setFilterKey}
            filterOptions={filterOptions}
          />
        }
        commands={
          <Commands
            editMode={editMode}
            imageMode={false}
            canEdit={selectedItems.length === 1 && isAuthenticated}
            canDelete={selectedItems.length > 0 && isAuthenticated}
            onCreate={handleCreate}
            onEdit={handleEditSelected}
            onDelete={handleDeleteSelected}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        }
        editPanel={
          editMode && itemBeingEdited  ? (
            <EditFormArea
              item={itemBeingEdited}
              setItem={setItemBeingEdited}
              isNew={isNewEdit}
            />
          ) : null
        }
        listPanel={
          <MaintainEntityManager
            columns={getPlaceColumns()}
            entities={place}
            selectedItems={selectedItems}
            onSelectItem={onSelectItem}
            onSelectAll={(checked) => setSelectedItems(checked ? [...place] : [])}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isSelected={isSelected}
            filterText={filterText}
            filterKey={filterKey}
            filterFunction={PlaceFilterFunction}
          />
        }
      />
    </div>
  );
};

export default MaintainPlacePage;
