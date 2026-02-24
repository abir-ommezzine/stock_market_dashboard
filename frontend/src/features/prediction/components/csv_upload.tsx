"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Dataset } from "../types"

interface Props {
  onSuccess?: (dataset: Dataset) => void
  userId?: number // Pass this from your auth context
}

export function CsvUpload({ onSuccess, userId = 1 }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    
    // Create FormData to match your @RequestPart and @RequestParam
    const formData = new FormData();
    formData.append("file", file); // Matches @RequestPart("file")
    // userId is added as a query param or part of the body depending on server config
    // Since your controller uses @RequestParam, we append it to the URL
    
    try {
      const url = `http://localhost:8080/api/datasets/upload?userId=${userId}`;
      
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        // IMPORTANT: Let the browser set the Content-Type header with the boundary
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Upload failed");
      }

      const newDataset = await response.json();
      console.log("Dataset Created:", newDataset);
      
      if (onSuccess) onSuccess(newDataset);
      alert("CSV Uploaded Successfully!");
      setFile(null); // Reset after success
      
    } catch (error: any) {
      console.error("Upload Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div>
        <h3 className="text-lg font-semibold">Step 1: Data Source</h3>
        <p className="text-sm text-muted-foreground">
          Upload a local CSV file to create a new dataset.
        </p>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <label 
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">CSV (MAX. 10MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      {file && (
        <div className="flex items-center justify-between p-2 bg-secondary rounded-md">
          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
          <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remove</Button>
        </div>
      )}

      <Button
        className="w-full"
        disabled={!file || uploading}
        onClick={handleUpload}
      >
        {uploading ? "Processing..." : "Continue to Analysis"}
      </Button>
    </div>
  )
}