"use client";

import React, { useState } from "react";
import { Subject } from "@/lib/types";
import { useSyllabusStore } from "@/lib/store";
import { calculateSubjectProgress, getSubjectStats } from "@/lib/utils";
import ModuleCard from "./ModuleCard";
import ProgressCircle from "./ProgressCircle";

interface SubjectViewProps {
  subject: Subject;
}

/**
 * SubjectView Component
 * Main view for displaying a subject with all its modules and topics
 */
export const SubjectView: React.FC<SubjectViewProps> = ({ subject }) => {
  const { deleteSubject, updateSubject, addModule, setSelectedModule } = useSyllabusStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subject.title);
  const [editDescription, setEditDescription] = useState(subject.description || "");
  const [newModuleName, setNewModuleName] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);

  const progress = calculateSubjectProgress(subject);
  const stats = getSubjectStats(subject);

  const handleDelete = () => {
    if (confirm(`Delete subject "${subject.title}" and all its content?`)) {
      deleteSubject(subject.id);
    }
  };

  const handleUpdateSubject = () => {
    if (editTitle.trim()) {
      updateSubject(subject.id, editTitle, editDescription);
      setIsEditing(false);
    }
  };

  const handleAddModule = () => {
    if (newModuleName.trim()) {
      addModule(subject.id, newModuleName);
      setNewModuleName("");
      setShowAddModule(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === "Enter") {
      callback();
    } else if (e.key === "Escape") {
      setShowAddModule(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subject Header */}
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-lg p-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              autoFocus
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 text-white placeholder-white/50 rounded outline-none focus:ring-2 focus:ring-white/50 text-2xl font-bold"
              placeholder="Subject title"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 text-white placeholder-white/50 rounded outline-none focus:ring-2 focus:ring-white/50 text-sm"
              placeholder="Subject description (optional)"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdateSubject}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{subject.title}</h2>
              {subject.description && (
                <p className="text-white/70 text-sm">{subject.description}</p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-yellow-300 hover:bg-white/20 rounded transition-colors"
                title="Edit subject"
                aria-label="Edit subject"
              >
                ✎
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-300 hover:bg-white/20 rounded transition-colors"
                title="Delete subject"
                aria-label="Delete subject"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Summary */}
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-lg p-6 flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-white font-semibold">Overall Progress</h3>
          <div className="text-sm text-white/70">
            <p>{stats.completedTopics} of {stats.totalTopics} topics completed</p>
            <p>{stats.moduleCount} modules</p>
          </div>
        </div>
        <ProgressCircle
          percentage={progress}
          size={140}
          strokeWidth={8}
          color={progress === 100 ? "#10b981" : "#8b5cf6"}
          label="Overall"
        />
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Modules</h3>
          {showAddModule ? (
            <div className="flex gap-2 flex-1 ml-4">
              <input
                autoFocus
                type="text"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAddModule)}
                placeholder="Module name..."
                className="flex-1 px-3 py-2 bg-white/20 text-white placeholder-white/50 rounded outline-none focus:ring-2 focus:ring-white/50"
                aria-label="New module name"
              />
              <button
                onClick={handleAddModule}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddModule(false)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddModule(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors text-sm font-medium"
              aria-label="Add new module"
            >
              + Add Module
            </button>
          )}
        </div>

        {subject.modules.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <p className="text-sm">No modules yet. Create your first module to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subject.modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                subjectId={subject.id}
                onSelect={() => setSelectedModule(module.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectView;
