import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import { toast } from 'react-toastify';

import MaintainPageLayout from "../layouts/MaintainPageLayout";
import { MaintainEntityManager } from "../components/MaintainEntityManager";
import { Commands } from "../components/Commands";
import backgroundImage from '../assets/green1.jpg';

import { getFamilyColumns } from '../components/Family/FamilyColumns';
import EditFormArea from "../components/Family/FamilyEditFormArea";
import { createFamily, updateFamily, deleteFamily, getAllFamilies } from 'utilities'; // Adjust path as needed
import FilterBar from '../components/FilterBar';
import { useConfirmDialog } from "../hooks/useConfirmDialog";

import { useUser, useAuth } from "@clerk/clerk-react";
import { isAdminUser } from "../utilities/authRoles"; 

import type { FamilyRecord } from "../types/familyTypes";

const MaintainFamilyPage: React.FC = () => {
  const { confirm, dialog } = useConfirmDialog();

  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const { getToken } = useAuth();

  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  
  const [selectedItems, setSelectedItems] = useState<FamilyRecord[]>([]);
  const [isNewEdit, setIsNewEdit] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] = useState<FamilyRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [filterKey, setFilterKey] = useState('');
  const [filterText, setFilterText] = useState('');

  // Load all Places
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllFamilies();
        //console.log("getAllFamilies", data);
        setFamilies(data);

      } catch (error) {
        console.error("Failed to load families:", error);
        toast.error("Failed to load families");
      }
    };
    fetchData();
  }, []);
  
  const modName = "/pages/MaintainFamilyPage/";
  
  const filterOptions = [
    { key: '', label: 'All' },
    { key: "married", label: "married" },
    { key: "unknown", label: "unknown" },
  ];

  const FamilyFilterFunction = (e: FamilyRecord, filterText?: string, filterKey?: string): boolean => {
    const trimmed = filterText?.trim().toLowerCase() || '';
    const key = filterKey?.trim().toLowerCase() || '';

    const matchesKey = key === '' || e.relationshipType?.trim().toLowerCase() === key;

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

  const isSelected = (item: FamilyRecord) =>
    selectedItems.some(i => i.handle=== item.handle);

  const onSelectItem = (item: FamilyRecord) => {
    setSelectedItems(prev =>
      prev.some(i => i.handle === item.handle)
        ? prev.filter(i => i.handle !== item.handle)
        : [...prev, item]
    );
  };

  interface ValidationResult {
    valid: boolean;
    error?: string;
  }

function validateFamily(family: FamilyRecord | null | undefined): ValidationResult {
    if (!family) {
      return { valid: false, error: "Family is missing." };
    }
    //if (!refData.webPage || refData.webPage.trim() === "") {
    //  return { valid: false, error: "RefData webPage is required." };
    //}
    return { valid: true };
  }

  const newFamily: FamilyRecord = {
    handle: "",
    grampsId:  "",
    fatherHandle:  "",
    motherHandle:  "",
    childHandles:  [],
    relationshipType:  "",
    relationshipDate:  undefined,
    relationshipPlaceHandle: "",
    noteHandles: [],
  };

  const handleCreate = () => {
    if (!isAdmin) return;
    setItemBeingEdited(newFamily);
    setIsNewEdit(true);
    setSelectedItems([]);
    setEditMode(true);
  };

  const handleEditSelected = () => {
    if (!isAdmin || selectedItems.length !== 1) return;
    setItemBeingEdited(selectedItems[0]);
    setIsNewEdit(false);
    setEditMode(true);
  };

  const handleDeleteSelected = async (): Promise<void> => {
    const funcName = "handleDeleteSelected";
    
    if (!isAdmin || selectedItems.length === 0) return;

    const shouldDelete = await confirm({
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });

    if (!shouldDelete) return;

    const wFamilyId = selectedItems[0].handle;
    if (!wFamilyId) return;

    try {
      const token = await getToken();
      await deleteFamily(wFamilyId, token);
      toast.success("Family deleted successfully");
      setFamilies(prev => prev.filter(e => e.handle !== wFamilyId));
    } catch (error) {
      console.log(`${modName}${funcName} Delete failed: ${(error as Error).message}`);
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
      let savedItem: FamilyRecord;
            const result = validateFamily(itemBeingEdited);
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

      const token = await getToken();
      //console.log(`${modName}handleSave token:`, token);
      if (isNewEdit) {
        savedItem = await createFamily(itemBeingEdited, [], token);
        toast.success("Place created successfully");
      } else {
        savedItem = await updateFamily(itemBeingEdited, [], token);
        toast.success("Place updated successfully");
      }

      setFamilies(prev => {
        const updated = prev.some(e => e.handle === savedItem.handle)
          ? prev.map(e => (e.handle === savedItem.handle ? savedItem : e))
          : [...prev, savedItem];

        return [...updated].sort((a, b) => a.handle.localeCompare(b.handle));
      });

      setEditMode(false);
      setItemBeingEdited(null);
      setSelectedItems([]);
    } catch (error) {
      console.error("Save error:", error);
      toast.error((error as Error).message || "Failed to save Place");
    }
  };

  if (!isAdmin) {
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
        title="Maintain Family"
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
            canEdit={selectedItems.length === 1 && isAdmin}
            canDelete={selectedItems.length > 0 && isAdmin}
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
            columns={getFamilyColumns()}
            entities={families}
            selectedItems={selectedItems}
            onSelectItem={onSelectItem}
            onSelectAll={(checked) => setSelectedItems(checked ? [...families] : [])}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isSelected={isSelected}
            filterText={filterText}
            filterKey={filterKey}
            filterFunction={FamilyFilterFunction}
          />
        }
      />
    </div>
  );
};

export default MaintainFamilyPage;
