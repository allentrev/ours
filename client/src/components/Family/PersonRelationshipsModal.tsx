// components/Family/PersonRelationshipsModal.tsx

import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import ActorNode from "./ActorNode";
import RelationshipEdge from "./RelationshipEdge";

import {
  buildRelationshipDiagram,
} from "./buildRelationshipDiagram";

import {
  readPersonRelationships,
} from "../../utilities/Family/utils";

import type {
  ActorEventType,
  PersonActorData,
  TreePerson,
} from "../../types/familyTypes";

interface PersonRelationshipsModalProps {
  open: boolean;
  person: TreePerson | null;
  refreshKey: number;
  onClose: () => void;

  onOpenPersonDetails: (
    personHandle: string
  ) => void;

  onSelectPerson: (
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
  refreshKey,
  onClose,
  onOpenPersonDetails,
  onSelectPerson,
  onAddActor,
}: Omit<
  PersonRelationshipsModalProps,
  "open"
>) => {
  const [
    relationshipData,
    setRelationshipData,
  ] = useState<PersonActorData | null>(
    null
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!person?.handle) {
      setRelationshipData(null);
      setLoading(false);
      setError(null);

      return;
    }

    let cancelled = false;

    const loadRelationships =
      async () => {
        try {
          setLoading(true);
          setError(null);
          setRelationshipData(null);

          const result =
            await readPersonRelationships(
              person.handle
            );

          if (!cancelled) {
            setRelationshipData(result);
          }
        } catch (loadError) {
          console.error(
            "Failed to load relationships:",
            loadError
          );

          if (!cancelled) {
            setError(
              "Failed to load relationships."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void loadRelationships();

    return () => {
      cancelled = true;
    };
  }, [
    person?.handle,
    refreshKey,
  ]);

  const { nodes, edges } =
    useMemo(() => {
      if (!relationshipData) {
        return {
          nodes: [],
          edges: [],
        };
      }

      return buildRelationshipDiagram({
        data: relationshipData,
        onOpenPersonDetails,
        onSelectPerson,
        onAddActor,
      });
    }, [
      relationshipData,
      onOpenPersonDetails,
      onSelectPerson,
      onAddActor,
    ]);

  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose();
    }
  };

  if (!person) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40 p-4
      "
      onMouseDown={
        handleBackdropClick
      }
    >
      <div
        className="
          flex h-[90vh] w-300
          max-w-[98vw] flex-col
          overflow-hidden rounded-lg
          bg-white shadow-xl
        "
      >
        {/* Header */}
        <div
          className="
            flex shrink-0
            items-center justify-between
            border-b px-6 py-4
          "
        >
          <div>
            <h2
              className="
                text-xl font-semibold
                text-gray-800
              "
            >
              Relationships
            </h2>

            <p
              className="
                mt-1 text-sm
                text-gray-500
              "
            >
              {person.displayName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded border
              border-gray-300
              px-4 py-2
              text-sm text-gray-700
              hover:bg-gray-100
            "
          >
            Close
          </button>
        </div>

        {/* Diagram */}
        <div
          className="
            relative min-h-0
            flex-1
          "
        >
          {loading && (
            <div
              className="
                absolute inset-0 z-10
                flex items-center
                justify-center
                bg-white text-sm
                text-gray-500
              "
            >
              Loading relationships...
            </div>
          )}

          {error && !loading && (
            <div
              className="
                absolute inset-0 z-10
                flex items-center
                justify-center
                bg-white text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            relationshipData && (
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
                zoomOnDoubleClick={
                  false
                }
                preventScrolling
                proOptions={{
                  hideAttribution: true,
                }}
              >
                <Background
                  variant={
                    BackgroundVariant.Dots
                  }
                  gap={20}
                  size={1}
                />

                <Controls
                  showInteractive={
                    false
                  }
                />
              </ReactFlow>
            )}
        </div>
      </div>
    </div>
  );
};

const PersonRelationshipsModal = ({
  open,
  person,
  refreshKey,
  onClose,
  onOpenPersonDetails,
  onSelectPerson,
  onAddActor,
}: PersonRelationshipsModalProps) => {
  if (!open || !person) {
    return null;
  }

  return (
    <ReactFlowProvider>
      <PersonRelationshipsModalContent
        person={person}
        refreshKey={refreshKey}
        onClose={onClose}
        onOpenPersonDetails={
          onOpenPersonDetails
        }
        onSelectPerson={
          onSelectPerson
        }
        onAddActor={onAddActor}
      />
    </ReactFlowProvider>
  );
};

export default PersonRelationshipsModal;