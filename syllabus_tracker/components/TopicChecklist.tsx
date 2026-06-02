"use client";

import React, { useState } from "react";
import { Topic } from "@/lib/types";
import { useSyllabusStore } from "@/lib/store";

interface TopicChecklistProps {
  topics: Topic[];
  subjectId: string;
  moduleId: string;
}

/**
 * TopicChecklist Component
 * Provides accessible keyboard navigation and semantic HTML for screen readers
 */
export const TopicChecklist: React.FC<TopicChecklistProps> = ({
  topics,
  subjectId,
  moduleId,
}) => {
  const { toggleTopic, deleteTopic, updateTopic } = useSyllabusStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleToggleTopic = (topicId: string) => {
    toggleTopic(subjectId, moduleId, topicId);
  };

  const handleDeleteTopic = (topicId: string) => {
    if (confirm("Delete this topic?")) {
      deleteTopic(subjectId, moduleId, topicId);
    }
  };

  const handleEditStart = (topicId: string, name: string) => {
    setEditingId(topicId);
    setEditValue(name);
  };

  const handleEditSave = (topicId: string) => {
    if (editValue.trim()) {
      updateTopic(subjectId, moduleId, topicId, editValue);
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, topicId: string) => {
    if (e.key === "Enter") {
      handleEditSave(topicId);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-2">
      <ul className="space-y-2" role="list" aria-label="Topics list">
        {topics.map((topic) => (
          <li
            key={topic.id}
            className="group flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-white/50"
            role="listitem"
          >
            {editingId === topic.id ? (
              <input
                autoFocus
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleEditSave(topic.id)}
                onKeyDown={(e) => handleKeyDown(e, topic.id)}
                className="flex-1 px-2 py-1 bg-white/20 text-white placeholder-white/50 rounded outline-none"
                placeholder="Topic name"
              />
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={topic.isCompleted}
                  onChange={() => handleToggleTopic(topic.id)}
                  aria-label={`Mark ${topic.name} as ${
                    topic.isCompleted ? "incomplete" : "complete"
                  }`}
                  className="w-5 h-5 rounded accent-green-400 cursor-pointer focus:ring-2 focus:ring-white/50"
                />
                <span
                  className={`flex-1 text-sm transition-all duration-200 ${
                    topic.isCompleted
                      ? "line-through text-white/50"
                      : "text-white"
                  }`}
                  onClick={() => handleEditStart(topic.id, topic.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleEditStart(topic.id, topic.name);
                    }
                  }}
                  aria-describedby={`topic-${topic.id}-actions`}
                >
                  {topic.name}
                </span>
                <div
                  id={`topic-${topic.id}-actions`}
                  className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    onClick={() => handleEditStart(topic.id, topic.name)}
                    className="p-1 text-yellow-300 hover:bg-white/20 rounded text-xs"
                    aria-label={`Edit ${topic.name}`}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="p-1 text-red-300 hover:bg-white/20 rounded text-xs"
                    aria-label={`Delete ${topic.name}`}
                  >
                    ✕
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopicChecklist;
