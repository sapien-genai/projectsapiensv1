import { useState } from 'react';
import { X, Rocket, Github, ExternalLink, Tag as TagIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
  projectId?: string;
  initialData?: {
    title: string;
    description: string;
    project_type: string;
    tags: string[];
    github_url: string | null;
    demo_url: string | null;
    is_public: boolean;
  };
}

export default function ProjectForm({ onClose, onSuccess, projectId, initialData }: ProjectFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    project_type: initialData?.project_type || 'personal',
    tags: initialData?.tags?.join(', ') || '',
    github_url: initialData?.github_url || '',
    demo_url: initialData?.demo_url || '',
    is_public: initialData?.is_public || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!projectId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a project');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError('');

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (isEditMode && projectId) {
      // Update existing project
      const { error: updateError } = await supabase
        .from('project_shares')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          project_type: formData.project_type,
          tags: tagsArray,
          github_url: formData.github_url.trim() || null,
          demo_url: formData.demo_url.trim() || null,
          is_public: formData.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating project:', updateError);
        setError('Failed to update project. Please try again.');
        setLoading(false);
        return;
      }
    } else {
      // Create new project
      const { error: insertError } = await supabase
        .from('project_shares')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
        description: formData.description.trim(),
        project_type: formData.project_type,
        tags: tagsArray,
        content: '',
        github_url: formData.github_url.trim() || null,
        demo_url: formData.demo_url.trim() || null,
        is_public: formData.is_public
      });

      if (insertError) {
        console.error('Error creating project:', insertError);
        setError('Failed to create project. Please try again.');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white border border-black shadow-[8px_8px_0px_#000000] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-black p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-6 h-6" strokeWidth={2} />
            <h2 className="font-extrabold text-2xl uppercase tracking-tight">
              {isEditMode ? 'EDIT PROJECT' : 'CREATE PROJECT'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F4F4F4] rounded transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-4 text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase mb-2">
              PROJECT TITLE *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your project a descriptive title..."
              className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-2">
              PROJECT TYPE
            </label>
            <select
              value={formData.project_type}
              onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
              className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            >
              <option value="personal">Personal Project</option>
              <option value="lab_experiment">Lab Experiment</option>
              <option value="capstone">Capstone Project</option>
              <option value="showcase">Showcase</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-2">
              DESCRIPTION *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project, what it does, and what you learned..."
              rows={6}
              className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-2">
              <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4" strokeWidth={2} />
                TAGS (COMMA SEPARATED)
              </div>
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="ai, chatbot, automation, nlp..."
              className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-2">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4" strokeWidth={2} />
                GITHUB URL (OPTIONAL)
              </div>
            </label>
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/username/repo"
              className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-2">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
                DEMO URL (OPTIONAL)
              </div>
            </label>
            <input
              type="url"
              value={formData.demo_url}
              onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
              placeholder="https://your-project-demo.com"
              className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="w-5 h-5 border border-black"
              />
              <span className="text-sm font-semibold">
                SHARE WITH COMMUNITY (make this project public)
              </span>
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t-2 border-black">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isEditMode ? 'UPDATING...' : 'CREATING...') : (isEditMode ? 'UPDATE PROJECT' : 'CREATE PROJECT')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
