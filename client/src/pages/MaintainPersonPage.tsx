import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import { toast } from 'react-toastify';

import MaintainPageLayout from "../layouts/MaintainPageLayout";
import { MaintainEntityManager } from "../components/MaintainEntityManager";
import { Commands } from "../components/Commands";
import backgroundImage from '../assets/green1.jpg';

import { useAuth, useUser } from "@clerk/clerk-react";
import { isAdminUser } from "../utilities/authRoles";

import { getFamilyPersonColumns } from '../components/Family/PersonColumns';
import EditFormArea from "../components/Family/PersonEditFormArea";
import { createPerson, updatePerson, deletePerson, getAllPersons } from 'utilities'; // Adjust path as needed
import FilterBar from '../components/FilterBar';
import { useConfirmDialog } from "../hooks/useConfirmDialog";

import type { PersonRecord,  NewNoteInput, } from "../types/familyTypes";

const MaintainPersonPage: React.FC = () => {
  const { confirm, dialog } = useConfirmDialog();

  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const { getToken } = useAuth();
  
  const [draftNotes, setDraftNotes] = useState<NewNoteInput[]>([]);

  const [person, setPerson] = useState<PersonRecord[]>([]);
  
  const [selectedItems, setSelectedItems] = useState<PersonRecord[]>([]);
  const [isNewEdit, setIsNewEdit] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] = useState<PersonRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [filterKey, setFilterKey] = useState('');
  const [filterText, setFilterText] = useState('');

  // Load all person data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPersons();
        //console.log("Result of getAllPersons", data);
        setPerson(data);

      } catch (error) {
        console.error("Failed to load family person data:", error);
        toast.error("Failed to load family person data");
      }
    };
    fetchData();
  }, []);

    useEffect(() => {
    if (person) {
      setDraftNotes([]);
    }
  }, [ person]);

  const modName = "/pages/MaintainPersonPage/";
  const filterOptions = [{ key: '', label: "All fields"}];

  const PersonFilterFunction = (e: PersonRecord, filterText?: string, filterKey?: string): boolean => {
    const trimmed = filterText?.trim().toLowerCase() || '';
    const key = filterKey?.trim().toLowerCase() || '';

    const matchesDisplayName = key === '' || e.displayName?.trim().toLowerCase() === key;

    if (trimmed === '' && key === '') {
      return true;
    }

    if (trimmed === '') {
      return matchesDisplayName;
    }

    const matchesText = Object.values(e).some(
      (val) => typeof val === 'string' && val.toLowerCase().includes(trimmed)
    );

    return matchesDisplayName && matchesText;
  };

  const isSelected = (item: PersonRecord) =>
    selectedItems.some(i => i.handle === item.handle);

  const onSelectItem = (item: PersonRecord) => {
    setSelectedItems(prev =>
      prev.some(i => i.handle === item.handle)
        ? prev.filter(i => i.handle !== item.handle)
        : [...prev, item]
    );
  };

  const newPerson: PersonRecord = {

    handle: "",
    grampsId: "",
    gender: "M",
    firstName: "",
    surname: "",
    displayName: "",
    birthDate: "",
    deathDate: "",
    birthPlaceHandle: "",
    deathPlaceHandle: "",
    primaryPhotoUrl: "",
    noteHandles: [],
  };

  const handleCreate = () => {
    if (!isAdmin) return;
    setItemBeingEdited(newPerson);
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

    const wPersonId = selectedItems[0].handle;
    if (!wPersonId) return;

    try {

      const token = await getToken();
      await deletePerson(wPersonId, token);
      toast.success("Family Person deleted successfully");
      setPerson(prev => prev.filter(e => e.handle !== wPersonId));
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
      let savedItem: PersonRecord;
      const result = itemBeingEdited;
      if (!result) {
        toast.error("Person Not found", {
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
      if (isNewEdit) {
        savedItem = await createPerson(itemBeingEdited, draftNotes, token);
        toast.success("Person created successfully");
      } else {
        savedItem = await updatePerson(itemBeingEdited, draftNotes, token);
        toast.success("Person updated successfully");
      }

      setPerson(prev => {
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
      toast.error((error as Error).message || "Failed to save data item");
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
        title="Maintain Family Person"
        description="Admin interface for maintaining Family Persons"
      />
      <div>{dialog}</div>
      <MaintainPageLayout
        backgroundImage={backgroundImage as string}
        title="Maintain Family Person"
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
              person={itemBeingEdited}
              onChange={(updatedPerson) =>
                setItemBeingEdited(updatedPerson as PersonRecord)
              }
              isNew={isNewEdit}
              draftNotes={draftNotes}
              onDraftNotesChange={setDraftNotes}
            />
          ) : null
        }
        listPanel={
          <MaintainEntityManager
            columns={getFamilyPersonColumns()}
            entities={person}
            selectedItems={selectedItems}
            onSelectItem={onSelectItem}
            onSelectAll={(checked) => setSelectedItems(checked ? [...person] : [])}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isSelected={isSelected}
            filterText={filterText}
            filterKey={filterKey}
            filterFunction={ PersonFilterFunction }
          />
        }
      />
    </div>
  );
};

export default MaintainPersonPage;
