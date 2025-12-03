"use client";

import { useRef, useState } from "react";
import { FileUp, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  bankSelected?: boolean;
}

export function Dropzone({ onFileSelect, disabled, bankSelected = false }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!bankSelected) {
      return; // Prevent upload if no bank selected
    }
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const isDisabled = disabled || !bankSelected;

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative border-2 border-dashed h-[180px] flex flex-col items-center justify-center transition-colors",
        isDisabled
          ? "border-gray-200 bg-gray-50 cursor-not-allowed"
          : "border-gray-300 bg-white cursor-pointer",
        isDragging && !isDisabled && "border-blue-500 bg-gray-50",
        !isDragging && !isDisabled && "hover:bg-gray-50"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isDisabled}
      />

      <div className="flex flex-col items-center gap-3">
        {isDisabled ? (
          <FileUp className="w-10 h-10 text-gray-300" />
        ) : isDragging ? (
          <Upload className="w-10 h-10 text-blue-600" />
        ) : (
          <FileUp className="w-10 h-10 text-gray-400" />
        )}
        <div className="text-center">
          {isDisabled && !bankSelected ? (
            <>
              <p className="text-sm font-medium text-gray-400">
                Please select a bank above to continue
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">
                Drag & drop your PDF here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF files only</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

