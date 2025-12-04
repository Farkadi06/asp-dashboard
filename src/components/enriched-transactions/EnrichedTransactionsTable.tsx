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
import { type EnrichedTransaction } from "@/lib/api/public-client";
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
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface EnrichedTransactionsTableProps {
  transactions: EnrichedTransaction[];
}

// Helper to determine direction
function getDirection(tx: EnrichedTransaction): "INCOME" | "EXPENSE" {
  const dir = tx.direction?.trim().toUpperCase();
  if (dir === "INCOME" || dir === "EXPENSE") {
    return dir as "INCOME" | "EXPENSE";
  }
  return tx.amount > 0 ? "INCOME" : "EXPENSE";
}

// Helper to check if income
function isIncome(tx: EnrichedTransaction): boolean {
  return getDirection(tx) === "INCOME";
}

export function EnrichedTransactionsTable({
  transactions,
}: EnrichedTransactionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Get unique categories for filter dropdown
  const uniqueCategories = React.useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.category) cats.add(tx.category);
    });
    return Array.from(cats).sort();
  }, [transactions]);

  // Get unique merchants for filter dropdown
  const uniqueMerchants = React.useMemo(() => {
    const merchants = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.merchantName) merchants.add(tx.merchantName);
    });
    return Array.from(merchants).sort();
  }, [transactions]);

  const columns: ColumnDef<EnrichedTransaction>[] = React.useMemo(
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
                {tx.merchantName ?? tx.descriptionClean ?? "Unknown"}
              </span>

              {/* RAW DESCRIPTION */}
              {tx.descriptionRaw && (
                <span className="text-xs text-gray-500">
                  {tx.descriptionRaw}
                </span>
              )}

              {/* CATEGORY + SUBCATEGORY */}
              {(tx.category || tx.subcategory) && (
                <div className="flex gap-2 flex-wrap">
                  {tx.category && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {tx.category}
                    </Badge>
                  )}
                  {tx.subcategory && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {tx.subcategory}
                    </Badge>
                  )}
                </div>
              )}

              {/* SALARY + RECURRING BADGES */}
              {(tx.salary || tx.recurring) && (
                <div className="flex gap-2 flex-wrap">
                  {tx.salary && (
                    <Badge className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 border-yellow-200">
                      Salary
                    </Badge>
                  )}
                  {tx.recurring && (
                    <Badge className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border-blue-200">
                      Recurring
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
        filterFn: (row, id, value) => {
          const tx = row.original;
          const searchValue = value.toLowerCase();
          return (
            (tx.merchantName?.toLowerCase().includes(searchValue) ?? false) ||
            (tx.descriptionClean?.toLowerCase().includes(searchValue) ?? false) ||
            (tx.descriptionRaw?.toLowerCase().includes(searchValue) ?? false)
          );
        },
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
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          return row.original.category === value;
        },
        sortingFn: (rowA, rowB) => {
          const catA = rowA.original.category ?? "";
          const catB = rowB.original.category ?? "";
          return catA.localeCompare(catB);
        },
      },
      {
        accessorKey: "merchantName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Merchant" />
        ),
        cell: ({ row }) => {
          const merchant = row.original.merchantName;
          return merchant ? (
            <span className="text-sm">{merchant}</span>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          );
        },
        filterFn: (row, id, value) => {
          if (!value) return true;
          const merchant = row.original.merchantName?.toLowerCase() ?? "";
          return merchant.includes(value.toLowerCase());
        },
        sortingFn: (rowA, rowB) => {
          const merchantA = rowA.original.merchantName ?? "";
          const merchantB = rowB.original.merchantName ?? "";
          return merchantA.localeCompare(merchantB);
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => {
          const tx = row.original;
          const direction = getDirection(tx);
          const color = direction === "INCOME" ? "#059669" : "#dc2626";
          return (
            <div className="text-right font-medium" style={{ color }}>
              {tx.amount.toFixed(2)} {tx.currency}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          return rowA.original.amount - rowB.original.amount;
        },
        enableColumnFilter: false,
      },
      {
        accessorKey: "direction",
        header: "Direction",
        cell: ({ row }) => {
          const tx = row.original;
          const direction = getDirection(tx);
          const isInc = direction === "INCOME";
          return (
            <Badge
              className={`text-xs ${
                isInc
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-red-100 text-red-700 border-red-200"
              }`}
            >
              {direction}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          const direction = getDirection(row.original);
          return direction === value;
        },
        enableSorting: false,
      },
      {
        accessorKey: "salary",
        header: "Salary",
        cell: ({ row }) => {
          const isSalary = row.original.salary;
          return isSalary ? (
            <Badge className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 border-yellow-200">
              Salary
            </Badge>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          );
        },
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          if (value === "yes") return row.original.salary === true;
          if (value === "no") return row.original.salary === false;
          return true;
        },
        enableSorting: false,
      },
      {
        accessorKey: "recurring",
        header: "Recurring",
        cell: ({ row }) => {
          const isRecurring = row.original.recurring;
          return isRecurring ? (
            <Badge className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border-blue-200">
              Recurring
            </Badge>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          );
        },
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          if (value === "yes") return row.original.recurring === true;
          if (value === "no") return row.original.recurring === false;
          return true;
        },
        enableSorting: false,
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
        (tx.merchantName?.toLowerCase().includes(search) ?? false) ||
        (tx.descriptionClean?.toLowerCase().includes(search) ?? false) ||
        (tx.descriptionRaw?.toLowerCase().includes(search) ?? false) ||
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
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar with global search and column filters */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-end gap-4 flex-1 flex-wrap">
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

          {/* Category Filter */}
          <div className="flex flex-col space-y-1 w-[180px]">
            <label className="text-xs text-gray-500">Category</label>
            <Select
              value={
                (table.getColumn("category")?.getFilterValue() as string) ?? "all"
              }
              onValueChange={(value) => {
                table.getColumn("category")?.setFilterValue(value === "all" ? undefined : value);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Direction Filter */}
          <div className="flex flex-col space-y-1 w-[120px]">
            <label className="text-xs text-gray-500">Direction</label>
            <Select
              value={
                (table.getColumn("direction")?.getFilterValue() as string) ?? "all"
              }
              onValueChange={(value) => {
                table.getColumn("direction")?.setFilterValue(value === "all" ? undefined : value);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Merchant Filter */}
          <div className="flex flex-col space-y-1 w-[180px]">
            <label className="text-xs text-gray-500">Merchant</label>
            <Input
              placeholder="Filter merchant..."
              value={(table.getColumn("merchantName")?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn("merchantName")?.setFilterValue(e.target.value)
              }
              className="h-9"
            />
          </div>

          {/* Salary Filter */}
          <div className="flex flex-col space-y-1 w-[120px]">
            <label className="text-xs text-gray-500">Salary</label>
            <Select
              value={
                (table.getColumn("salary")?.getFilterValue() as string) ?? "all"
              }
              onValueChange={(value) => {
                table.getColumn("salary")?.setFilterValue(value === "all" ? undefined : value);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Salary</SelectItem>
                <SelectItem value="no">Non-salary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Filter */}
          <div className="flex flex-col space-y-1 w-[120px]">
            <label className="text-xs text-gray-500">Recurring</label>
            <Select
              value={
                (table.getColumn("recurring")?.getFilterValue() as string) ?? "all"
              }
              onValueChange={(value) => {
                table.getColumn("recurring")?.setFilterValue(value === "all" ? undefined : value);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Recurring</SelectItem>
                <SelectItem value="no">Non-recurring</SelectItem>
              </SelectContent>
            </Select>
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

