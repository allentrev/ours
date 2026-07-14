// components/Family/PersonRelationshipsModal.tsx

import {
  useMemo,
  type MouseEvent,
} from "react";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import RelationshipEdge from "./RelationshipEdge";

import type {
  TreePerson,
} from "../../types/familyTypes";

import ActorNode from "./ActorNode";

import {
  buildRelationshipDiagram,
} from "./buildRelationshipsDiagram";

import type {
  PersonActorData,
  ActorEventType,
} from "../../types/familyTypes";

interface PersonRelationshipsModalProps {
  open: boolean;
  person: TreePerson | null;
  onClose: () => void;

  onOpenPersonDetails: (
    personHandle: string
  ) => void;

  onAddActor: (
    eventType: ActorEventType,
    personHandle: string
  ) => void;
}

const nodeTypes: NodeTypes = {
  actor: ActorNode,
};

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};

const PersonRelationshipsModalContent = ({
  person,
  onClose,
  onOpenPersonDetails,
  onAddActor,
}: Omit<PersonRelationshipsModalProps, "open">) => {

  /*
   * Temporary test data.
   *
   * Later replace this with data returned by:
   *
   * GET /family/person/:handle/relationships
   */
  const temporaryRelationshipData =
    useMemo<PersonActorData>(
      () => ({
        selectedPerson: {
          handle: person?.handle ?? "",
          displayName: person?.displayName ?? "",
        },

        families: [

        ],

        siblings: [
          {
            handle: "sibling-1",
            displayName: "Anne Allen",
          },
          {
            handle: "sibling-2",
            displayName: "Robert Allen",
          },
          {
            handle: "sibling-3",
            displayName: "Sarah Allen",
          },
          {
            handle: "sibling-4",
            displayName: "Michael Allen",
          },
        ],

        partners: [
          {
            handle: "partner-1",
            displayName: "Elizabeth Allen",
          },
          {
            handle: "partner-2",
            displayName: "Jane Green",
          },
        ],

        children: [

        ],
      }),
      [person?.handle, person?.displayName]
    );

  const { nodes, edges } = useMemo(
    () =>
      buildRelationshipDiagram({
        data: temporaryRelationshipData,
        onOpenPersonDetails,
        onAddActor,
      }),
    [
      temporaryRelationshipData,
      onOpenPersonDetails,
      onAddActor,
    ]
  );

  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!person) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={handleBackdropClick}
    >
      <div className="flex h-[90vh] w-[1200px] max-w-[98vw] flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Relationships
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {person.displayName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        {/* Diagram */}
        <div className="min-h-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{
              padding: 0.15,
              minZoom: 0.35,
              maxZoom: 1,
            }}
            minZoom={0.25}
            maxZoom={1.5}
            nodesDraggable={false}
            nodesConnectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            elementsSelectable={false}
            deleteKeyCode={null}
            panOnDrag
            zoomOnScroll
            zoomOnPinch
            zoomOnDoubleClick={false}
            preventScrolling
            proOptions={{
              hideAttribution: true,
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
            />

            <Controls
              showInteractive={false}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

const PersonRelationshipsModal = ({
  open,
  person,
  onClose,
  onOpenPersonDetails,
  onAddActor,
}: PersonRelationshipsModalProps) => {
  if (!open || !person) return null;

  return (
    <ReactFlowProvider>
      <PersonRelationshipsModalContent
        person={person}
        onClose={onClose}
        onOpenPersonDetails={
          onOpenPersonDetails
        }
        onAddActor={
          onAddActor
        }
      />
    </ReactFlowProvider>
  );
};

export default PersonRelationshipsModal;