import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import MaintainPageLayout from "../layouts/MaintainPageLayout";
import { MaintainEntityManager } from "../components/MaintainEntityManager";
import { Commands } from "../components/Commands";
import backgroundImage from '../assets/green1.jpg';
import { useAuth } from '../auth/useAuth';
import { toast } from 'react-toastify';

import type { RefDataRecord } from "../types/refDataTypes";
import { getRefDataColumns } from '../components/RefData/RefDataColumns';
import EditFormArea from "../components/RefData/RefDataEditFormArea";
import { createRefData, updateRefData, deleteRefData, getAllRefData } from 'utilities'; // Adjust path as needed
import FilterBar from '../components/FilterBar';
import { useConfirmDialog } from "../hooks/useConfirmDialog";

const MaintainRefDataPage: React.FC = () => {
  const { confirm, dialog } = useConfirmDialog();
  const { isAuthenticated } = useAuth();

  const [refData, setRefData] = useState<RefDataRecord[]>([]);
  const [websiteOptions, setWebsiteOptions] = useState<string[]>([]);
  
  const [selectedItems, setSelectedItems] = useState<RefDataRecord[]>([]);
  const [isNewEdit, setIsNewEdit] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] = useState<RefDataRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [filterKey, setFilterKey] = useState('');
  const [filterText, setFilterText] = useState('');

  // Load all reference data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllRefData();
        setRefData(data);

        // Extract unique webPage values for websiteOptions
        const uniquePages = Array.from(new Set(data.map(d => d.webPage?.trim() || "")))
          .filter(x => x !== "")
          .sort((a, b) => a.localeCompare(b));
        
        setWebsiteOptions(uniquePages);
      } catch (error) {
        console.error("Failed to load reference data:", error);
        toast.error("Failed to load reference data");
      }
    };
    fetchData();
  }, []);

  const pageOptions = websiteOptions.map(item => ({
    key: item,
    label: item,
  }));

  const allOption = { key: '', label: 'All fields' };
  const filterOptions = [allOption, ...pageOptions];

  const RefDataFilterFunction = (e: RefDataRecord, filterText?: string, filterKey?: string): boolean => {
    const trimmed = filterText?.trim().toLowerCase() || '';
    const key = filterKey?.trim().toLowerCase() || '';

    const matchesCalKey = key === '' || e.webPage?.trim().toLowerCase() === key;

    if (trimmed === '' && key === '') {
      return true;
    }

    if (trimmed === '') {
      return matchesCalKey;
    }

    const matchesText = Object.values(e).some(
      (val) => typeof val === 'string' && val.toLowerCase().includes(trimmed)
    );

    return matchesCalKey && matchesText;
  };

  const isSelected = (item: RefDataRecord) =>
    selectedItems.some(i => i.refKey === item.refKey);

  const onSelectItem = (item: RefDataRecord) => {
    setSelectedItems(prev =>
      prev.some(i => i.refKey === item.refKey)
        ? prev.filter(i => i.refKey !== item.refKey)
        : [...prev, item]
    );
  };

  interface ValidationResult {
    valid: boolean;
    error?: string;
  }

function validateRefData(refData: RefDataRecord | null | undefined): ValidationResult {
    if (!refData) {
      return { valid: false, error: "RefData is missing." };
    }
    if (!refData.webPage || refData.webPage.trim() === "") {
      return { valid: false, error: "RefData webPage is required." };
    }
    if (!refData.refKey || refData.refKey.trim() === "") {
      return { valid: false, error: "RefData refData is required." };
    }
    if (!refData.name || refData.name.trim() === "") {
      return { valid: false, error: "RefData name is required." };
    }
    if (!refData.value || refData.value.trim() === "") {
      return { valid: false, error: "RefData value is required." };
    }
    return { valid: true };
  }

  const newRefData: RefDataRecord = {
    refKey: '',
    webPage: 'Home',
    name: 'a new name',
    value: 'a new string',
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

    const refKey = selectedItems[0].refKey;
    if (!refKey) return;

    try {
      await deleteRefData(refKey);
      toast.success("Reference data deleted successfully");
      setRefData(prev => prev.filter(e => e.refKey !== refKey));
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
      let savedItem: RefDataRecord;
            const result = validateRefData(itemBeingEdited);
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
        savedItem = await createRefData(itemBeingEdited);
        toast.success("Data Item created successfully");
      } else {
        savedItem = await updateRefData(itemBeingEdited);
        toast.success("Data Item updated successfully");
      }

      setRefData(prev => {
        const updated = prev.some(e => e.refKey === savedItem.refKey)
          ? prev.map(e => (e.refKey === savedItem.refKey ? savedItem : e))
          : [...prev, savedItem];

        return [...updated].sort((a, b) => a.refKey.localeCompare(b.refKey));
      });

      setEditMode(false);
      setItemBeingEdited(null);
      setSelectedItems([]);
    } catch (error) {
      console.error("Save error:", error);
      toast.error((error as Error).message || "Failed to save data item");
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
        title="Maintain Reference Data – Maidenhead Town Bowls Club"
        description="Admin interface for editing reference data"
      />
      <div>{dialog}</div>
      <MaintainPageLayout
        backgroundImage={backgroundImage as string}
        title="Maintain Reference Data"
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
          editMode && itemBeingEdited && websiteOptions.length > 0 ? (
            <EditFormArea
              item={itemBeingEdited}
              setItem={setItemBeingEdited}
              webPageOptions={pageOptions}
              isNew={isNewEdit}
            />
          ) : null
        }
        listPanel={
          <MaintainEntityManager
            columns={getRefDataColumns()}
            entities={refData}
            selectedItems={selectedItems}
            onSelectItem={onSelectItem}
            onSelectAll={(checked) => setSelectedItems(checked ? [...refData] : [])}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isSelected={isSelected}
            filterText={filterText}
            filterKey={filterKey}
            filterFunction={RefDataFilterFunction}
          />
        }
      />
    </div>
  );
};

export default MaintainRefDataPage;
