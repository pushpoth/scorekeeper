
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGameContext } from "@/context/GameContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importType?: 'json' | 'csv';
}

const ImportDataDialog = ({ open, onOpenChange, importType = 'json' }: ImportDataDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'json' | 'csv'>(importType);
  const { importGameData, importCsvData } = useGameContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    if (activeTab === 'json' && !selectedFile.name.toLowerCase().endsWith('.json')) {
      setError("Please select a JSON file.");
      setFile(null);
      return;
    }
    
    if (activeTab === 'csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError("Please select a CSV file.");
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import.");
      return;
    }

    try {
      const text = await file.text();
      
      let success = false;
      if (activeTab === 'json') {
        success = importGameData(text);
      } else {
        success = importCsvData(text);
      }
      
      if (success) {
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Error reading file:", err);
      setError("Failed to read the selected file.");
    }
  };
  
  // Update active tab when importType changes
  if (importType !== activeTab) {
    setActiveTab(importType);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Game Data
          </DialogTitle>
          <DialogDescription>
            Upload your exported Phase 10 game data to restore your games and players
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'json' | 'csv')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json">JSON Data</TabsTrigger>
            <TabsTrigger value="csv">CSV Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="json" className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="importFile">Select JSON file</Label>
                <Input
                  id="importFile"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The file should be an exported Phase 10 score tracker data file.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="csv" className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="importCsvFile">Select CSV file</Label>
                <Input
                  id="importCsvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The CSV file should have columns for date, player scores, phases, and completion status.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Example headers: date, PlayerName_score, PlayerName_phase, PlayerName_completed
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file}>
            Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDataDialog;
