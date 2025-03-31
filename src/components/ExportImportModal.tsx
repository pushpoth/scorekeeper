
import React, { useState, useCallback } from 'react';
import { useGameContext } from "@/context/GameContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface ExportImportModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ExportImportModal: React.FC<ExportImportModalProps> = ({
  trigger,
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [exportType, setExportType] = useState<"json" | "csv">("json");
  const [importType, setImportType] = useState<"json" | "csv">("json");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isControlled] = useState(open !== undefined && onOpenChange !== undefined);
  const [internalOpen, setInternalOpen] = useState(false);
  
  const { exportGameData, exportCsvData, importGameData, importCsvData } = useGameContext();
  
  const handleExport = () => {
    if (exportType === "json") {
      exportGameData();
    } else {
      exportCsvData();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  const resetForm = useCallback(() => {
    setImportFile(null);
    
    // Reset the file input value by recreating the element
    const fileInput = document.getElementById('import-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);
  
  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const fileContent = await importFile.text();
      let success = false;
      
      if (importType === "json") {
        success = importGameData(fileContent);
      } else {
        success = importCsvData(fileContent);
      }
      
      if (success) {
        // Reset the form after successful import
        resetForm();
        
        // Close the modal after successful import
        if (isControlled && onOpenChange) {
          onOpenChange(false);
        } else {
          setInternalOpen(false);
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "An error occurred while importing the file",
        variant: "destructive",
      });
    }
  };
  
  // Handle open state change
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      if (onOpenChange) onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
    
    if (!newOpen) {
      // Reset form when dialog closes
      resetForm();
    }
  };
  
  return (
    <Dialog 
      open={isControlled ? open : internalOpen} 
      onOpenChange={handleOpenChange}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Import/Export Data</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="export" value={activeTab} onValueChange={(value) => setActiveTab(value as "export" | "import")} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          {/* Export Tab */}
          <TabsContent value="export" className="mt-4">
            <RadioGroup
              value={exportType}
              onValueChange={(value) => setExportType(value as "json" | "csv")}
              className="mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="export-json" />
                <Label htmlFor="export-json">JSON Format (Recommended)</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="csv" id="export-csv" />
                <Label htmlFor="export-csv">CSV Format</Label>
              </div>
            </RadioGroup>
            <Button 
              onClick={handleExport} 
              className="w-full bg-phase10-blue hover:bg-phase10-darkBlue text-white"
            >
              Export Data
            </Button>
          </TabsContent>
          
          {/* Import Tab */}
          <TabsContent value="import" className="mt-4">
            <RadioGroup
              value={importType}
              onValueChange={(value) => setImportType(value as "json" | "csv")}
              className="mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="import-json" />
                <Label htmlFor="import-json">JSON Format</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="csv" id="import-csv" />
                <Label htmlFor="import-csv">CSV Format</Label>
              </div>
            </RadioGroup>
            <div className="mb-4">
              <Label htmlFor="import-file">Select File</Label>
              <Input 
                id="import-file" 
                type="file" 
                accept={importType === "json" ? ".json" : ".csv"} 
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleImport} 
              disabled={!importFile}
              className="w-full bg-phase10-blue hover:bg-phase10-darkBlue text-white"
            >
              Import Data
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ExportImportModal;
