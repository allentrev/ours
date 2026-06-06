import { useEffect, useMemo, useState } from "react";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";

import type {
  Edge,
  Node,
  ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import FamilyPersonNode from "./FamilyPersonNode";
import RelationshipNode from "./RelationshipNode";
import MultiplePartnerNode from "./MultiplePartnerNode";

import FamilyLoadingState from "./FamilyLoadingState";
import FamilyErrorState from "./FamilyErrorState";
import FamilyEmptyState from "./FamilyEmptyState";

import { fetchFamilyTree } from "../../utilities/familyUtils";

import {
  buildFamilyTree,
} from "../../utilities/familyTreeLayout";

import type {
  FamilyPerson,
  FamilyTreeMode,
  FamilyTreeResponse,
} from "../../types/familyTypes";

const nodeTypes = {
  person: FamilyPersonNode,
  relationship: RelationshipNode,
  multiplePartner: MultiplePartnerNode,
};

interface Props {
  selectedPersonHandle: string;
  mode: FamilyTreeMode;

  onSelectedPersonChange: (
    person: FamilyPerson | null
  ) => void;

  onPersonSelect: (
    personHandle: string
  ) => void;
}

const FamilyTreeViewer = ({
  selectedPersonHandle,
  mode,
  onSelectedPersonChange,
  onPersonSelect,
}: Props) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    reactFlowInstance,
    setReactFlowInstance,
  ] =
    useState<ReactFlowInstance | null>(
      null
    );

  useEffect(() => {
    const loadTree = async () => {
      try {
        setLoading(true);
        setError(null);

        const data: FamilyTreeResponse =
          await fetchFamilyTree(
            selectedPersonHandle,
            mode
          );

        onSelectedPersonChange(
          data.selectedPerson
        );

        const graph = buildFamilyTree(data, mode)

        setNodes(graph.nodes);
        setEdges(graph.edges);

      } catch (error) {
          console.error("Failed to load family tree", error);
          console.error("Error stack", error instanceof Error ? error.stack : error);
          setError("Failed to load family tree.");

      } finally {
        setLoading(false);
      }
    };

    loadTree();

  }, [
    selectedPersonHandle,
    mode,
    onSelectedPersonChange,
  ]);

  useEffect(() => {
    if (
      !reactFlowInstance ||
      nodes.length === 0
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      reactFlowInstance.fitView({
        duration: 500,
        padding: 0.2,
      });
    }, 100);

    return () =>
      clearTimeout(timeout);

  }, [
    reactFlowInstance,
    nodes,
  ]);

  const memoizedNodeTypes =
    useMemo(
      () => nodeTypes,
      []
    );

  if (loading) {
    return <FamilyLoadingState />;
  }

  if (error) {
    return (
      <FamilyErrorState
        message={error}
      />
    );
  }

  if (nodes.length === 0) {
    return <FamilyEmptyState />;
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={
          memoizedNodeTypes
        }
        fitView
        onInit={
          setReactFlowInstance
        }
        connectionLineStyle={{
          strokeWidth: 2,
        }}
        onNodeClick={(
          _event,
          node
        ) => {
          if (node.type === "relationship") return;

          if (node.type === "multiplePartner") {
            const personHandle = node.data?.personHandle as string | undefined;

            if (personHandle) {
              onPersonSelect(personHandle);
            }

            return;
          }
          const personHandle =
            (node.data.personHandle as string | undefined) ?? node.id;

          onPersonSelect(personHandle);
        }}
      >
        <Background />
        <Controls />
        {/* <MiniMap /> */}
      </ReactFlow>
    </div>
  );
};

export default FamilyTreeViewer;