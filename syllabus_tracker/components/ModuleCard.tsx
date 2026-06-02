"use client";

import React, { useState } from "react";
import { Module } from "@/lib/types";
import { useSyllabusStore } from "@/lib/store";
import { calculateModuleProgress, getModuleStats } from "@/lib/utils";
import ProgressCircle from "./ProgressCircle";
import TopicChecklist from "./TopicChecklist";

interface ModuleCardProps {
  module: Module;
  subjectId: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

/**
 * ModuleCard Component
 * Displays module progress and topic list with interactive features
 */
export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  subjectId,
  isSelected = false,
  onSelect,
}) => {
  const { deleteModule, updateModule, addTopic } = useSyllabusStore();
  const [isExpanded, setIsExpanded] = useState(isSelected);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(module.name);
  const [newTopicValue, setNewTopicValue] = useState("");
  const [showAddTopic, setShowAddTopic] = useState(false);

  const progress = calculateModuleProgress(module);
  const stats = getModuleStats(module);

  const handleDelete = () => {
    if (confirm(`Delete module "${module.name}"?`)) {
      deleteModule(subjectId, module.id);
    }
  };

  const handleUpdateName = () => {
    if (editValue.trim() && editValue !== module.name) {
      updateModule(subjectId, module.id, editValue);
    }
    setIsEditing(false);
  };

  const handleAddTopic = () => {
    if (newTopicValue.trim()) {
      addTopic(subjectId, module.id, newTopicValue);
      setNewTopicValue("");
      setShowAddTopic(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    callback: () => void,
    closeAfter: boolean = false
  ) => {
    if (e.key === "Enter") {
      callback();
      if (closeAfter) setShowAddTopic(false);
    } else if (e.key === "Escape") {
      setShowAddTopic(false);
    }
  };

  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-300 ${
        isExpanded
          ? "bg-white/20 backdrop-blur-md border border-white/30"
          : "bg-white/10 hover:bg-white/15 border border-white/20"
      }`}
    >
      {/* Module Header */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-white/10 transition-colors"
        onClick={() => {
          setIsExpanded(!isExpanded);
          onSelect?.();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsExpanded(!isExpanded);
            onSelect?.();
          }
        }}
      >
        <div className="flex-1">
          {isEditing ? (
            <input
              autoFocus
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleUpdateName}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateName();
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 bg-white/20 text-white placeholder-white/50 rounded outline-none focus:ring-2 focus:ring-white/50"
            />
          ) : (
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-white text-lg">{module.name}</h3>
              <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/80">
                {stats.completedTopics}/{stats.totalTopics} topics
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <ProgressCircle
            percentage={progress}
            size={80}
            strokeWidth={6}
            color={progress === 100 ? "#10b981" : "#3b82f6"}
          />

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-2 text-yellow-300 hover:bg-white/20 rounded transition-colors"
              title="Edit module name"
              aria-label="Edit module name"
            >
              ✎
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="p-2 text-red-300 hover:bg-white/20 rounded transition-colors"
              title="Delete module"
              aria-label="Delete module"
            >
              ✕
            </button>
          </div>

          <span className="text-white/60 ml-2">{isExpanded ? "▼" : "▶"}</span>
        </div>
      </div>

      {/* Module Content */}
      {isExpanded && (
        <div className="border-t border-white/20 p-4 bg-black/10 space-y-4">
          {/* Topics List */}
          {module.topics.length > 0 && (
            <TopicChecklist
              topics={module.topics}
              subjectId={subjectId}
              moduleId={module.id}
            />
          )}

          {module.topics.length === 0 && !showAddTopic && (
            <p className="text-white/50 text-sm italic">No topics added yet</p>
          )}

          {/* Add Topic Input */}
          {showAddTopic ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newTopicValue}
                onChange={(e) => setNewTopicValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAddTopic, true)}
                placeholder="Topic name..."
                className="flex-1 px-3 py-2 bg-white/20 text-white placeholder-white/50 rounded outline-none focus:ring-2 focus:ring-white/50"
                aria-label="New topic name"
              />
              <button
                onClick={handleAddTopic}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddTopic(false)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTopic(true)}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors text-sm font-medium"
              aria-label="Add new topic"
            >
              + Add Topic
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
