// components/Family/PersonSelectorModal.tsx

import {
  useEffect,
  useState,
  type MouseEvent,
} from "react";

import type {
  PersonRecord,
} from "../../types/familyTypes";

import {
  searchFamilyPeople,
} from "../../utilities/Family/utils";

interface PersonSelectorModalProps {
  open: boolean;
  title?: string;
  excludeHandles?: string[];
  onClose: () => void;

  onSelectPerson: (
    person: PersonRecord
  ) => void;
}

const PersonSelectorModal = ({
  open,
  title = "Select Person",
  excludeHandles = [],
  onClose,
  onSelectPerson,
}: PersonSelectorModalProps) => {
  const [query, setQuery] =
    useState("");

  const [
    results,
    setResults,
  ] = useState<PersonRecord[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const trimmedQuery =
      query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);

      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const people =
            await searchFamilyPeople(
              trimmedQuery
            );

          if (!cancelled) {
            setResults(
              people.filter(
                (person) =>
                  !excludeHandles.includes(
                    person.handle
                  )
              )
            );
          }
        } catch (searchError) {
          console.error(
            "Failed to search people:",
            searchError
          );

          if (!cancelled) {
            setResults([]);
            setError(
              "Failed to search people."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      },
      300
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    open,
    query,
    excludeHandles,
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

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-[80]
        flex items-center justify-center
        bg-black/40 p-4
      "
      onMouseDown={
        handleBackdropClick
      }
    >
      <div
        className="
          flex max-h-[90vh]
          w-full max-w-xl
          flex-col overflow-hidden
          rounded-lg bg-white
          shadow-xl
        "
      >
        {/* Header */}
        <div className="shrink-0 border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {title}
          </h2>
        </div>

        {/* Search */}
        <div className="shrink-0 border-b px-6 py-4">
          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search by name..."
            autoFocus
            className="
              w-full rounded
              border border-gray-300
              px-3 py-2
            "
          />
        </div>

        {/* Results */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="py-6 text-center text-sm text-gray-500">
              Searching...
            </div>
          )}

          {error && !loading && (
            <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            query.trim().length < 2 && (
              <div className="py-6 text-center text-sm text-gray-500">
                Enter at least two characters.
              </div>
            )}

          {!loading &&
            !error &&
            query.trim().length >= 2 &&
            results.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-500">
                No people found.
              </div>
            )}

          {!loading &&
            !error &&
            results.length > 0 && (
              <div className="space-y-2">
                {results.map(
                  (person) => (
                    <button
                      key={
                        person.handle
                      }
                      type="button"
                      onClick={() => {
                        onSelectPerson(
                          person
                        );

                        onClose();
                      }}
                      className="
                        w-full rounded
                        border border-gray-200
                        bg-gray-50
                        px-4 py-3
                        text-left
                        hover:bg-blue-50
                      "
                    >
                      <div className="font-medium text-gray-800">
                        {
                          person.displayName
                        }
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        Handle:{" "}
                        {person.handle}
                      </div>
                    </button>
                  )
                )}
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t px-6 py-4">
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
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonSelectorModal;