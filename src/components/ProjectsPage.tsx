import { useState, useEffect } from 'react';
import {
  Rocket, Plus, Search, Filter, Heart, MessageSquare,
  Eye, Github, ExternalLink, ArrowLeft, Edit, Trash2, Tag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useDebounce } from '../hooks/useDebounce';
import ProjectForm from './ProjectForm';
import ProjectDetailView from './ProjectDetailView';

interface ProjectsPageProps {
  onBack?: () => void;
}

interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  project_type: string;
  status: string;
  tags: string[];
  github_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  is_public: boolean;
  likes_count: number;
  views_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  user_profiles?: {
    username: string;
    fluency_level: number;
  };
}

type Tab = 'all' | 'my-projects' | 'drafts';
type FilterType = 'all' | 'personal' | 'course' | 'challenge';

export default function ProjectsPage({ onBack }: ProjectsPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'all') {
      loadAllProjects();
    } else if (activeTab === 'my-projects') {
      loadMyProjects();
    } else if (activeTab === 'drafts') {
      loadDrafts();
    }
  }, [activeTab, filter, user]);

  const loadAllProjects = async () => {
    setLoading(true);

    let query = supabase
      .from('project_shares')
      .select(`
        *,
        user_profiles!inner(user_id, username, fluency_level)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('project_type', filter);
    }

    const { data: projectsData, error } = await query;

    if (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
      setLoading(false);
      return;
    }

    setProjects(projectsData || []);
    setLoading(false);
  };

  const loadMyProjects = async () => {
    if (!user) return;

    setLoading(true);

    let query = supabase
      .from('project_shares')
      .select(`
        *,
        user_profiles!inner(user_id, username, fluency_level)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('project_type', filter);
    }

    const { data: projectsData } = await query;

    setProjects(projectsData || []);
    setLoading(false);
  };

  const loadDrafts = async () => {
    if (!user) return;

    setLoading(true);

    const { data: projectsData } = await supabase
      .from('project_shares')
      .select(`
        *,
        user_profiles!inner(user_id, username, fluency_level)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false});

    setProjects(projectsData || []);
    setLoading(false);
  };

  const handleLikeProject = async (projectId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('project_likes')
      .insert({ project_id: projectId, user_id: user.id });

    if (!error) {
      if (activeTab === 'all') {
        loadAllProjects();
      } else if (activeTab === 'my-projects') {
        loadMyProjects();
      }
    }
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  );

  return (
    <>
      {showCreateForm && (
        <ProjectForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            if (activeTab === 'all') {
              loadAllProjects();
            } else if (activeTab === 'my-projects') {
              loadMyProjects();
            } else if (activeTab === 'drafts') {
              loadDrafts();
            }
          }}
        />
      )}

      {selectedProjectId && (
        <ProjectDetailView
          projectId={selectedProjectId}
          onClose={() => {
            setSelectedProjectId(null);
            if (activeTab === 'all') {
              loadAllProjects();
            } else if (activeTab === 'my-projects') {
              loadMyProjects();
            } else if (activeTab === 'drafts') {
              loadDrafts();
            }
          }}
        />
      )}

      <div className="min-h-screen bg-[#F4F4F4]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-6 text-sm font-extrabold uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              BACK TO DASHBOARD
            </button>
          )}
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-8 h-8" strokeWidth={2} />
            <div className="text-xs font-semibold px-3 py-1 border border-black bg-white">
              BUILD & SHARE
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter leading-none mb-4">
                PROJECTS
              </h1>
              <p className="text-base md:text-lg leading-relaxed max-w-3xl">
                Build AI-powered projects, showcase your work, and learn from the community.
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  NEW PROJECT
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-extrabold text-sm uppercase tracking-tight border border-black shadow-[2px_2px_0px_#000000] transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#FF6A00] text-black'
                : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" strokeWidth={2} />
              ALL PROJECTS
            </div>
          </button>
          {user && (
            <>
              <button
                onClick={() => setActiveTab('my-projects')}
                className={`px-6 py-3 font-extrabold text-sm uppercase tracking-tight border border-black shadow-[2px_2px_0px_#000000] transition-all whitespace-nowrap ${
                  activeTab === 'my-projects'
                    ? 'bg-[#FF6A00] text-black'
                    : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]'
                }`}
              >
                MY PROJECTS
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`px-6 py-3 font-extrabold text-sm uppercase tracking-tight border border-black shadow-[2px_2px_0px_#000000] transition-all whitespace-nowrap ${
                  activeTab === 'drafts'
                    ? 'bg-[#FF6A00] text-black'
                    : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]'
                }`}
              >
                DRAFTS
              </button>
            </>
          )}
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search projects, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5" strokeWidth={2} />
            <span className="text-xs font-semibold uppercase">FILTER:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-semibold text-xs uppercase border border-black transition-all ${
                filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-[#F4F4F4]'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilter('personal')}
              className={`px-4 py-2 font-semibold text-xs uppercase border border-black transition-all ${
                filter === 'personal'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-[#F4F4F4]'
              }`}
            >
              PERSONAL
            </button>
            <button
              onClick={() => setFilter('course')}
              className={`px-4 py-2 font-semibold text-xs uppercase border border-black transition-all ${
                filter === 'course'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-[#F4F4F4]'
              }`}
            >
              COURSE
            </button>
            <button
              onClick={() => setFilter('challenge')}
              className={`px-4 py-2 font-semibold text-xs uppercase border border-black transition-all ${
                filter === 'challenge'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-[#F4F4F4]'
              }`}
            >
              CHALLENGE
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
            <p className="mt-4 font-semibold">LOADING PROJECTS...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white border border-black p-12 text-center shadow-[3px_3px_0px_#000000]">
            <Rocket className="w-16 h-16 mx-auto mb-4" strokeWidth={2} />
            <h3 className="font-extrabold text-xl uppercase tracking-tight mb-2">
              NO PROJECTS YET
            </h3>
            <p className="text-sm mb-6">
              {activeTab === 'my-projects' || activeTab === 'drafts'
                ? "You haven't created any projects yet. Start building your first AI project!"
                : "Be the first to share your AI project with the community!"}
            </p>
            {user && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                CREATE YOUR FIRST PROJECT
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="bg-white border border-black p-6 shadow-[3px_3px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] transition-shadow flex flex-col cursor-pointer"
              >
                {project.image_url && (
                  <div className="w-full h-40 bg-[#F4F4F4] border border-black mb-4 flex items-center justify-center">
                    <Rocket className="w-12 h-12 text-[#FF6A00]" strokeWidth={2} />
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="text-xs font-semibold px-2 py-1 border border-black bg-[#F4F4F4]">
                    {project.project_type.toUpperCase().replace('_', ' ')}
                  </div>
                  {project.user_profiles && (
                    <div className="text-xs font-semibold text-gray-600">
                      LEVEL {project.user_profiles.fluency_level}
                    </div>
                  )}
                </div>

                <h3 className="font-extrabold text-lg uppercase tracking-tight mb-2">
                  {project.title}
                </h3>

                {project.user_profiles && (
                  <p className="text-xs font-semibold text-gray-600 mb-3">
                    BY {project.user_profiles.username.toUpperCase()}
                  </p>
                )}

                <p className="text-sm leading-relaxed mb-4 flex-1">
                  {project.description}
                </p>

                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2 py-1 bg-[#E3F2FD] border border-black"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold hover:text-[#FF6A00] transition-colors"
                    >
                      <Github className="w-4 h-4" strokeWidth={2} />
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold hover:text-[#FF6A00] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" strokeWidth={2} />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeProject(project.id)}
                      className="flex items-center gap-1 text-xs font-semibold hover:text-[#FF6A00] transition-colors"
                    >
                      <Heart className="w-4 h-4" strokeWidth={2} />
                      {project.likes_count}
                    </button>
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      <MessageSquare className="w-4 h-4" strokeWidth={2} />
                      {project.comments_count}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      <Eye className="w-4 h-4" strokeWidth={2} />
                      {project.views_count}
                    </div>
                  </div>

                  {user && project.user_id === user.id && (
                    <button className="p-2 hover:bg-[#F4F4F4] rounded transition-colors">
                      <Edit className="w-4 h-4" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
