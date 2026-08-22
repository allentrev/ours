import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildConnectionDiagram,
} from "../../../../components/Family/buildConnectionDiagram";

import type {
  PersonConnectionResponse,
} from "../../../../types/familyTypes";

describe(
  "buildConnectionDiagram",
  () => {
    it(
      "lays out a direct ancestor path in one vertical column",
      () => {
        const data:
          PersonConnectionResponse = {
          found: true,

          fromPerson: {
            handle: "child",
            displayName: "Child",
          },

          toPerson: {
            handle: "grandparent",
            displayName: "Grandparent",
          },

          steps: [
            {
              fromHandle: "child",
              toHandle: "parent",
              type: "parent",
              familyHandle: "family-1",
            },

            {
              fromHandle: "parent",
              toHandle: "grandparent",
              type: "parent",
              familyHandle: "family-2",
            },
          ],

          people: [
            {
              handle: "child",
              displayName: "Child",
            },

            {
              handle: "parent",
              displayName: "Parent",
            },

            {
              handle: "grandparent",
              displayName: "Grandparent",
            },
          ],

          familyHandles: [
            "family-1",
            "family-2",
          ],

          personContexts: [
            {
              person: {
                handle: "child",
                displayName: "Child",
              },
              partners: [],
            },

            {
              person: {
                handle: "parent",
                displayName: "Parent",
              },
              partners: [],
            },

            {
              person: {
                handle: "grandparent",
                displayName: "Grandparent",
              },
              partners: [],
            },
          ],
        };

        const result =
          buildConnectionDiagram(
            data
          );

        expect(
          result.nodes
        ).toHaveLength(
          3
        );

        expect(
          result.edges
        ).toHaveLength(
          2
        );

        const childNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "child"
          );

        const parentNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "parent"
          );

        const grandparentNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "grandparent"
          );

        expect(
          childNode
        ).toBeDefined();

        expect(
          parentNode
        ).toBeDefined();

        expect(
          grandparentNode
        ).toBeDefined();

        /*
         * A direct ancestor path should stay
         * in one vertical column.
         */
        expect(
          childNode!.position.x
        ).toBe(
          parentNode!.position.x
        );

        expect(
          parentNode!.position.x
        ).toBe(
          grandparentNode!.position.x
        );

        /*
         * Highest ancestor appears at the top.
         */
        expect(
          grandparentNode!.position.y
        ).toBeLessThan(
          parentNode!.position.y
        );

        expect(
          parentNode!.position.y
        ).toBeLessThan(
          childNode!.position.y
        );

        /*
         * Edges are rendered in genealogy
         * direction: parent -> child.
         */
        const grandparentToParent =
          result.edges.find(
            (edge) =>
              edge.source ===
                "grandparent" &&
              edge.target ===
                "parent"
          );

        const parentToChild =
          result.edges.find(
            (edge) =>
              edge.source ===
                "parent" &&
              edge.target ===
                "child"
          );

        expect(
          grandparentToParent
        ).toBeDefined();

        expect(
          parentToChild
        ).toBeDefined();

        expect(
          grandparentToParent
            ?.sourceHandle
        ).toBe(
          "bottom-source"
        );

        expect(
          parentToChild
            ?.sourceHandle
        ).toBe(
          "bottom-source"
        );
      }
    );

    it(
      "splits a cousin-style connection into left and right branches around the common ancestor",
      () => {
        const data:
          PersonConnectionResponse = {
          found: true,

          fromPerson: {
            handle: "from-person",
            displayName: "From Person",
          },

          toPerson: {
            handle: "to-person",
            displayName: "To Person",
          },

          steps: [
            {
              fromHandle: "from-person",
              toHandle: "from-parent",
              type: "parent",
              familyHandle: "family-a",
            },

            {
              fromHandle: "from-parent",
              toHandle: "common-ancestor",
              type: "parent",
              familyHandle: "family-b",
            },

            {
              fromHandle: "common-ancestor",
              toHandle: "to-parent",
              type: "child",
              familyHandle: "family-c",
            },

            {
              fromHandle: "to-parent",
              toHandle: "to-person",
              type: "child",
              familyHandle: "family-d",
            },
          ],

          people: [
            {
              handle: "from-person",
              displayName: "From Person",
            },

            {
              handle: "from-parent",
              displayName: "From Parent",
            },

            {
              handle: "common-ancestor",
              displayName: "Common Ancestor",
            },

            {
              handle: "to-parent",
              displayName: "To Parent",
            },

            {
              handle: "to-person",
              displayName: "To Person",
            },
          ],

          familyHandles: [
            "family-a",
            "family-b",
            "family-c",
            "family-d",
          ],

          personContexts: [
            {
              person: {
                handle: "from-person",
                displayName: "From Person",
              },
              partners: [],
            },

            {
              person: {
                handle: "from-parent",
                displayName: "From Parent",
              },
              partners: [],
            },

            {
              person: {
                handle: "common-ancestor",
                displayName: "Common Ancestor",
              },
              partners: [],
            },

            {
              person: {
                handle: "to-parent",
                displayName: "To Parent",
              },
              partners: [],
            },

            {
              person: {
                handle: "to-person",
                displayName: "To Person",
              },
              partners: [],
            },
          ],
        };

        const result =
          buildConnectionDiagram(
            data
          );

        expect(
          result.nodes
        ).toHaveLength(
          5
        );

        expect(
          result.edges
        ).toHaveLength(
          4
        );

        const fromPersonNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "from-person"
          );

        const fromParentNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "from-parent"
          );

        const commonAncestorNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "common-ancestor"
          );

        const toParentNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "to-parent"
          );

        const toPersonNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "to-person"
          );

        expect(
          fromPersonNode
        ).toBeDefined();

        expect(
          fromParentNode
        ).toBeDefined();

        expect(
          commonAncestorNode
        ).toBeDefined();

        expect(
          toParentNode
        ).toBeDefined();

        expect(
          toPersonNode
        ).toBeDefined();

        /*
        * The common ancestor sits at the
        * centre of the diagram.
        */
        expect(
          commonAncestorNode!
            .position.x
        ).toBe(
          0
        );

        /*
        * The branch leading to the source
        * person should be on the left.
        */
        expect(
          fromParentNode!
            .position.x
        ).toBeLessThan(
          commonAncestorNode!
            .position.x
        );

        expect(
          fromPersonNode!
            .position.x
        ).toBe(
          fromParentNode!
            .position.x
        );

        /*
        * The branch leading to the target
        * person should be on the right.
        */
        expect(
          toParentNode!
            .position.x
        ).toBeGreaterThan(
          commonAncestorNode!
            .position.x
        );

        expect(
          toPersonNode!
            .position.x
        ).toBe(
          toParentNode!
            .position.x
        );

        /*
        * Both branches descend from the
        * common ancestor.
        */
        expect(
          commonAncestorNode!
            .position.y
        ).toBeLessThan(
          fromParentNode!
            .position.y
        );

        expect(
          commonAncestorNode!
            .position.y
        ).toBeLessThan(
          toParentNode!
            .position.y
        );

        /*
        * Check genealogy-direction edges.
        */
        expect(
          result.edges.some(
            (edge) =>
              edge.source ===
                "common-ancestor" &&
              edge.target ===
                "from-parent"
          )
        ).toBe(
          true
        );

        expect(
          result.edges.some(
            (edge) =>
              edge.source ===
                "common-ancestor" &&
              edge.target ===
                "to-parent"
          )
        ).toBe(
          true
        );

        expect(
          result.edges.some(
            (edge) =>
              edge.source ===
                "from-parent" &&
              edge.target ===
                "from-person"
          )
        ).toBe(
          true
        );

        expect(
          result.edges.some(
            (edge) =>
              edge.source ===
                "to-parent" &&
              edge.target ===
                "to-person"
          )
        ).toBe(
          true
        );
      }
    );

    it(
      "adds one contextual partner node without changing the connection path",
      () => {
        const data:
          PersonConnectionResponse = {
          found: true,

          fromPerson: {
            handle: "child",
            displayName: "Child",
          },

          toPerson: {
            handle: "parent",
            displayName: "Parent",
          },

          steps: [
            {
              fromHandle: "child",
              toHandle: "parent",
              type: "parent",
              familyHandle: "family-1",
            },
          ],

          people: [
            {
              handle: "child",
              displayName: "Child",
            },
            {
              handle: "parent",
              displayName: "Parent",
            },
          ],

          familyHandles: [
            "family-1",
          ],

          personContexts: [
            {
              person: {
                handle: "child",
                displayName: "Child",
              },
              partners: [
                {
                  handle: "child-partner",
                  displayName: "Child Partner",
                  familyHandle: "partner-family",
                },
              ],
            },

            {
              person: {
                handle: "parent",
                displayName: "Parent",
              },
              partners: [],
            },
          ],
        };

        const result =
          buildConnectionDiagram(
            data
          );

        /*
        * Two path people plus one
        * contextual partner.
        */
        expect(
          result.nodes
        ).toHaveLength(
          3
        );

        const partnerNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "partner-child-partner"
          );

        expect(
          partnerNode
        ).toBeDefined();

        expect(
          partnerNode?.type
        ).toBe(
          "person"
        );

        /*
        * Partner should sit beside the
        * owning path person.
        */
        const childNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "child"
          );

        expect(
          childNode
        ).toBeDefined();

        expect(
          partnerNode!
            .position.y
        ).toBe(
          childNode!
            .position.y
        );

        expect(
          partnerNode!
            .position.x
        ).toBeGreaterThan(
          childNode!
            .position.x
        );

        /*
        * The actual genealogy connection
        * edge must remain unchanged.
        */
        expect(
          result.edges.some(
            (edge) =>
              edge.source ===
                "parent" &&
              edge.target ===
                "child"
          )
        ).toBe(
          true
        );

        /*
        * A separate contextual partner
        * edge should also exist.
        */
        expect(
          result.edges.some(
            (edge) =>
              edge.source ===
                "child" &&
              edge.target ===
                "partner-child-partner"
          )
        ).toBe(
          true
        );
      }
    );

    it(
      "adds a MultiplePartner node when a path person has more than one partner",
      () => {
        const data:
          PersonConnectionResponse = {
          found: true,

          fromPerson: {
            handle: "child",
            displayName: "Child",
          },

          toPerson: {
            handle: "parent",
            displayName: "Parent",
          },

          steps: [
            {
              fromHandle: "child",
              toHandle: "parent",
              type: "parent",
              familyHandle: "family-1",
            },
          ],

          people: [
            {
              handle: "child",
              displayName: "Child",
            },
            {
              handle: "parent",
              displayName: "Parent",
            },
          ],

          familyHandles: [
            "family-1",
          ],

          personContexts: [
            {
              person: {
                handle: "child",
                displayName: "Child",
              },
              partners: [
                {
                  handle: "partner-1",
                  displayName: "Partner 1",
                  familyHandle: "partner-family-1",
                },
                {
                  handle: "partner-2",
                  displayName: "Partner 2",
                  familyHandle: "partner-family-2",
                },
                {
                  handle: "partner-3",
                  displayName: "Partner 3",
                  familyHandle: "partner-family-3",
                },
              ],
            },

            {
              person: {
                handle: "parent",
                displayName: "Parent",
              },
              partners: [],
            },
          ],
        };

        const result =
          buildConnectionDiagram(
            data
          );

        /*
        * Two path people plus one
        * synthetic MultiplePartner node.
        */
        expect(
          result.nodes
        ).toHaveLength(
          3
        );

        const multiplePartnerNode =
          result.nodes.find(
            (node) =>
              node.id ===
              "multiple-partner-child"
          );

        expect(
          multiplePartnerNode
        ).toBeDefined();

        expect(
          multiplePartnerNode?.type
        ).toBe(
          "multiplePartner"
        );

        expect(
          multiplePartnerNode
            ?.data
            ?.personHandle
        ).toBe(
          "child"
        );

        expect(
          multiplePartnerNode
            ?.data
            ?.noPartners
        ).toBe(
          3
        );

        /*
        * Individual partner nodes should
        * not be rendered in this case.
        */
        expect(
          result.nodes.some(
            (node) =>
              node.id ===
              "partner-partner-1"
          )
        ).toBe(
          false
        );

        expect(
          result.nodes.some(
            (node) =>
              node.id ===
              "partner-partner-2"
          )
        ).toBe(
          false
        );

        expect(
          result.nodes.some(
            (node) =>
              node.id ===
              "partner-partner-3"
          )
        ).toBe(
          false
        );

        /*
        * The synthetic MultiplePartner node
        * should be connected to its owner.
        */
        expect(
          result.edges.some(
            (edge) =>
              edge.source ===
                "child" &&
              edge.target ===
                "multiple-partner-child"
          )
        ).toBe(
          true
        );

        /*
        * The real connection path remains
        * parent -> child.
        */
        expect(
          result.edges.some(
            (edge) =>
              edge.source ===
                "parent" &&
              edge.target ===
                "child"
          )
        ).toBe(
          true
        );
      }
    );

    //-------------------------
  }
);