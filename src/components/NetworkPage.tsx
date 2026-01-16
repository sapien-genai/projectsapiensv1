import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Users, Share2, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useDebounce } from '../hooks/useDebounce';
import { logError, getErrorMessage } from '../utils/errorHandling';
import NetworkUnlockTeaser from './NetworkUnlockTeaser';
import EnhancedProjectShareForm from './EnhancedProjectShareForm';
import MentorshipPanel from './MentorshipPanel';
import ProjectDetailView from './ProjectDetailView';

interface NetworkPageProps {
  onBack?: () => void;
}

interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  problem_statement?: string;
  ai_approach?: string;
  tools_models?: string;
  outcome?: string;
  skill_level?: string;
  domain?: string;
  open_to_feedback?: boolean;
  looking_for_collaborators?: boolean;
  tags?: string[];
  created_at: string;
  user_profiles: {
    username: string;
    fluency_level: number;
  };
}

type Tab = 'projects' | 'mentorship' | 'profiles';

const AI_DOMAINS = [
  'All',
  'Content Generation',
  'Data Analysis',
  'Process Automation',
  'Research & Learning',
  'Creative Tools',
  'Productivity',
  'Communication',
  'Other',
];

const SKILL_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function NetworkPage({ onBack }: NetworkPageProps) {
  const { user } = useAuth();
  const [networkUnlocked, setNetworkUnlocked] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState({
    paths: 0,
    labs: 0,
    projects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showShareForm, setShowShareForm] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (user) {
      checkNetworkAccess();
    }
  }, [user]);

  useEffect(() => {
    if (networkUnlocked) {
      loadProjects();
    }
  }, [networkUnlocked]);

  useEffect(() => {
    applyFilters();
  }, [projects, debouncedSearch, domainFilter, skillFilter]);

  const checkNetworkAccess = async () => {
    if (!user) return;

    try {
      const unlocked = await supabase.rpc('check_network_unlock', {
        p_user_id: user.id,
      });

      const { data: accessData } = await supabase
        .from('user_network_access')
        .select('unlocked, paths_completed, labs_completed, approved_projects')
        .eq('user_id', user.id)
        .maybeSingle();

      if (accessData) {
        setNetworkUnlocked(accessData.unlocked);
        setUnlockProgress({
          paths: accessData.paths_completed || 0,
          labs: accessData.labs_completed || 0,
          projects: accessData.approved_projects || 0,
        });
      }

      setLoading(false);
    } catch (err) {
      logError(err, 'NetworkPage - checkNetworkAccess');
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      setError(null);

      const { data: projectsData, error: projectsError } = await supabase
        .from('project_shares')
        .select('*')
        .eq('is_public', true)
        .in('status', ['approved', 'pending'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (projectsError) throw projectsError;

      if (projectsData && projectsData.length > 0) {
        const userIds = [...new Set(projectsData.map(p => p.user_id))];

        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('user_id, username, fluency_level')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        const profilesMap = new Map(
          (profilesData || []).map(p => [p.user_id, p])
        );

        const enrichedProjects = projectsData.map(project => ({
          ...project,
          user_profiles: profilesMap.get(project.user_id) || {
            username: 'Unknown',
            fluency_level: 1,
          },
        }));

        setProjects(enrichedProjects as any);
      } else {
        setProjects([]);
      }
    } catch (err) {
      logError(err, 'NetworkPage - loadProjects');
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (domainFilter !== 'All') {
      filtered = filtered.filter((p) => p.domain === domainFilter);
    }

    if (skillFilter !== 'All') {
      filtered = filtered.filter((p) => p.skill_level === skillFilter.toLowerCase());
    }

    setFilteredProjects(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-black border-t-[#F4A261] animate-spin"></div>
          <p className="mt-4 font-semibold">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!networkUnlocked) {
    return (
      <NetworkUnlockTeaser
        pathsCompleted={unlockProgress.paths}
        labsCompleted={unlockProgress.labs}
        approvedProjects={unlockProgress.projects}
      />
    );
  }

  if (selectedProject) {
    return (
      <ProjectDetailView
        projectId={selectedProject.id}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <nav className="bg-white border-b-4 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-[#E9E5E0] border-2 border-black transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                </button>
              )}
              <div>
                <h1 className="font-extrabold text-2xl uppercase tracking-tight">
                  Project Network
                </h1>
                <p className="text-sm text-gray-600">Intentional discovery. No algorithms.</p>
              </div>
            </div>
            <button
              onClick={() => setShowShareForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#F4A261] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight"
            >
              <Share2 className="w-5 h-5" strokeWidth={2.5} />
              Share Project
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-3 mb-8 border-b-2 border-black pb-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 border-2 border-black font-bold uppercase tracking-tight transition-all ${
              activeTab === 'projects'
                ? 'bg-[#F4A261] shadow-[4px_4px_0px_#000000]'
                : 'bg-white hover:bg-[#E9E5E0]'
            }`}
          >
            <Share2 className="w-5 h-5 inline mr-2" strokeWidth={2.5} />
            Projects
          </button>
          <button
            onClick={() => setActiveTab('mentorship')}
            className={`px-6 py-3 border-2 border-black font-bold uppercase tracking-tight transition-all ${
              activeTab === 'mentorship'
                ? 'bg-[#F4A261] shadow-[4px_4px_0px_#000000]'
                : 'bg-white hover:bg-[#E9E5E0]'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" strokeWidth={2.5} />
            Mentorship
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border-2 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {activeTab === 'projects' && (
          <>
            <div className="mb-6 bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    strokeWidth={2.5}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects by title, description, or tags..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" strokeWidth={2.5} />
                  Filters
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t-2 border-black grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-tight text-sm mb-2">
                      Domain
                    </label>
                    <select
                      value={domainFilter}
                      onChange={(e) => setDomainFilter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261] bg-white"
                    >
                      {AI_DOMAINS.map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-tight text-sm mb-2">
                      Skill Level
                    </label>
                    <select
                      value={skillFilter}
                      onChange={(e) => setSkillFilter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261] bg-white"
                    >
                      {SKILL_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-extrabold text-lg uppercase tracking-tight flex-1">
                      {project.title}
                    </h3>
                    {project.skill_level && (
                      <span className="text-xs bg-[#E9E5E0] border border-black px-2 py-1 ml-2">
                        {project.skill_level}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{project.description}</p>
                  {project.domain && (
                    <p className="text-xs font-bold mb-2 text-gray-600">{project.domain}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t-2 border-black">
                    <p className="text-sm font-bold">{project.user_profiles?.username}</p>
                    <div className="flex gap-2">
                      {project.open_to_feedback && (
                        <span className="text-xs bg-[#98C9A3] border border-black px-2 py-1">
                          Feedback
                        </span>
                      )}
                      {project.looking_for_collaborators && (
                        <span className="text-xs bg-[#F4A261] border border-black px-2 py-1">
                          Collab
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" strokeWidth={2} />
                <p className="text-lg font-bold text-gray-600">No projects found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'mentorship' && <MentorshipPanel />}
      </div>

      {showShareForm && (
        <EnhancedProjectShareForm
          onClose={() => setShowShareForm(false)}
          onSuccess={() => {
            setShowShareForm(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
