import React, { useState } from 'react';
import { Project } from '../types';
import { Folder, X } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [color, setColor] = useState('#C96442');

  if (!isOpen) return null;

  const colorOptions = ['#C96442', '#7A9A76', '#4A7C9D', '#8C68A6', '#D9822B'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name: name.trim(),
      description: description.trim(),
      customInstructions: customInstructions.trim(),
      color,
    });
    setName('');
    setDescription('');
    setCustomInstructions('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-[var(--text-primary)]"
        role="dialog"
      >
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-sidebar)]">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-sm font-semibold">Create New Project Folder</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Consensus Research"
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)]"
              autoFocus
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. B.Tech Semester 4 Final Review Project"
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Folder Color
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-[var(--accent)] scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Project Custom Instructions (Optional)
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Instructions specifically applied to conversations in this folder..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
