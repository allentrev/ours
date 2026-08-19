import { useEffect, useMemo, useState } from "react";

import {
  Background,
  Controls,
  ReactFlow,
} from "@xyflow/react";

import type {
  Node,
  ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import PersonNode from "./PersonNode";
import RelationshipNode from "./RelationshipNode";
import RelationshipEdge from "./RelationshipEdge";
import MultiplePartnerNode from "./MultiplePartnerNode";
import FamilyChildEdge from "./FamilyChildEdge";

import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

import { fetchTree } from "../../utilities/Family/utils";

import {
  buildGenerationDisplayModel,
  renderGenerationEdges,
  renderGenerationNodes,
} from "../../utilities/Family/generation";

import type {
  TreePerson,
  TreeMode,
  TreeResponse,
  FamilyTreeEdge,
} from "../../types/familyTypes";

const nodeTypes = {
  person: PersonNode,
  relationship: RelationshipNode,
  multiplePartner: MultiplePartnerNode,
};

const edgeTypes = {
  familyChild: FamilyChildEdge,
  relationship: RelationshipEdge,
};

interface Props {
  refreshKey: number;
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
  refreshKey,
  selectedPersonHandle,
  mode,
  onSelectedPersonChange,
  onPersonSelect,
}: Props) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<FamilyTreeEdge[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState(new Set<string>());
  
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    reactFlowInstance,
    setReactFlowInstance,
  ] = useState<
    ReactFlowInstance<
      Node,
      FamilyTreeEdge
    > | null
  >(null);

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
        // console.log("components/TreeViewer/ useEffect Fetched Data",data);
        onSelectedPersonChange(
          data.selectedPerson
        );

        const generationDisplayModel =
          buildGenerationDisplayModel(
            data,
            mode
          );

        const generationNodes =
          renderGenerationNodes(
            generationDisplayModel,
            data.selectedPerson.handle
          );

        const generationEdges =
          renderGenerationEdges(
            generationDisplayModel,
            {
              dataNodes:
                data.nodes,

              dataFamilies:
                data.families ?? [],

              mode,

              selectedPersonHandle:
                data.selectedPerson.handle,

              useExpandedLayout:
                generationDisplayModel.generations.some(
                  (generation) =>
                    generation.layoutType ===
                    "expanded-root"
                ),
            }
          );

        setNodes(generationNodes);
        setEdges(generationEdges);

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
    refreshKey,
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
    edge: FamilyTreeEdge
  ) => {
    const branchEdgeIds =
      edges
        .filter(
          (item) =>
            item.familyId ===
            edge.familyId
        )
        .map(
          (item) =>
            item.id
        );

    setHighlightedEdges(
      (current) => {
        const isSameBranch =
          current.size ===
            branchEdgeIds.length &&
          branchEdgeIds.every(
            (id) =>
              current.has(id)
          );

        if (isSameBranch) {
          return new Set();
        }

        return new Set(
          branchEdgeIds
        );
      }
    );
  };

  //console.log("TreeViewer Rendered with nodes:", nodes);
  //console.log("TreeViewer Rendered with edges:", edges);

  return (
    <div className="w-full h-full">
      <ReactFlow<Node, FamilyTreeEdge>
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