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
import FamilyChildEdge from "./FamilyChildEdge";

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

const edgeTypes = {
  familyChild: FamilyChildEdge,
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
  const [highlightedEdges, setHighlightedEdges] = useState(new Set<string>());
  
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
        const data: TreeResponse =
          await fetchTree(
            selectedPersonHandle,
            mode
          );
        console.log("Fetched Data",data);
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

  const memoizedNodeTypes = useMemo(
      () => nodeTypes,
      []
    );

  const memoizedEdgeTypes = useMemo(
    () => edgeTypes,
    []
  );

  const displayedEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          stroke: highlightedEdges.has(edge.id)
            ? "red"
            : edge.style?.stroke,
          strokeWidth: highlightedEdges.has(edge.id)
            ? 4
            : edge.style?.strokeWidth,
        },
      })),
    [edges, highlightedEdges]
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
  
  const handleEdgeClick = (
    _event: React.MouseEvent,
    edge: Edge
  ) => {
    const relationshipNodeId = edge.source.startsWith("relationship-")
      ? edge.source
      : edge.target.startsWith("relationship-")
        ? edge.target
        : null;

    if (!relationshipNodeId) {
      return;
    }

    const branchEdgeIds = edges
      .filter(
        (item) =>
          item.source === relationshipNodeId ||
          item.target === relationshipNodeId
      )
      .map((item) => item.id);

        setHighlightedEdges((current) => {
          const isSameBranch =
            current.size === branchEdgeIds.length &&
            branchEdgeIds.every((id) => current.has(id));

          if (isSameBranch) {
            return new Set();
          }

          return new Set(branchEdgeIds);
        });
  };
  
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={displayedEdges}
        nodeTypes={
          memoizedNodeTypes
        }
        edgeTypes={memoizedEdgeTypes}
        fitView
        onInit={
          setReactFlowInstance
        }
        connectionLineStyle={{
          strokeWidth: 2,
        }}
        onEdgeClick={handleEdgeClick}
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