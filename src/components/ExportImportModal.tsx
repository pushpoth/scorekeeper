
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Download, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGameContext } from "@/context/GameContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface ExportImportModalProps {
  trigger?: React.ReactNode;
}

const ExportImportModal = ({ trigger }: ExportImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0); // Used to reset the file input

  const { exportGameData, exportCsvData, importGameData, importCsvData } = useGameContext();
  const { toast } = useToast();
  
  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Small delay to ensure the modal is fully closed before resetting state
      const timer = setTimeout(() => {
        setFile(null);
        setError(null);
        setKey(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    if (importFormat === 'json' && !selectedFile.name.toLowerCase().endsWith('.json')) {
      setError("Please select a JSON file.");
      setFile(null);
      return;
    }
    
    if (importFormat === 'csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError("Please select a CSV file.");
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleExport = () => {
    try {
      if (exportFormat === 'json') {
        exportGameData();
      } else {
        exportCsvData();
      }
      
      setOpen(false);
      
      toast({
        title: "Export successful",
        description: `Your game data has been exported as ${exportFormat.toUpperCase()}`
      });
    } catch (err) {
      console.error("Export error:", err);
      setError(`Failed to export data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import.");
      return;
    }

    try {
      const text = await file.text();
      
      let success = false;
      if (importFormat === 'json') {
        success = importGameData(text);
      } else {
        success = importCsvData(text);
      }
      
      if (success) {
        toast({
          title: "Import successful",
          description: `Your game data has been imported successfully`
        });
        
        // Reset and close modal
        setFile(null);
        setError(null);
        setOpen(false);
      }
    } catch (err) {
      console.error("Import error:", err);
      setError(`Failed to import data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Import/Export</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {activeTab === 'export' ? <Download className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            {activeTab === 'export' ? 'Export Game Data' : 'Import Game Data'}
          </DialogTitle>
          <DialogDescription>
            {activeTab === 'export' 
              ? 'Export your Phase 10 game data to save or share it' 
              : 'Upload your exported Phase 10 game data to restore your games and players'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'export' | 'import')} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <RadioGroup 
                  value={exportFormat} 
                  onValueChange={(value) => setExportFormat(value as 'json' | 'csv')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="export-json" />
                    <Label htmlFor="export-json">JSON</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="export-csv" />
                    <Label htmlFor="export-csv">CSV</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {exportFormat === 'json'
                  ? 'Export as JSON to save all game data, players, scores, and settings.'
                  : 'Export as CSV for compatibility with spreadsheet applications.'}
              </p>

              <Button onClick={handleExport} className="w-full mt-4">
                <Download className="mr-2 h-4 w-4" />
                Export as {exportFormat.toUpperCase()}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Import Format</Label>
                <RadioGroup 
                  value={importFormat} 
                  onValueChange={(value) => setImportFormat(value as 'json' | 'csv')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="import-json" />
                    <Label htmlFor="import-json">JSON</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="import-csv" />
                    <Label htmlFor="import-csv">CSV</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="importFile">Select {importFormat.toUpperCase()} file</Label>
                <Input
                  id="importFile"
                  key={`${importFormat}-${key}`} 
                  type="file"
                  accept={`.${importFormat}`}
                  onChange={handleFileChange}
                />
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {importFormat === 'json'
                  ? 'Import a previously exported Phase 10 score tracker JSON file.'
                  : 'Import a CSV file with columns for date, player scores, phases, and completion status.'}
              </p>
              
              {importFormat === 'csv' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Example headers: date, PlayerName_score, PlayerName_phase, PlayerName_completed
                </p>
              )}
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button onClick={handleImport} disabled={!file} className="w-full mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Import {importFormat.toUpperCase()}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ExportImportModal;
