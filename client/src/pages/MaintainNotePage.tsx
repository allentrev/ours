import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import { toast } from 'react-toastify';

import MaintainPageLayout from "../layouts/MaintainPageLayout";
import { MaintainEntityManager } from "../components/MaintainEntityManager";
import { Commands } from "../components/Commands";
import backgroundImage from '../assets/green1.jpg';

import { getNoteColumns } from '../components/Family/NoteColumns';
import EditFormArea from "../components/Family/NoteEditFormArea";
import { createNote, updateNote, deleteNote, getAllNotes } from 'utilities'; // Adjust path as needed
import FilterBar from '../components/FilterBar';
import { useConfirmDialog } from "../hooks/useConfirmDialog";

import { useUser, useAuth } from "@clerk/clerk-react";
import { isAdminUser } from "../utilities/authRoles"; 

import type { NoteRecord } from "../types/familyTypes";

const MaintainNotePage: React.FC = () => {
  const { confirm, dialog } = useConfirmDialog();

  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const { getToken } = useAuth();

  const [notes, setNotes] = useState<NoteRecord[]>([]);
  
  const [selectedItems, setSelectedItems] = useState<NoteRecord[]>([]);
  const [isNewEdit, setIsNewEdit] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] = useState<NoteRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [filterKey, setFilterKey] = useState('');
  const [filterText, setFilterText] = useState('');

  // Load all Notes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllNotes();
        //console.log("getAllNotes", data);
        setNotes(data);

      } catch (error) {
        console.error("Failed to load notes:", error);
        toast.error("Failed to load notes");
      }
    };
    fetchData();
  }, []);
  
  const modName = "/pages/MaintainNotePage/";
  
  const filterOptions = [
    { key: '', label: 'All' },
    { key: "village", label: "Village" },
    { key: "town", label: "Town" },
    { key: "city", label: "City" },
    { key: "county", label: "County" },
    { key: "country", label: "Country" },
  ];

  const NoteFilterFunction = (e: NoteRecord, filterText?: string, filterKey?: string): boolean => {
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

  const isSelected = (item: NoteRecord) =>
    selectedItems.some(i => i.handle=== item.handle);

  const onSelectItem = (item: NoteRecord) => {
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

function validateNote(note: NoteRecord | null | undefined): ValidationResult {
    if (!note) {
      return { valid: false, error: "Note is missing." };
    }
    return { valid: true };
  }

  const newNoteData: NoteRecord = {
    handle: "",
    grampsId:  "",
    type:  "",
    text:  "",
  };

  const handleCreate = () => {
    if (!isAdmin) return;
    setItemBeingEdited(newNoteData);
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

    const wNoteId = selectedItems[0].handle;
    if (!wNoteId) return;

    try {
      const token = await getToken();
      await deleteNote(wNoteId, token);
      toast.success("Note deleted successfully");
      setNotes(prev => prev.filter(e => e.handle !== wNoteId));
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
      let savedItem: NoteRecord;
            const result = validateNote(itemBeingEdited);
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
        savedItem = await createNote(itemBeingEdited, token);
        toast.success("Note created successfully");
      } else {
        savedItem = await updateNote(itemBeingEdited, token);
        toast.success("Note updated successfully");
      }

      setNotes(prev => {
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
      toast.error((error as Error).message || "Failed to save Note");
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
        title="Maintain Note"
        description="Admin interface for editing Note data"
      />
      <div>{dialog}</div>
      <MaintainPageLayout
        backgroundImage={backgroundImage as string}
        title="Maintain Note"
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
            columns={getNoteColumns()}
            entities={notes}
            selectedItems={selectedItems}
            onSelectItem={onSelectItem}
            onSelectAll={(checked) => setSelectedItems(checked ? [...notes] : [])}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isSelected={isSelected}
            filterText={filterText}
            filterKey={filterKey}
            filterFunction={NoteFilterFunction}
          />
        }
      />
    </div>
  );
};

export default MaintainNotePage;
