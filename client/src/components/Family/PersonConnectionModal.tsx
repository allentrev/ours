import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Background,
  Controls,
  ReactFlow,
} from "@xyflow/react";

import type {
  Edge,
  Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import type {
  PersonConnectionResponse,
  PersonRecord,
  TreePerson,
} from "../../types/familyTypes";

import {
  readPersonConnection,
} from "../../utilities/Family/utils";

import {
  buildConnectionDiagram,
} from "./buildConnectionDiagram";

import PersonNode from "./PersonNode";
import PersonSelectorModal from "./PersonSelectorModal";
import MultiplePartnerNode from "./MultiplePartnerNode";

interface PersonConnectionModalProps {
  open: boolean;

  person:
    TreePerson | null;

  onClose: () => void;
}

const nodeTypes = {
  person: PersonNode,
  multiplePartner: MultiplePartnerNode,
};

const PersonConnectionModal = ({
  open,
  person,
  onClose,
}: PersonConnectionModalProps) => {
  const [
    selectorOpen,
    setSelectorOpen,
  ] =
    useState(false);

  const [
    targetPerson,
    setTargetPerson,
  ] =
    useState<PersonRecord | null>(
      null
    );

  const [
    connection,
    setConnection,
  ] =
    useState<PersonConnectionResponse | null>(
      null
    );

  const [
    nodes,
    setNodes,
  ] =
    useState<Node[]>([]);

  const [
    edges,
    setEdges,
  ] =
    useState<Edge[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  /*
   * Reset modal state whenever it opens
   * for a different selected person.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setTargetPerson(
      null
    );

    setConnection(
      null
    );

    setNodes(
      []
    );

    setEdges(
      []
    );

    setLoading(
      false
    );

    setError(
      null
    );

    setSelectorOpen(
      false
    );
  }, [
    open,
    person?.handle,
  ]);

  /*
   * Load the connection whenever a target
   * person is selected.
   */
  useEffect(() => {
    if (
      !open ||
      !person ||
      !targetPerson
    ) {
      return;
    }

    let cancelled =
      false;

    const loadConnection =
      async () => {
        try {
          setLoading(
            true
          );

          setError(
            null
          );

          const result =
            await readPersonConnection(
              person.handle,
              targetPerson.handle
            );

          if (cancelled) {
            return;
          }

          setConnection(
            result
          );

          if (
            !result.found
          ) {
            setNodes(
              []
            );

            setEdges(
              []
            );

            return;
          }

          const diagram =
            buildConnectionDiagram(
              result
            );

          setNodes(
            diagram.nodes
          );

          setEdges(
            diagram.edges
          );
        } catch (connectionError) {
          console.error(
            "Failed to find connection:",
            connectionError
          );

          if (
            !cancelled
          ) {
            setConnection(
              null
            );

            setNodes(
              []
            );

            setEdges(
              []
            );

            setError(
              "Failed to find connection."
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadConnection();

    return () => {
      cancelled =
        true;
    };
  }, [
    open,
    person,
    targetPerson,
  ]);

  const memoizedNodeTypes =
    useMemo(
      () =>
        nodeTypes,
      []
    );

  if (
    !open ||
    !person
  ) {
    return null;
  }

  return (
    <>
      <div
        className="
          fixed inset-0 z-[70]
          flex items-center justify-center
          bg-black/40 p-4
        "
      >
        <div
          className="
            flex
            h-[90vh]
            w-[1100px]
            max-w-[95vw]
            flex-col
            overflow-hidden
            rounded-xl
            bg-white
            shadow-xl
          "
        >
          {/* Header */}
          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              px-6 py-4
            "
          >
            <div>
              <h2
                className="
                  text-xl
                  font-semibold
                  text-gray-800
                "
              >
                Find Connection
              </h2>

              <div
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                From:{" "}
                {person.displayName}
              </div>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                rounded
                border
                border-gray-300
                px-4 py-2
                text-sm
                text-gray-700
                hover:bg-gray-100
              "
            >
              Close
            </button>
          </div>

          {/* Target selector */}
          <div
            className="
              flex
              shrink-0
              items-center
              gap-4
              border-b
              px-6 py-4
            "
          >
            <div
              className="
                flex-1
                text-sm
                text-gray-700
              "
            >
              {targetPerson
                ? (
                  <>
                    To:{" "}
                    <span
                      className="
                        font-medium
                      "
                    >
                      {
                        targetPerson.displayName
                      }
                    </span>
                  </>
                )
                : (
                  "Select the person to connect to."
                )}
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectorOpen(
                  true
                )
              }
              className="
                rounded
                bg-blue-600
                px-4 py-2
                text-sm
                text-white
                hover:bg-blue-700
              "
            >
              Select Person
            </button>
          </div>

          {/* Main content */}
          <div
            className="
              min-h-0
              flex-1
              bg-gray-50
            "
          >
            {!targetPerson && (
              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                  text-gray-500
                "
              >
                Select another person to find their connection.
              </div>
            )}

            {loading && (
              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                  text-gray-500
                "
              >
                Finding connection...
              </div>
            )}

            {error &&
              !loading && (
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center
                    text-red-600
                  "
                >
                  {error}
                </div>
              )}

            {connection &&
              !loading &&
              !error &&
              !connection.found && (
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center
                    text-gray-600
                  "
                >
                  No connection found.
                </div>
              )}

            {connection?.found &&
              !loading &&
              !error &&
              nodes.length >
                0 && (
                <ReactFlow
                  nodes={
                    nodes
                  }
                  edges={
                    edges
                  }
                  nodeTypes={
                    memoizedNodeTypes
                  }
                  fitView
                >
                  <Background />
                  <Controls />
                </ReactFlow>
              )}
          </div>
        </div>
      </div>

      <PersonSelectorModal
        open={
          selectorOpen
        }
        title="Select Connection Person"
        excludeHandles={[
          person.handle,
        ]}
        onClose={() =>
          setSelectorOpen(
            false
          )
        }
        onSelectPerson={
          setTargetPerson
        }
      />
    </>
  );
};

export default PersonConnectionModal;

