import React, { useMemo, useState } from 'react';

export type ColumnDescriptor<T> = {
  label: string;
  key: keyof T | (string & {});
  render?: (value: any, item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  optional?: boolean;
};

type MaintainEntityManagerProps<T> = {
  columns: ColumnDescriptor<T>[];
  entities: T[];
  selectedItems: T[];
  onSelectItem: (item: T) => void;
  onSelectAll: (checked: boolean) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  isSelected: (item: T) => boolean;
  filterText?: string;
  filterKey?: string;
  filterFunction?: (item: T, filterText?: string, filterKey?: string) => boolean;
};

function MobileRow<T extends { [key: string]: any }>({
  item,
  columns,
  isSelected,
  onSelect,
}: {
  item: T;
  columns: ColumnDescriptor<T>[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [showMore, setShowMore] = useState(false);
  const requiredCols = columns.filter((col) => !col.optional);
  const optionalCols = columns.filter((col) => col.optional);

  return (
    <div
      className="flex items-center border rounded px-2 py-1 relative bg-white"
      onTouchStart={() => setShowMore(true)}
      onTouchEnd={() => setShowMore(false)}
      onMouseEnter={() => setShowMore(true)}
      onMouseLeave={() => setShowMore(false)}
    >
      {requiredCols.map((col, i) => {
        const value = item[col.key];
        const content = col.render ? col.render(value, item) : value;
        return (
          <div
            key={i}
            className={`flex-1 ${
              col.align === 'center'
                ? 'text-center'
                : col.align === 'right'
                ? 'text-right'
                : 'text-left'
            } truncate pr-2`}
          >
            {content}
          </div>
        );
      })}

      {optionalCols.length > 0 && (
        <div className="relative text-gray-500 px-1 cursor-pointer">
          {showMore ? (
            <div className="absolute top-full left-0 z-10 mt-1 bg-white border rounded shadow-lg p-2 w-max max-w-[90vw]">
              {optionalCols.map((col, i) => {
                const value = item[col.key];
                return (
                  <div key={i} className="text-sm">
                    <strong>{col.label}:</strong>{' '}
                    {col.render ? col.render(value, item) : value}
                  </div>
                );
              })}
            </div>
          ) : (
            <>…</>
          )}
        </div>
      )}

      <div className="w-8 text-center">
        <input type="checkbox" checked={isSelected} onChange={onSelect} />
      </div>
    </div>
  );
}

export function MaintainEntityManager<T extends { [key: string]: any }>({
  columns,
  entities,
  selectedItems,
  onSelectItem,
  onSelectAll,
  itemsPerPage,
  onItemsPerPageChange,
  currentPage,
  onPageChange,
  isSelected,
  filterText,
  filterKey,
  filterFunction,
}: MaintainEntityManagerProps<T>) {
  
  // Filter the entities before pagination
  const filteredEntities = useMemo(() => {
    if (!filterFunction) return entities;

    return entities.filter((e) => filterFunction(e, filterText, filterKey));
  }, [entities, filterFunction, filterText, filterKey]);
  const totalItems = filteredEntities.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const currentItems = useMemo(
    () =>
      filteredEntities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [filteredEntities, currentPage, itemsPerPage]
  );

  const allSelected =
    currentItems.length > 0 && currentItems.every((item) => isSelected(item));
  const requiredCols = columns.filter((c) => !c.optional);

  return (
    <div className="w-full">
      {/* Pagination Top */}
      <div className="flex items-center justify-between text-sm mb-2">
        <div>
          {selectedItems.length}/{totalItems} selected
        </div>
        <div className="flex items-center gap-2">
          <label>
            Items per page:
            <input
              type="number"
              min={1}
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="ml-2 w-16 border rounded px-1 py-0.5"
            />
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
            Select All
          </label>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block border rounded">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`p-2 border ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
              <th className="p-2 border text-center">✓</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index} className="border-t">
                {columns.map((col, i) => {
                  const value = item[col.key];
                  const content = col.render ? col.render(value, item) : value;
                  return (
                    <td
                      key={i}
                      className={`p-2 border ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      {content}
                    </td>
                  );
                })}
                <td className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={isSelected(item)}
                    onChange={() => onSelectItem(item)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col gap-2 mt-4">
        <div className="flex font-bold bg-gray-100 border p-2 rounded">
          {requiredCols.map((col, index) => (
            <div
              key={index}
              className={`flex-1 ${
                col.align === 'center'
                  ? 'text-center'
                  : col.align === 'right'
                  ? 'text-right'
                  : 'text-left'
              } truncate pr-2`}
            >
              {col.label}
            </div>
          ))}
          {columns.some((c) => c.optional) && <div className="px-2">…</div>}
          <div className="w-8 text-center">✓</div>
        </div>

        {currentItems.map((item, index) => (
          <MobileRow
            key={index}
            item={item}
            columns={columns}
            isSelected={isSelected(item)}
            onSelect={() => onSelectItem(item)}
          />
        ))}
      </div>

      {/* Pagination Bottom */}
      <div className="flex justify-center gap-2 mt-4 text-sm">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          &laquo;
        </button>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          &lt;
        </button>
        <span className="px-2 py-1">{currentPage}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          &gt;
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          &raquo;
        </button>
      </div>
    </div>
  );
}
