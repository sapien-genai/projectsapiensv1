import { useState, useEffect } from 'react';
import { Search, Filter, Star, Heart, Copy, Plus, ArrowLeft, BookmarkPlus, Share2, TrendingUp, Clock, PenTool, BarChart3, Sparkles, Code, Target, GraduationCap, Download, Zap, Video as LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useDebounce } from '../hooks/useDebounce';
import { seedPromptLibrary } from '../utils/seedPromptLibrary';
import { updatePromptLibrary } from '../utils/updatePromptLibrary';
import FullscreenLabOverlay from './FullscreenLabOverlay';
import PromptTester from './PromptTester';
import OpenMoji from './OpenMoji';

interface PromptLibraryProps {
  onBack?: () => void;
}

interface Prompt {
  id: string;
  user_id: string;
  title: string;
  description: string;
  prompt_text: string;
  category_id: string | null;
  tags: string[];
  use_case: string;
  example_output: string | null;
  is_public: boolean;
  is_featured: boolean;
  likes_count: number;
  usage_count: number;
  avg_rating: number;
  rating_count: number;
  created_at: string;
  user_profiles: {
    username: string;
  };
  prompt_categories: {
    name: string;
    slug: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  prompt_count: number;
  is_public: boolean;
}

type Tab = 'discover' | 'my-prompts' | 'collections' | 'create';
type SortBy = 'recent' | 'popular' | 'rated';

const categoryIcons: Record<string, LucideIcon> = {
  PenTool,
  BarChart3,
  Sparkles,
  Code,
  Target,
  GraduationCap
};

export default function PromptLibrary({ onBack }: PromptLibraryProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showLabOverlay, setShowLabOverlay] = useState(false);
  const [testPrompt, setTestPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'discover') {
      loadPrompts();
    } else if (activeTab === 'my-prompts') {
      loadMyPrompts();
    } else if (activeTab === 'collections') {
      loadCollections();
    }
  }, [activeTab, selectedCategory, sortBy, user]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('prompt_categories')
      .select('*')
      .order('name');

    if (data) {
      setCategories(data);
    }
  };

  const loadPrompts = async () => {
    setLoading(true);
    let query = supabase
      .from('prompts')
      .select(`
        *,
        prompt_categories(name, slug),
        user_profiles!inner(user_id, username)
      `)
      .eq('is_public', true);

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('likes_count', { ascending: false });
    } else if (sortBy === 'rated') {
      query = query.order('avg_rating', { ascending: false });
    }

    const { data: promptsData } = await query.limit(50);

    setPrompts(promptsData || []);
    setLoading(false);
  };

  const loadMyPrompts = async () => {
    if (!user) return;

    setLoading(true);
    const { data: promptsData } = await supabase
      .from('prompts')
      .select(`
        *,
        prompt_categories(name, slug),
        user_profiles!inner(user_id, username)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setPrompts(promptsData || []);
    setLoading(false);
  };

  const loadCollections = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('prompt_collections')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) {
      setCollections(data);
    }
    setLoading(false);
  };

  const handleLikePrompt = async (promptId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('prompt_likes')
      .insert({ prompt_id: promptId, user_id: user.id });

    if (!error) {
      loadPrompts();
    }
  };

  const handleCopyPrompt = async (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.prompt_text);

    if (user) {
      await supabase
        .from('prompt_usage_history')
        .insert({ prompt_id: prompt.id, user_id: user.id });

      await supabase
        .from('prompts')
        .update({ usage_count: prompt.usage_count + 1 })
        .eq('id', prompt.id);
    }
  };

  const handleSeedLibrary = async () => {
    if (!user || seeding) return;

    setSeeding(true);
    const result = await seedPromptLibrary(user.id);
    setSeeding(false);

    if (result.success) {
      loadPrompts();
    } else {
      console.error('Failed to seed library:', result.error);
    }
  };

  const handleUpdateLibrary = async () => {
    if (!user || updating) return;

    setUpdating(true);

    const result = await updatePromptLibrary(user.id);

    setUpdating(false);

    if (result.success) {
      await loadPrompts();
      alert(`Success! ${result.message}\n\nRefresh the page and test the "Email Enhancement Wizard" prompt.`);
    } else {
      console.error('Failed to update library:', result.error);
      alert(`Update failed: ${result.error}\n\nCheck the browser console for details.`);
    }
  };

  const handleTestPrompt = (prompt: Prompt) => {
    setTestPrompt(prompt);
    setShowLabOverlay(true);
  };

  const filteredPrompts = prompts.filter(p =>
    p.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  );

  return (
    <>
      <FullscreenLabOverlay
        isOpen={showLabOverlay}
        onClose={() => {
          setShowLabOverlay(false);
          setTestPrompt(null);
        }}
        title="Prompt Tester"
        subtitle="Test and refine your prompts"
      >
        {testPrompt && <PromptTester initialPrompt={testPrompt.prompt_text} />}
      </FullscreenLabOverlay>

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
            <BookmarkPlus className="w-8 h-8" strokeWidth={2} />
            <div className="text-xs font-semibold px-3 py-1 border border-black bg-white">
              RESOURCES
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter leading-none mb-4">
                TEMPLATES
              </h1>
              <p className="text-base md:text-lg leading-relaxed max-w-3xl">
                Start with a proven approach. Browse the full library of workflow templates built by the community and adapt them to your work.
              </p>
            </div>
            <div className="flex gap-3">
              {prompts.length === 0 && !loading && (
                <button
                  onClick={handleSeedLibrary}
                  disabled={seeding}
                  className="bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" strokeWidth={2} />
                    {seeding ? 'LOADING...' : 'LOAD STARTER PROMPTS'}
                  </div>
                </button>
              )}
              {prompts.length > 0 && !loading && (
                <button
                  onClick={handleUpdateLibrary}
                  disabled={updating}
                  className="bg-[#FF6A00] text-black border-2 border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" strokeWidth={2} />
                    {updating ? 'UPDATING...' : 'UPDATE PROMPTS'}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 font-extrabold text-sm uppercase tracking-tight border border-black shadow-[2px_2px_0px_#000000] transition-all ${
              activeTab === 'discover'
                ? 'bg-[#FF6A00] text-black'
                : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" strokeWidth={2} />
              DISCOVER
            </div>
          </button>
          <button
            onClick={() => setActiveTab('my-prompts')}
            className={`px-6 py-3 font-extrabold text-sm uppercase tracking-tight border border-black shadow-[2px_2px_0px_#000000] transition-all ${
              activeTab === 'my-prompts'
                ? 'bg-[#FF6A00] text-black'
                : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]'
            }`}
          >
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4" strokeWidth={2} />
              MY PROMPTS
            </div>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-6 py-3 font-extrabold text-sm uppercase tracking-tight border border-black shadow-[2px_2px_0px_#000000] transition-all ${
              activeTab === 'collections'
                ? 'bg-[#FF6A00] text-black'
                : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4" strokeWidth={2} />
              COLLECTIONS
            </div>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-extrabold text-sm uppercase tracking-tight border border-black shadow-[2px_2px_0px_#000000] transition-all ${
              activeTab === 'create'
                ? 'bg-[#0A74FF] text-white'
                : 'bg-[#0A74FF] text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" strokeWidth={2} />
              CREATE PROMPT
            </div>
          </button>
        </div>

        {(activeTab === 'discover' || activeTab === 'my-prompts') && (
          <>
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search prompts, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 font-semibold text-xs uppercase border border-black transition-all ${
                    selectedCategory === null
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-[#F4F4F4]'
                  }`}
                >
                  ALL
                </button>
                {categories.map((category) => {
                  const IconComponent = category.icon ? categoryIcons[category.icon] : null;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 font-semibold text-xs uppercase border border-black transition-all ${
                        selectedCategory === category.id
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-[#F4F4F4]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="w-3 h-3" strokeWidth={2} />}
                        {category.name}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase">SORT BY:</span>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-3 py-1 text-xs font-semibold uppercase border border-black ${
                    sortBy === 'popular' ? 'bg-black text-white' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" strokeWidth={2} />
                    POPULAR
                  </div>
                </button>
                <button
                  onClick={() => setSortBy('rated')}
                  className={`px-3 py-1 text-xs font-semibold uppercase border border-black ${
                    sortBy === 'rated' ? 'bg-black text-white' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" strokeWidth={2} />
                    TOP RATED
                  </div>
                </button>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-3 py-1 text-xs font-semibold uppercase border border-black ${
                    sortBy === 'recent' ? 'bg-black text-white' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={2} />
                    RECENT
                  </div>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
                <p className="mt-4 font-semibold">LOADING PROMPTS...</p>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="bg-white border border-black p-12 text-center shadow-[3px_3px_0px_#000000]">
                <BookmarkPlus className="w-16 h-16 mx-auto mb-4" strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight mb-2">
                  NO PROMPTS FOUND
                </h3>
                <p className="text-sm mb-6">
                  {activeTab === 'my-prompts'
                    ? "You haven't created any prompts yet. Start by creating your first prompt!"
                    : "Try adjusting your filters or search terms."}
                </p>
                {activeTab === 'my-prompts' && (
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    CREATE YOUR FIRST PROMPT
                  </button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="bg-white border border-black p-6 shadow-[3px_3px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {prompt.is_featured && (
                          <div className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 border border-black bg-[#FFD700] mb-2">
                            <OpenMoji emoji="⭐" size={14} />
                            FEATURED
                          </div>
                        )}
                        <h3 className="font-extrabold text-xl uppercase tracking-tight mb-2">
                          {prompt.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {prompt.prompt_categories && (
                            <span className="text-xs font-semibold px-2 py-1 border border-black bg-[#F4F4F4]">
                              {prompt.prompt_categories.name}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-gray-600">
                            BY {prompt.user_profiles.username.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed mb-4">
                      {prompt.description}
                    </p>

                    <div className="bg-[#F4F4F4] border border-black p-3 mb-4 text-xs">
                      <p className="line-clamp-3">{prompt.prompt_text}</p>
                    </div>

                    {prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {prompt.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-semibold px-2 py-1 bg-[#E3F2FD] border border-black"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikePrompt(prompt.id)}
                          className="flex items-center gap-1 text-xs font-semibold hover:text-[#FF6A00] transition-colors"
                        >
                          <Heart className="w-4 h-4" strokeWidth={2} />
                          {prompt.likes_count}
                        </button>
                        <div className="flex items-center gap-1 text-xs font-semibold">
                          <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" strokeWidth={2} />
                          {prompt.avg_rating > 0 ? prompt.avg_rating.toFixed(1) : '—'}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold">
                          <Copy className="w-4 h-4" strokeWidth={2} />
                          {prompt.usage_count}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTestPrompt(prompt)}
                          className="bg-[#FF6A00] text-black border border-black px-4 py-2 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        >
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4" strokeWidth={2} />
                            TEST
                          </div>
                        </button>
                        <button
                          onClick={() => handleCopyPrompt(prompt)}
                          className="bg-[#0A74FF] text-white border border-black px-4 py-2 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        >
                          COPY
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'collections' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
                <p className="mt-4 font-semibold">LOADING COLLECTIONS...</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="bg-white border border-black p-12 text-center shadow-[3px_3px_0px_#000000]">
                <BookmarkPlus className="w-16 h-16 mx-auto mb-4" strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight mb-2">
                  NO COLLECTIONS YET
                </h3>
                <p className="text-sm mb-6">
                  Organize your favorite prompts into collections. Create your first collection to get started!
                </p>
                <button className="bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  CREATE COLLECTION
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="bg-white border border-black p-6 shadow-[3px_3px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] transition-shadow"
                  >
                    <BookmarkPlus className="w-8 h-8 mb-4" strokeWidth={2} />
                    <h3 className="font-extrabold text-lg uppercase tracking-tight mb-2">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm leading-relaxed mb-4">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">
                        {collection.prompt_count} PROMPTS
                      </span>
                      {collection.is_public && (
                        <span className="text-xs font-semibold px-2 py-1 border border-black bg-[#E3F2FD]">
                          PUBLIC
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-black p-8 shadow-[3px_3px_0px_#000000]">
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-6">
                CREATE NEW PROMPT
              </h2>
              <p className="text-sm mb-6">
                Share your best prompts with the community. Help others learn and improve their AI interactions.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-2">
                    TITLE
                  </label>
                  <input
                    type="text"
                    placeholder="Give your prompt a descriptive title..."
                    className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-2">
                    CATEGORY
                  </label>
                  <select className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]">
                    <option>Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-2">
                    DESCRIPTION
                  </label>
                  <textarea
                    placeholder="What does this prompt do? What problem does it solve?"
                    rows={3}
                    className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-2">
                    PROMPT TEXT
                  </label>
                  <textarea
                    placeholder="Enter your complete prompt here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-2">
                    USE CASE
                  </label>
                  <textarea
                    placeholder="When should someone use this prompt?"
                    rows={3}
                    className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-2">
                    TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    placeholder="writing, email, professional, business..."
                    className="w-full px-4 py-3 border border-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 border border-black"
                    />
                    <span className="text-sm font-semibold">
                      SHARE WITH COMMUNITY (make this prompt public)
                    </span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button className="flex-1 bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                    CREATE PROMPT
                  </button>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="flex-1 bg-white text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
