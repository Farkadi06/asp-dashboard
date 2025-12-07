"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InternalApiKey } from "@/lib/api/internal-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ApiKeyListProps {
  keys: InternalApiKey[];
  onRevoke: (id: string, prefix: string) => void;
}

export function ApiKeyList({ keys, onRevoke }: ApiKeyListProps) {
  const router = useRouter();

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

  // Mask the prefix: show prefix + "…****"
  const maskKeyPrefix = (prefix: string) => {
    return `${prefix}…****`;
  };

  const handleRowClick = (e: React.MouseEvent, keyId: string) => {
    // Don't navigate if clicking on the revoke button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push("/dashboard/api-keys/access");
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow 
              key={key.id}
              onClick={(e) => handleRowClick(e, key.id)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell>
                <code className="text-sm font-mono text-gray-900">
                  {maskKeyPrefix(key.prefix)}
                </code>
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {key.displayName}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(key.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevoke(key.id, key.prefix);
                  }}
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

