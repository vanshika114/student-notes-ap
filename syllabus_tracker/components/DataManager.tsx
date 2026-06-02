"use client";

import React, { useState } from "react";
import { useSyllabusStore } from "@/lib/store";

/**
 * DataManager Component
 * Handles import/export and data management operations
 */
export const DataManager: React.FC = () => {
  const { exportData, importData, resetData } = useSyllabusStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `syllabus-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowMenu(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data");
    }
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setImportError("Please paste JSON data");
      return;
    }

    try {
      importData(importText);
      setImportText("");
      setImportError(null);
      setShowImportModal(false);
      alert("Data imported successfully!");
      setShowMenu(false);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Invalid JSON format"
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      confirm(
        "This will delete all your data. This action cannot be undone. Are you sure?"
      )
    ) {
      resetData();
      setShowMenu(false);
      alert("All data has been reset");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-white hover:bg-white/20 rounded transition-colors"
        title="Data menu"
        aria-label="Data menu"
        aria-expanded={showMenu}
      >
        ⚙️
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/30 rounded-lg shadow-lg overflow-hidden z-50">
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors text-sm flex items-center gap-2"
          >
            💾 Export Backup
          </button>
          <button
            onClick={() => {
              setShowImportModal(true);
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors text-sm flex items-center gap-2 border-t border-white/20"
          >
            📥 Import Backup
          </button>
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 text-left text-red-300 hover:bg-red-900/30 transition-colors text-sm flex items-center gap-2 border-t border-white/20"
          >
            🗑️ Reset All Data
          </button>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-white/30 rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-white font-semibold text-lg">Import Data</h3>

            <div className="space-y-2">
              <label className="block text-white text-sm font-medium">
                Paste JSON or upload file:
              </label>
              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError(null);
                }}
                placeholder="Paste your backup JSON here..."
                className="w-full h-32 px-3 py-2 bg-white/20 text-white placeholder-white/50 rounded outline-none focus:ring-2 focus:ring-white/50"
              />

              <label className="block">
                <span className="text-white text-sm">Or upload file:</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="mt-2 w-full px-3 py-2 bg-white/20 text-white rounded text-sm file:mr-2 file:bg-white/30 file:text-white file:border-0 file:rounded file:px-2 file:py-1 file:cursor-pointer hover:file:bg-white/40"
                />
              </label>
            </div>

            {importError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded">
                {importError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleImport}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
              >
                Import
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText("");
                  setImportError(null);
                }}
                className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManager;
