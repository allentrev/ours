import { useEffect, useState } from "react";

import { searchFamilyPeople } from "../../utilities/familyUtils";

interface PersonResult {
  handle: string;
  displayName: string;
}

interface Props {
  onSearch: (personHandle: string) => void;
}

const FamilySearch = ({ onSearch }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<PersonResult[]>([]);
const [hasSelected, setHasSelected] = useState(false);

  useEffect(() => {
    const runSearch = async () => {
      if (hasSelected || searchText.trim().length < 2) {
        setResults([]);
        return;
      }

      try {
        const data = await searchFamilyPeople(searchText);

        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      }
    };

    const timeout = setTimeout(runSearch, 300);

    return () => clearTimeout(timeout);
  }, [searchText, hasSelected]);

  return (
    <div className="relative border-b border-gray-200 bg-white p-4">
      <input
        type="text"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setHasSelected(false);
        }}
        placeholder="Search family member..."
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {results.length > 0 && (
        <div className="absolute left-4 right-4 top-[72px] z-20 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          {results.map((person) => (
            <button
              key={person.handle}
              onClick={() => {
                onSearch(person.handle);
                setSearchText(person.displayName);
                setResults([]);
                setHasSelected(true);
              }}
              className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
            >
              {person.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilySearch;