
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useGameContext } from "@/context/GameContext";
import { AlertTriangle } from "lucide-react";

interface ImportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportDataDialog: React.FC<ImportDataDialogProps> = ({ open, onOpenChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { importGameData } = useGameContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const fileContent = await file.text();
      const success = importGameData(fileContent);
      
      if (success) {
        onOpenChange(false);
        setFile(null);
      }
    } catch (err) {
      console.error("Import error:", err);
      setError("Failed to read the file. Please make sure it's a valid Phase 10 data file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Import Game Data</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Upload a previously exported Phase 10 data file to restore your games and players.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="dataFile" className="text-sm font-medium dark:text-gray-300">
              Data File
            </label>
            <input
              id="dataFile"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="cursor-pointer file:cursor-pointer file:border-0 file:bg-gray-100 file:text-gray-600 
                file:py-2 file:px-4 file:mr-4 file:rounded-md dark:file:bg-gray-700 
                dark:file:text-gray-300 dark:text-gray-300"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!file || isLoading}
            className="bg-phase10-blue hover:bg-phase10-darkBlue text-white"
          >
            {isLoading ? "Importing..." : "Import Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDataDialog;
