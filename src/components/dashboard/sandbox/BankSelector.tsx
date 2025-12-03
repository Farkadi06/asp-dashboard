"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BANKS } from "@/lib/config/banks";

interface BankSelectorProps {
  selectedBank: string | null;
  onChange: (bankCode: string) => void;
}

export function BankSelector({ selectedBank, onChange }: BankSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="bank-select" className="text-sm font-medium text-gray-900">
        Select Bank
      </Label>
      <Select value={selectedBank || ""} onValueChange={onChange}>
        <SelectTrigger
          id="bank-select"
          className="w-full bg-white border border-gray-300 text-sm hover:bg-gray-50 rounded-none"
        >
          <SelectValue placeholder="Choose a bank" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 rounded-none">
          {BANKS.map((bank) => (
            <SelectItem
              key={bank.code}
              value={bank.code}
              className="text-sm cursor-pointer hover:bg-gray-50 rounded-none"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-600">
                    {bank.code.slice(0, 2)}
                  </span>
                </div>
                <span>{bank.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

