import { useState, useEffect } from 'react';
import {
  X, Heart, MessageSquare, Eye, Github, ExternalLink, Tag,
  ArrowLeft, Send, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProjectDetailViewProps {
  projectId: string;
  onClose: () => void;
}

interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  project_type: string;
  content: string;
  tags: string[];
  github_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  likes_count: number;
  views_count: number;
  comments_count: number;
  created_at: string;
  user_profiles?: {
    username: string;
    fluency_level: number;
  };
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles?: {
    username: string;
  };
}

export default function ProjectDetailView({ projectId, onClose }: ProjectDetailViewProps) {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadProject();
    loadComments();
    checkIfLiked();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);

    const { data: projectData, error } = await supabase
      .from('project_shares')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error loading project:', error);
      setLoading(false);
      return;
    }

    if (projectData) {
      const incrementedViews = (projectData.views_count ?? 0) + 1;
      const { error: viewError } = await supabase
        .from('project_shares')
        .update({ views_count: incrementedViews })
        .eq('id', projectId);

      if (!viewError) {
        projectData.views_count = incrementedViews;
      } else {
        console.error('Error incrementing view count:', viewError);
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username, fluency_level')
        .eq('user_id', projectData.user_id)
        .single();

      setProject({
        ...projectData,
        user_profiles: profile || { username: 'Unknown', fluency_level: 1 }
      });
    }

    setLoading(false);
  };

  const loadComments = async () => {
    const { data: commentsData, error } = await supabase
      .from('project_comments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    if (commentsData && commentsData.length > 0) {
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, username')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const enrichedComments = commentsData.map(comment => ({
        ...comment,
        user_profiles: profileMap.get(comment.user_id) || { username: 'Unknown' }
      }));

      setComments(enrichedComments as any);
    }
  };

  const checkIfLiked = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('project_likes')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();

    setHasLiked(!!data);
  };

  const handleLike = async () => {
    if (!user) return;

    if (hasLiked) {
      await supabase
        .from('project_likes')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      setHasLiked(false);
      if (project) {
        setProject({ ...project, likes_count: project.likes_count - 1 });
      }
    } else {
      const { error } = await supabase
        .from('project_likes')
        .insert({ project_id: projectId, user_id: user.id });

      if (!error) {
        setHasLiked(true);
        if (project) {
          setProject({ ...project, likes_count: project.likes_count + 1 });
        }
      }
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !newComment.trim()) return;

    setSubmittingComment(true);

    const { error } = await supabase
      .from('project_comments')
      .insert({
        project_id: projectId,
        user_id: user.id,
        content: newComment.trim()
      });

    if (error) {
      console.error('Error posting comment:', error);
    } else {
      setNewComment('');
      await loadComments();
      if (project) {
        setProject({ ...project, comments_count: project.comments_count + 1 });
      }
    }

    setSubmittingComment(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || !project) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white border border-black shadow-[8px_8px_0px_#000000] p-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
          <p className="mt-4 font-semibold">LOADING PROJECT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-black shadow-[8px_8px_0px_#000000] max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b-2 border-black p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F4F4F4] rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <div className="text-xs font-semibold px-2 py-1 border border-black bg-[#F4F4F4]">
              {project.project_type.toUpperCase().replace('_', ' ')}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F4F4F4] rounded transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h1 className="font-extrabold text-3xl md:text-4xl uppercase tracking-tight mb-3">
              {project.title}
            </h1>
            {project.user_profiles && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" strokeWidth={2} />
                  <span className="font-semibold">
                    {project.user_profiles.username.toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-600">•</span>
                <span className="font-semibold text-gray-600">
                  LEVEL {project.user_profiles.fluency_level}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{formatDate(project.created_at)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                hasLiked
                  ? 'text-red-500'
                  : 'hover:text-[#FF6A00]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart
                className="w-5 h-5"
                strokeWidth={2}
                fill={hasLiked ? 'currentColor' : 'none'}
              />
              {project.likes_count} LIKES
            </button>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <MessageSquare className="w-5 h-5" strokeWidth={2} />
              {project.comments_count} COMMENTS
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <Eye className="w-5 h-5" strokeWidth={2} />
              {project.views_count} VIEWS
            </div>
          </div>

          {(project.github_url || project.demo_url) && (
            <div className="flex gap-3">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white border border-black px-4 py-2 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
                >
                  <Github className="w-4 h-4" strokeWidth={2} />
                  VIEW CODE
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0A74FF] text-white border border-black px-4 py-2 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={2} />
                  VIEW DEMO
                </a>
              )}
            </div>
          )}

          <div className="border-t-2 border-black pt-6">
            <h2 className="font-extrabold text-lg uppercase tracking-tight mb-4">
              ABOUT THIS PROJECT
            </h2>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {project.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4" strokeWidth={2} />
                <h3 className="font-extrabold text-sm uppercase tracking-tight">TAGS</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-3 py-1 bg-[#E3F2FD] border border-black"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t-2 border-black pt-6">
            <h2 className="font-extrabold text-lg uppercase tracking-tight mb-4">
              COMMENTS ({project.comments_count})
            </h2>

            {user && (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    className="bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </form>
            )}

            {!user && (
              <div className="bg-[#F4F4F4] border border-black p-4 text-center mb-6">
                <p className="text-sm font-semibold">
                  Sign in to leave a comment
                </p>
              </div>
            )}

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="bg-[#F4F4F4] border border-black p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" strokeWidth={2} />
                  <p className="text-sm font-semibold text-gray-600">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-[#F4F4F4] border border-black p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" strokeWidth={2} />
                      <span className="font-extrabold text-sm uppercase">
                        {comment.user_profiles?.username || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-600">
                        • {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
