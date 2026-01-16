import { useState, useEffect, useRef } from 'react';
import { Send, Menu, X, Sparkles, Clock, ChevronDown, Copy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import OpenMoji from './OpenMoji';

interface LabSandboxProps {
  labId: string;
  onBack?: () => void;
  onLabSwitch?: (labId: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Experiment {
  id: string;
  prompt: string;
  output: string;
  created_at: string;
}

const labConfigs: Record<string, {
  name: string;
  description: string;
  placeholder: string;
  systemMessage: string;
  suggestions: string[];
}> = {
  'writing-lab': {
    name: 'Writing Lab',
    description: 'Generate, edit, and refine written content',
    placeholder: 'Write a compelling product description for...',
    systemMessage: 'I can help you write, edit, and refine any type of content. Try asking me to draft emails, create marketing copy, write articles, or improve existing text.',
    suggestions: [
      'Write a professional email to a client about a project delay',
      'Create a compelling product description for a minimalist desk lamp',
      'Draft a social media post announcing a new feature',
      'Rewrite this paragraph to be more concise and engaging',
    ],
  },
  'analysis-lab': {
    name: 'Analysis Lab',
    description: 'Extract insights and analyze data',
    placeholder: 'Analyze this data and identify trends...',
    systemMessage: 'I can analyze data, identify patterns, and provide insights. Share your data, ask questions about trends, or request detailed analysis.',
    suggestions: [
      'Analyze quarterly sales data and identify key trends',
      'Compare these two datasets and highlight the main differences',
      'Extract insights from customer feedback responses',
      'Identify patterns in this user behavior data',
    ],
  },
  'creative-lab': {
    name: 'Creative Lab',
    description: 'Explore creative ideas and concepts',
    placeholder: 'Generate 3 brand concepts for...',
    systemMessage: 'I can help you brainstorm creative ideas, develop concepts, and explore possibilities. Let\'s create something unique together.',
    suggestions: [
      'Generate 5 unique brand names for a sustainable coffee company',
      'Brainstorm creative marketing campaign ideas for Gen Z',
      'Create three logo concepts for a fitness app',
      'Develop a content series theme for our social media',
    ],
  },
  'strategy-lab': {
    name: 'Strategy Lab',
    description: 'Build strategic frameworks and solve problems',
    placeholder: 'Create a decision framework for...',
    systemMessage: 'I can help you think strategically, build frameworks, and solve complex problems. Share your challenge and I\'ll help you work through it.',
    suggestions: [
      'Create a decision framework for hiring my first developer',
      'Build a go-to-market strategy for a B2B SaaS product',
      'Design a prioritization system for feature requests',
      'Develop a competitive analysis framework',
    ],
  },
  'code-lab': {
    name: 'Code Lab',
    description: 'Write, debug, and optimize code',
    placeholder: 'Write a function that...',
    systemMessage: 'I can help you write code, debug issues, optimize performance, and explain technical concepts. What are you building?',
    suggestions: [
      'Write a Python function to find the longest palindrome in a string',
      'Debug this React component that re-renders too often',
      'Optimize this SQL query for better performance',
      'Explain how async/await works in JavaScript',
    ],
  },
};

const labs = [
  { id: 'writing-lab', name: 'Writing Lab', icon: '✍️' },
  { id: 'analysis-lab', name: 'Analysis Lab', icon: '📊' },
  { id: 'creative-lab', name: 'Creative Lab', icon: '🎨' },
  { id: 'strategy-lab', name: 'Strategy Lab', icon: '💡' },
  { id: 'code-lab', name: 'Code Lab', icon: '💻' },
];

export default function LabSandbox({ labId, onBack, onLabSwitch }: LabSandboxProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<Experiment[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const config = labConfigs[labId] || labConfigs['writing-lab'];

  useEffect(() => {
    // Initialize with system message
    setMessages([{
      role: 'assistant',
      content: config.systemMessage,
      timestamp: new Date()
    }]);
    loadHistory();
  }, [labId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const loadHistory = async () => {
    if (!user) return;

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const { data, error } = await supabase
        .from('lab_experiments')
        .select('*')
        .eq('user_id', user.id)
        .eq('lab_id', labId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      setHistory(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistoryError('Failed to load history. Please try again.');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const generateResponse = async (userPrompt: string, history: Message[]): Promise<string> => {
    try {
      // Build conversation history for context (exclude system message)
      const conversationHistory = history
        .slice(1) // Skip the initial system message
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Get user's JWT token for authenticated edge function call
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lab-ai-chat`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          labId,
          conversationHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling AI:', error);
      if (error instanceof Error && error.message === 'Authentication required') {
        return "Please sign in to use the AI lab features.";
      }
      return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const generateMockResponse = (userPrompt: string): string => {
    const mockOutputs: Record<string, string> = {
      'writing-lab': `Here's a compelling product description for your desk lamp:

**Introducing the LUMEN Desk Lamp — where form meets function in perfect harmony.**

This minimalist marvel combines precision engineering with timeless design. Its aluminum body houses a powerful LED array that delivers 800 lumens of adjustable light, while the intuitive touch controls let you dial in the perfect brightness with a simple gesture.

The weighted base keeps it stable on any surface, and the flexible arm adjusts to any angle you need. Whether you're deep in a late-night work session or setting the mood for evening reading, LUMEN adapts to your life.

**Key Features:**
• Adjustable brightness (0-800 lumens)
• Touch-sensitive controls
• Flexible aluminum arm
• Energy-efficient LED technology
• Weighted base for stability

Clean lines. Pure function. Zero compromises.`,
      'analysis-lab': `**QUARTERLY SALES ANALYSIS**

**Key Findings:**
• Total Annual Revenue: $275,000
• Average Quarterly Growth: 15.8%
• Strongest Quarter: Q4 ($90k, +50% from Q3)
• Weakest Quarter: Q1 ($50k, baseline)

**Trend Analysis:**
The data shows strong seasonal patterns with significant Q4 performance. The Q3 dip (-20%) suggests a mid-year slowdown, possibly due to seasonal factors or market conditions. However, the strong recovery in Q4 indicates resilient demand and effective year-end strategies.

**Insights:**
1. Q4 success factors should be documented and replicated
2. Q3 slowdown warrants investigation into causes
3. Overall trajectory is positive with 80% year-over-year growth

**Recommendations:**
• Investigate Q3 slowdown root causes
• Develop strategies to minimize mid-year volatility
• Set conservative Q1 target: $95k (5% growth)
• Implement Q4 success strategies earlier in the year`,
      'creative-lab': `Here are three unique brand concepts for your sustainable coffee company:

**CONCEPT 1: "Grounds Up"**
*Visual Identity:* Earthy browns, forest greens, handwritten typography
*Core Message:* "Coffee that gives back to the ground"
*Unique Angle:* Every bag includes seeds to plant at home. The package becomes a planter after use.
*Gen Z Appeal:* Tangible environmental action + Instagram-worthy plant-growing journey

**CONCEPT 2: "Honest Brew Co."**
*Visual Identity:* Bold black, cream, geometric patterns
*Core Message:* "No BS. Just good coffee."
*Unique Angle:* Radical transparency — QR codes show farmer profile, roasting process, carbon footprint per cup.
*Gen Z Appeal:* Authenticity + tech integration + education through storytelling

**CONCEPT 3: "Cycle Coffee"**
*Visual Identity:* Circular logo, sunset gradients, playful sans-serif
*Core Message:* "What goes around, brews around"
*Unique Angle:* Subscription with compostable packaging. Return empty bags = free drink credit.
*Gen Z Appeal:* Circular economy model + gamified sustainability + community rewards

Each concept balances sustainability with lifestyle appeal, targeting Gen Z's values while avoiding preachy messaging.`,
      'strategy-lab': `**HIRING DECISION FRAMEWORK**

Let me help you build a structured approach to this decision:

**Evaluation Criteria:**

| Factor | Full-Time Developer | Outsourcing |
|--------|-------------------|-------------|
| Upfront Cost | HIGH ($80-150k/year) | LOW (project-based) |
| Long-term Value | HIGH (builds IP) | MEDIUM (limited knowledge transfer) |
| Team Integration | EXCELLENT | LIMITED |
| Flexibility | LOW (fixed cost) | HIGH (scale up/down) |
| Quality Control | EXCELLENT | VARIES |
| Time to Productivity | 1-3 months | Immediate |

**Decision Tree:**

**START HERE:** What's your project timeline?

→ **> 12 months?**
  ├─ YES → Is this core to your product?
  │  ├─ YES → **Full-time developer**
  │  └─ NO → Consider outsource with option to hire
  └─ NO → **Outsource**

**Budget Check:**
- Can you afford $100k+ annually?
  - NO → Start with outsource, revisit in 6 months
  - YES → Continue to next question

**Knowledge Requirements:**
- Need deep company/product knowledge?
  - YES → Full-time strongly recommended
  - NO → Outsource works well

**Recommended Approach:**
1. Start with 3-month outsourced contract
2. Use this time to validate product-market fit
3. Evaluate contractor performance and needs
4. If successful, offer full-time conversion
5. If not, you've minimized risk and gained clarity

This "trial-to-hire" approach gives you flexibility while reducing commitment risk.`,
      'code-lab': `Here's a Python function to find the longest palindrome in a string:

\`\`\`python
def longest_palindrome(s: str) -> str:
    """
    Finds the longest palindrome substring using expand-around-center approach.

    Time complexity: O(n²)
    Space complexity: O(1)

    Args:
        s: Input string to search for palindromes

    Returns:
        The longest palindrome substring found
    """
    if not s:
        return ""

    def expand_around_center(left: int, right: int) -> str:
        """Expand outward from center while characters match"""
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return s[left + 1:right]

    longest = ""

    for i in range(len(s)):
        # Check for odd-length palindromes (single center)
        palindrome1 = expand_around_center(i, i)

        # Check for even-length palindromes (two centers)
        palindrome2 = expand_around_center(i, i + 1)

        # Update longest if we found a longer palindrome
        current_longest = palindrome1 if len(palindrome1) > len(palindrome2) else palindrome2
        if len(current_longest) > len(longest):
            longest = current_longest

    return longest


# Test cases
print(longest_palindrome("babad"))    # Output: "bab" or "aba"
print(longest_palindrome("cbbd"))     # Output: "bb"
print(longest_palindrome("racecar")) # Output: "racecar"
\`\`\`

**How it works:**
1. For each character, we treat it as a potential palindrome center
2. We expand outward while characters match
3. We check both odd-length (single center) and even-length (double center) palindromes
4. We keep track of the longest palindrome found

**Why this approach?**
- Simple and intuitive
- Good balance of time and space complexity
- Easy to understand and maintain

Want me to explain any part in more detail or show alternative approaches?`,
    };

    return mockOutputs[labId] || `I understand you'd like help with: "${userPrompt}"

Let me help you with that. Based on your request, here's what I recommend:

1. **Key Considerations:**
   - Define your specific goals and constraints
   - Consider your target audience or use case
   - Think about the desired format or structure

2. **Recommended Approach:**
   - Start with a clear outline or framework
   - Iterate and refine based on feedback
   - Test multiple variations if needed

3. **Next Steps:**
   - Could you provide more context about your specific needs?
   - What's the intended use case or audience?
   - Are there any constraints I should know about?

Feel free to ask follow-up questions or request modifications!`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get AI response with conversation history
      const responseContent = await generateResponse(currentInput, [...messages, userMessage]);

      const aiResponse: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);

      // Save to database
      if (user) {
        await supabase.from('lab_experiments').insert({
          user_id: user.id,
          lab_id: labId,
          prompt: currentInput,
          output: aiResponse.content,
        });
        loadHistory();
      }
    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorResponse: Message = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const loadExperiment = (experiment: Experiment) => {
    setMessages([
      {
        role: 'assistant',
        content: config.systemMessage,
        timestamp: new Date()
      },
      {
        role: 'user',
        content: experiment.prompt,
        timestamp: new Date(experiment.created_at)
      },
      {
        role: 'assistant',
        content: experiment.output,
        timestamp: new Date(experiment.created_at)
      }
    ]);
    setSidebarOpen(false);
  };

  const switchLab = (newLabId: string) => {
    if (onLabSwitch) {
      onLabSwitch(newLabId);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#F4F4F4] border-r-2 border-black transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b-2 border-black">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-sm uppercase tracking-tight">Labs</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="w-full text-left text-xs font-semibold hover:text-[#FF6A00] transition-colors"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>

          {/* Lab List */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {labs.map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => switchLab(lab.id)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    labId === lab.id
                      ? 'bg-white border border-black'
                      : 'hover:bg-white'
                  }`}
                >
                  <OpenMoji emoji={lab.icon} size={18} />
                  {lab.name}
                </button>
              ))}
            </div>
          </div>

          {/* History Section */}
          <div className="border-t-2 border-black">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" strokeWidth={2} />
                <span className="text-xs font-extrabold uppercase">History</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} strokeWidth={2} />
            </button>

            {showHistory && (
              <div className="max-h-64 overflow-y-auto border-t-2 border-black">
                {historyLoading ? (
                  <div className="p-4 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-black border-t-[#FF6A00] rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm text-[#666666]">Loading history...</p>
                  </div>
                ) : historyError ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-red-600 mb-2">{historyError}</p>
                    <button
                      onClick={loadHistory}
                      className="text-xs text-[#FF6A00] hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : history.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {history.slice(0, 10).map((exp) => (
                      <button
                        key={exp.id}
                        onClick={() => loadExperiment(exp)}
                        className="w-full text-left px-2 py-2 text-xs hover:bg-white transition-colors"
                      >
                        <p className="font-semibold truncate mb-1">{exp.prompt}</p>
                        <p className="text-[#666666]">
                          {new Date(exp.created_at).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-sm text-[#666666] text-center">
                    No experiments saved yet. Your work will appear here after you save.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 hover:bg-[#F4F4F4] transition-colors"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>
            <div>
              <h1 className="font-extrabold text-base uppercase tracking-tight">{config.name}</h1>
              <p className="text-xs text-[#666666]">{config.description}</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-[#FF6A00]" strokeWidth={2} />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-[#F4F4F4] border border-black' : 'bg-white'} p-4`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-xs font-extrabold uppercase tracking-tight">
                      {message.role === 'user' ? 'You' : config.name}
                    </p>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(message.content, index)}
                        className="flex-shrink-0 p-1 hover:bg-[#F4F4F4] transition-colors"
                        title="Copy response"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00D084]" strokeWidth={2} />
                        ) : (
                          <Copy className="w-4 h-4" strokeWidth={2} />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-black bg-white p-4">
          <div className="max-w-3xl mx-auto">
            {/* Suggestion Pills */}
            {messages.length === 1 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#666666] mb-2 uppercase tracking-tight">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {config.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className="text-xs px-3 py-2 bg-[#F4F4F4] border border-black hover:bg-[#FFE5D9] hover:border-[#FF6A00] transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={config.placeholder}
                className="flex-1 bg-[#F4F4F4] border border-black px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black max-h-32"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-black text-white border border-black p-3 hover:bg-[#FF6A00] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white"
              >
                <Send className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            <p className="text-xs text-[#666666] mt-2">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
