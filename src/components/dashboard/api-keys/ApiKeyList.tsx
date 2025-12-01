"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiKey } from "@/lib/utils/api-keys";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ApiKeyListProps {
  keys: ApiKey[];
  onRevoke: (id: string) => void;
}

export function ApiKeyList({ keys, onRevoke }: ApiKeyListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id}>
              <TableCell>
                <code className="text-sm font-mono text-gray-900">
                  {key.masked}
                </code>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(key.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  onClick={() => onRevoke(key.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Revoke
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

