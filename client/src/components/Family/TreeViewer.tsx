import { useEffect, useMemo, useState } from "react";

import {
  Background,
  Controls,
  ReactFlow,
} from "@xyflow/react";

import type {
  Edge,
  Node,
  ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import PersonNode from "./PersonNode";
import RelationshipNode from "./RelationshipNode";
import MultiplePartnerNode from "./MultiplePartnerNode";

import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

import { fetchTree } from "../../utilities/Family/utils";

import {
  buildTree,
} from "../../utilities/Family/treeEngine";

import type {
  TreePerson,
  TreeMode,
  TreeResponse,
} from "../../types/familyTypes";

const nodeTypes = {
  person: PersonNode,
  relationship: RelationshipNode,
  multiplePartner: MultiplePartnerNode,
};

interface Props {
  selectedPersonHandle: string;
  mode: TreeMode;

  onSelectedPersonChange: (
    person: TreePerson | null
  ) => void;

  onPersonSelect: (
    personHandle: string
  ) => void;
}

const TreeViewer = ({
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
        console.log(`Fetching family tree for [${selectedPersonHandle}]`)
        const data: TreeResponse =
          await fetchTree(
            selectedPersonHandle,
            mode
          );
        console.log("Data",data);
        onSelectedPersonChange(
          data.selectedPerson
        );

        const graph = buildTree(data, mode)

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
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
      />
    );
  }

  if (nodes.length === 0) {
    return <EmptyState />;
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

export default TreeViewer;