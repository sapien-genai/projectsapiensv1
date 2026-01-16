import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { logError, getErrorMessage } from '../utils/errorHandling';

interface EnhancedProjectShareFormProps {
  onClose: () => void;
  onSuccess: () => void;
  existingProject?: {
    id: string;
    title: string;
    description: string;
    content: string;
    problem_statement?: string;
    ai_approach?: string;
    tools_models?: string;
    outcome?: string;
    skill_level?: string;
    domain?: string;
    open_to_feedback?: boolean;
    looking_for_collaborators?: boolean;
    tags?: string[];
    github_url?: string;
    demo_url?: string;
  };
}

const AI_DOMAINS = [
  'Content Generation',
  'Data Analysis',
  'Process Automation',
  'Research & Learning',
  'Creative Tools',
  'Productivity',
  'Communication',
  'Other',
];

export default function EnhancedProjectShareForm({
  onClose,
  onSuccess,
  existingProject,
}: EnhancedProjectShareFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: existingProject?.title || '',
    description: existingProject?.description || '',
    problem_statement: existingProject?.problem_statement || '',
    ai_approach: existingProject?.ai_approach || '',
    tools_models: existingProject?.tools_models || '',
    outcome: existingProject?.outcome || '',
    skill_level: existingProject?.skill_level || 'beginner',
    domain: existingProject?.domain || '',
    open_to_feedback: existingProject?.open_to_feedback || false,
    looking_for_collaborators: existingProject?.looking_for_collaborators || false,
    tags: existingProject?.tags?.join(', ') || '',
    github_url: existingProject?.github_url || '',
    demo_url: existingProject?.demo_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.problem_statement || !formData.ai_approach || !formData.tools_models || !formData.outcome) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const projectData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        content: formData.outcome,
        problem_statement: formData.problem_statement,
        ai_approach: formData.ai_approach,
        tools_models: formData.tools_models,
        outcome: formData.outcome,
        skill_level: formData.skill_level,
        domain: formData.domain,
        open_to_feedback: formData.open_to_feedback,
        looking_for_collaborators: formData.looking_for_collaborators,
        tags: tagsArray,
        github_url: formData.github_url || null,
        demo_url: formData.demo_url || null,
        project_type: 'showcase',
        is_public: true,
        status: 'pending',
      };

      if (existingProject) {
        const { error: updateError } = await supabase
          .from('project_shares')
          .update(projectData)
          .eq('id', existingProject.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('project_shares')
          .insert(projectData);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      logError(err, 'EnhancedProjectShareForm - handleSubmit');
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#F8F5F2] border-4 border-black shadow-[12px_12px_0px_#000000] max-w-3xl w-full my-8">
        <div className="bg-white border-b-4 border-black p-6 flex justify-between items-center">
          <h2 className="font-extrabold text-2xl uppercase tracking-tight">
            {existingProject ? 'Edit' : 'Share'} Project
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#E9E5E0] border-2 border-black transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border-2 border-red-500 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block font-bold uppercase tracking-tight text-sm mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
              required
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-tight text-sm mb-2">
              Short Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
              placeholder="One-line summary of your project"
              required
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-tight text-sm mb-2">
              Problem Statement *
            </label>
            <textarea
              value={formData.problem_statement}
              onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261] min-h-[100px]"
              placeholder="What problem were you trying to solve?"
              required
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-tight text-sm mb-2">
              AI Approach *
            </label>
            <textarea
              value={formData.ai_approach}
              onChange={(e) => setFormData({ ...formData, ai_approach: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261] min-h-[100px]"
              placeholder="How did you use AI to address this problem?"
              required
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-tight text-sm mb-2">
              Tools & Models *
            </label>
            <input
              type="text"
              value={formData.tools_models}
              onChange={(e) => setFormData({ ...formData, tools_models: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
              placeholder="e.g., ChatGPT, Claude, Midjourney, Python, etc."
              required
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-tight text-sm mb-2">
              Outcome / Result *
            </label>
            <textarea
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261] min-h-[120px]"
              placeholder="What was the result? What did you learn?"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-tight text-sm mb-2">
                Skill Level *
              </label>
              <select
                value={formData.skill_level}
                onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261] bg-white"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-tight text-sm mb-2">
                Domain
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261] bg-white"
              >
                <option value="">Select domain</option>
                {AI_DOMAINS.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-tight text-sm mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
              placeholder="automation, productivity, research"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-tight text-sm mb-2">
                GitHub URL
              </label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-tight text-sm mb-2">
                Demo URL
              </label>
              <input
                type="url"
                value={formData.demo_url}
                onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="bg-[#E9E5E0] border-2 border-black p-4 space-y-3">
            <p className="font-bold uppercase tracking-tight text-sm">Optional Settings</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.open_to_feedback}
                onChange={(e) => setFormData({ ...formData, open_to_feedback: e.target.checked })}
                className="w-5 h-5 border-2 border-black"
              />
              <span className="text-sm">Open to feedback</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.looking_for_collaborators}
                onChange={(e) =>
                  setFormData({ ...formData, looking_for_collaborators: e.target.checked })
                }
                className="w-5 h-5 border-2 border-black"
              />
              <span className="text-sm">Looking for collaborators</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#F4A261] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Save className="w-5 h-5" strokeWidth={2.5} />
              {loading ? 'Saving...' : existingProject ? 'Update' : 'Share'} Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
