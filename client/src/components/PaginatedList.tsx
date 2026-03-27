import React, { useState, useMemo, useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/24/solid';

interface PaginatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode[];
  itemsPerPage?: number;
  tableHeaders?: string[];
  idKey: keyof T;
  onEditItem: (item: T) => void; // Added for edit button
}

const PaginatedList = <T,>({
  items,
  renderItem,
  itemsPerPage: initialItemsPerPage = 10,
  tableHeaders,
  idKey,
  onEditItem,
}: PaginatedListProps<T>) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [displayItemsPerPage, setDisplayItemsPerPage] = useState<number>(initialItemsPerPage);
  const [selectedItems, setSelectedItems] = useState<Set<any>>(new Set());

  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems(new Set());
  }, [items, displayItemsPerPage]);

  const totalPages = Math.ceil(items.length / displayItemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * displayItemsPerPage;
    const endIndex = startIndex + displayItemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, displayItemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setDisplayItemsPerPage(value);
    } else if (e.target.value === '') {
      setDisplayItemsPerPage(0);
    }
  };

  const toggleItemSelection = (item: T) => {
    const itemId = item[idKey];
    setSelectedItems((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allItemIds = new Set(items.map((item) => item[idKey]));
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const areAllItemsSelected = items.length > 0 && selectedItems.size === items.length;

  const getAlignmentClass = (header: string) => {
    switch (header) {
      case 'Date':
      case 'Time':
      case 'Subject':
        return 'text-left';
      case 'Venue':
      case 'Dress':
      case 'League':
      case 'Team':
        return 'text-center';
      default:
        return 'text-left';
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-gray-700">Paginated Content</h2>

      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex flex-wrap justify-between items-center gap-3">
        <p className="font-medium text-gray-700 text-lg">
          Selected: <span className="font-bold text-blue-700">{selectedItems.size}</span> / Total: <span className="font-bold text-blue-700">{items.length}</span>
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="items-per-page" className="text-sm font-medium text-gray-700">Items per page:</label>
          <input
            id="items-per-page"
            type="number"
            min="1"
            value={displayItemsPerPage === 0 ? '' : displayItemsPerPage}
            onChange={handleItemsPerPageChange}
            className="w-20 p-2 border border-gray-300 rounded-md text-center focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="select-all"
            type="checkbox"
            checked={areAllItemsSelected}
            onChange={handleSelectAll}
            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="select-all" className="text-sm font-medium text-gray-700 cursor-pointer">Select All</label>
        </div>
      </div>

      <div className="block md:hidden bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <p className="font-medium text-lg mb-3 text-yellow-800">List View (Mobile)</p>
        {currentItems.length > 0 ? (
          <ul className="list-none space-y-3">
            {currentItems.map((item, index) => {
              const itemContent = renderItem(item, index);
              const dateField = itemContent[0];
              const timeField = itemContent[1];
              const subjectField = itemContent[2];
              const rightAlignedFields = itemContent.slice(3);

              return (
                <li key={item[idKey] as React.Key} className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm border border-gray-100">
                  <div className="flex-grow flex items-center min-w-0">
                    <div className="min-w-1/2 flex">
                      <div className="flex-shrink-0 pr-1">{dateField}</div>
                      <div className="flex-shrink-0 pr-1">{timeField}</div>
                      <div className="flex-grow truncate">{subjectField}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-[2px] flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-x-1">
                      <div className="w-[60px] text-center">{rightAlignedFields[0]}</div>
                      <div className="w-[60px] text-center">{rightAlignedFields[1]}</div>
                      <div className="w-[45px] text-center">{rightAlignedFields[2]}</div>
                      <div className="w-[20px] text-center">{rightAlignedFields[3]}</div>
                    </div>

                    <div className="block sm:hidden relative group">
                      <button className="text-gray-500 hover:text-gray-700 text-xl">⋯</button>
                      <div className="absolute right-0 mt-2 w-48 p-2 bg-white border border-gray-200 rounded shadow-lg text-sm hidden group-hover:block z-10">
                        <div><strong>Venue:</strong> {rightAlignedFields[0]}</div>
                        <div><strong>Dress:</strong> {rightAlignedFields[1]}</div>
                        <div><strong>League:</strong> {rightAlignedFields[2]}</div>
                        <div><strong>Team:</strong> {rightAlignedFields[3]}</div>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={selectedItems.has(item[idKey])}
                      onChange={() => toggleItemSelection(item)}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-600">No items to display.</p>
        )}
      </div>

      <div className="hidden md:block bg-teal-50 p-4 rounded-md border border-teal-200 overflow-x-auto">
        <p className="font-medium text-lg mb-3 text-teal-800">Table View (Desktop)</p>
        {currentItems.length > 0 ? (
          <table className="min-w-full table-fixed bg-white border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                {tableHeaders && tableHeaders.map((header, index) => (
                  <th
                    key={index}
                    className={`py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wider
                      ${header === 'Date' ? 'w-[70px] min-w-[70px] text-left' : ''}
                      ${header === 'Time' ? 'w-[60px] min-w-[60px] text-center' : ''}
                      ${header === 'Venue' ? 'w-[60px] min-w-[60px] text-center' : ''}
                      ${header === 'Dress' ? 'w-[60px] min-w-[60px] text-center' : ''}
                      ${header === 'League' ? 'w-[45px] min-w-[45px] text-center' : ''}
                      ${header === 'Team' ? 'w-[20px] min-w-[20px] text-center' : ''}
                      ${header === 'Subject' ? 'flex-grow text-left' : ''}
                    `}
                  >
                    {header}
                  </th>
                ))}
                <th className="w-10">Edit</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, idx) => (
                <tr
                  key={item[idKey] as React.Key}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}
                >
                  {renderItem(item, idx).map((cellContent, i) => (
                    <td
                      key={i}
                      className={`py-2 px-2 text-sm whitespace-nowrap
                        ${
                          tableHeaders && tableHeaders[i]
                            ? getAlignmentClass(tableHeaders[i])
                            : 'text-left'
                        }`}
                    >
                      {cellContent}
                    </td>
                  ))}
                  <td className="text-center">
                    <button
                      onClick={() => onEditItem(item)}
                      aria-label="Edit Item"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No items to display.</p>
        )}
      </div>

      <nav className="flex justify-center gap-3" aria-label="Pagination">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        {[...Array(totalPages).keys()].map((num) => (
          <button
            key={num}
            onClick={() => goToPage(num + 1)}
            className={`px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 ${
              currentPage === num + 1 ? "bg-blue-600 text-white" : ""
            }`}
          >
            {num + 1}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default PaginatedList;
