"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type PublicTransaction } from "@/lib/api/public-client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";

interface RawTransactionsTableProps {
  transactions: PublicTransaction[];
}

export function RawTransactionsTable({
  transactions,
}: RawTransactionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<PublicTransaction>[] = React.useMemo(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => {
          return (
            <div className="text-sm">
              {new Date(row.original.date).toLocaleDateString()}
            </div>
          );
        },
        sortingFn: "datetime",
        enableColumnFilter: false,
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => {
          const tx = row.original;
          return (
            <div className="flex flex-col gap-y-1 py-2">
              {/* MAIN LABEL */}
              <span className="font-medium">
                {tx.merchant ?? tx.description ?? "Unknown transaction"}
              </span>

              {/* RAW DESCRIPTION */}
              {tx.rawDescription && (
                <span className="text-xs text-gray-500">
                  {tx.rawDescription}
                </span>
              )}
            </div>
          );
        },
        enableSorting: false,
        filterFn: (row, id, value) => {
          const tx = row.original;
          const searchValue = value.toLowerCase();
          return (
            (tx.merchant?.toLowerCase().includes(searchValue) ?? false) ||
            (tx.description?.toLowerCase().includes(searchValue) ?? false) ||
            (tx.rawDescription?.toLowerCase().includes(searchValue) ?? false)
          );
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => {
          const tx = row.original;
          const color = tx.amount >= 0 ? "#059669" : "#dc2626";
          return (
            <div className="text-right font-medium" style={{ color }}>
              {tx.amount > 0 ? "+" : ""}
              {tx.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {tx.currency}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          return rowA.original.amount - rowB.original.amount;
        },
        enableColumnFilter: false,
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => {
          const category = row.original.category;
          return category ? (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          );
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const catA = rowA.original.category ?? "";
          const catB = rowB.original.category ?? "";
          return catA.localeCompare(catB);
        },
        enableColumnFilter: false,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          // Infer type from category or use a default
          const category = row.original.category;
          const type = category?.toUpperCase() || "OTHER";
          
          // Map common categories to types
          let displayType = "OTHER";
          if (type.includes("CARD") || type.includes("DEBIT") || type.includes("CREDIT")) {
            displayType = "CARD";
          } else if (type.includes("TRANSFER") || type.includes("WIRE")) {
            displayType = "TRANSFER";
          } else if (type.includes("ATM") || type.includes("WITHDRAWAL")) {
            displayType = "ATM";
          } else if (category) {
            displayType = category.toUpperCase().slice(0, 8);
          }

          return (
            <Badge variant="outline" className="text-xs">
              {displayType}
            </Badge>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const tx = row.original;
      const search = filterValue.toLowerCase();
      return (
        (tx.merchant?.toLowerCase().includes(search) ?? false) ||
        (tx.description?.toLowerCase().includes(search) ?? false) ||
        (tx.rawDescription?.toLowerCase().includes(search) ?? false) ||
        (tx.category?.toLowerCase().includes(search) ?? false)
      );
    },
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
      sorting: [
        {
          id: "date",
          desc: true, // Newest first by default
        },
      ],
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar with global search */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-end gap-4 flex-1">
          {/* Global Search */}
          <div className="flex flex-col space-y-1 w-[300px]">
            <label className="text-xs text-gray-500">Search</label>
            <Input
              placeholder="Search merchant, description, or category..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}

