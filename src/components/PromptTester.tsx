import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Copy, CheckCircle2, RotateCcw, ChevronDown, Wand2, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PromptTesterProps {
  initialPrompt?: string;
}

interface PromptVariable {
  key: string;
  label: string;
  placeholder: string;
}

export default function PromptTester({ initialPrompt }: PromptTesterProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: initialPrompt
        ? "I've loaded your prompt template. Fill in the form fields below to customize your prompt, then send it to see the AI's response!"
        : "Hi! I'm your AI prompt testing partner. Practice your prompts here and see how different phrasings affect the responses. Try asking about weekly planning, scheduling, or any other topic you're working on!"
    }
  ]);
  const [input, setInput] = useState(initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [originalPrompt] = useState(initialPrompt || '');
  const [promptVariables, setPromptVariables] = useState<PromptVariable[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [formExpanded, setFormExpanded] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialPrompt) {
      const variables = extractVariables(initialPrompt);
      setPromptVariables(variables);
      const initialValues: Record<string, string> = {};
      variables.forEach(v => {
        initialValues[v.key] = '';
      });
      setVariableValues(initialValues);
    }
  }, [initialPrompt]);

  const extractVariables = (prompt: string): PromptVariable[] => {
    const variablePattern = /\{([^}]+)\}/g;
    const matches = [...prompt.matchAll(variablePattern)];
    const uniqueVars = new Set<string>();
    const variables: PromptVariable[] = [];

    matches.forEach(match => {
      const key = match[1];
      if (!uniqueVars.has(key)) {
        uniqueVars.add(key);
        variables.push({
          key,
          label: key.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          placeholder: `Enter ${key.split('_').join(' ')}...`
        });
      }
    });

    return variables;
  };

  const buildPromptFromVariables = (): string => {
    let builtPrompt = originalPrompt;
    Object.keys(variableValues).forEach(key => {
      const value = variableValues[key] || `{${key}}`;
      builtPrompt = builtPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return builtPrompt;
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const mockResponses: Record<string, string> = {
    'weekly': `**YOUR OPTIMIZED WEEKLY PLAN**

MONDAY
9:00-11:00 AM - Deep Work Block: Project proposal (Priority 1)
11:00-11:30 AM - Email & Communication Batch
11:30 AM-12:30 PM - Lunch Break
12:30-2:00 PM - Meetings Cluster (Client calls, team sync)
2:00-4:30 PM - Creative Work: Content planning & strategy
4:30-5:30 PM - Admin & Wrap-up

TUESDAY
9:00 AM-12:00 PM - Deep Work Block: Strategic planning (Priority 2)
12:00-1:00 PM - Lunch + 20-min walk
1:00-2:00 PM - DECISION TIME: Job offer evaluation
2:00-4:00 PM - Meetings
4:00-5:30 PM - Task Batch: Follow-ups, emails, small tasks

WEDNESDAY
9:00-10:30 AM - Team collaboration time
10:30 AM-12:30 PM - Deep Work: Implementation work
12:30-1:30 PM - Lunch
1:30-4:00 PM - Client project work
4:00-5:00 PM - Learning block
5:00-5:30 PM - Week mid-point review

THURSDAY
9:00 AM-12:00 PM - Deep Work: Priority 3 execution
12:00-1:00 PM - Networking lunch
1:00-3:00 PM - Buffer time for catch-up
3:00-5:00 PM - Creative/Strategic thinking
5:00-5:30 PM - Plan Friday tasks

FRIDAY
9:00-11:00 AM - Wrap up weekly priorities
11:00 AM-12:00 PM - Team meetings
12:00-1:00 PM - Lunch
1:00-3:00 PM - Admin, invoicing, expenses
3:00-4:00 PM - Week review & wins
4:00-5:00 PM - Next week preview

**KEY OPTIMIZATIONS:**
✓ Deep work when energy is highest
✓ Meetings clustered (not scattered)
✓ Built-in buffers between blocks
✓ Decision-making time scheduled
✓ Weekly review built in`,
    'schedule': `**OPTIMIZED DAILY SCHEDULE**

**MORNING (High Energy)**
6:30-7:00 AM - Morning routine
7:00-9:00 AM - Commute or prep time
9:00-12:00 PM - DEEP WORK BLOCK
  • Most important task first
  • No meetings, no interruptions
  • Phone off, email closed

**MIDDAY (Moderate Energy)**
12:00-1:00 PM - Lunch + movement break
1:00-3:00 PM - Meetings & Collaboration
  • Stack meetings together
  • Batch similar calls

**AFTERNOON (Variable Energy)**
3:00-3:15 PM - Energy reset (walk, snack)
3:15-5:00 PM - Task Execution Zone
  • Medium-complexity tasks
  • Creative work
  • Administrative items

**EVENING (Wrap-up)**
5:00-5:30 PM - Day review & tomorrow preview

**OPTIMIZATIONS:**
✓ Deep work when energy is highest
✓ Meetings clustered
✓ Buffer time between blocks
✓ No context-switching during focus`
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lab-ai-chat`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage,
          labId: 'prompt-tester',
          conversationHistory: messages.slice(1).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      return data.response || generateMockResponse(userMessage);
    } catch (error) {
      console.error('Error calling AI:', error);
      return generateMockResponse(userMessage);
    }
  };

  const generateMockResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('week') || lowerMessage.includes('weekly') || lowerMessage.includes('plan my')) {
      return mockResponses['weekly'];
    }
    if (lowerMessage.includes('schedule') || lowerMessage.includes('daily') || lowerMessage.includes('calendar') || lowerMessage.includes('optimize')) {
      return mockResponses['schedule'];
    }

    return `Thanks for your prompt! Here's a response based on what you asked:

I can help you with that. To give you the most useful response, try being more specific:

• What's your goal or desired outcome?
• What context should I know about your situation?
• Are there any constraints I should consider?
• What format would be most helpful for you?

Try asking about weekly planning, daily scheduling, or any specific task you need help with. The more details you provide, the better I can assist you!`;
  };

  const handleSend = async () => {
    const messageToSend = initialPrompt ? buildPromptFromVariables() : input.trim();

    if (!messageToSend.trim() || isTyping) return;

    if (!initialPrompt) {
      setInput('');
    }

    if (initialPrompt && promptVariables.length > 0) {
      setFormExpanded(false);
    }

    setIsTyping(true);

    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);

    try {
      const responseContent = await generateResponse(messageToSend);
      setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
    } catch (error) {
      console.error('Error in handleSend:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetForm = () => {
    const resetValues: Record<string, string> = {};
    promptVariables.forEach(v => {
      resetValues[v.key] = '';
    });
    setVariableValues(resetValues);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: originalPrompt
          ? "Chat cleared! Your prompt template is still loaded below. Ready to test it again?"
          : "Chat cleared! Ready to start fresh. What would you like to test?"
      }
    ]);
    if (originalPrompt) {
      handleResetForm();
      setFormExpanded(true);
    }
  };

  const fillWithExample = () => {
    const exampleValues: Record<string, string> = {
      'email_draft': 'Hi team, just wanted to touch base about the project. We should probably meet soon to discuss next steps. Let me know when you\'re free. Thanks!',
      'tone': 'professional and warm',
      'audience': 'my marketing team',
      'meeting_purpose': 'Q1 Planning for Product Launch',
      'duration': '60 minutes',
      'attendees': 'Product Manager, Design Lead, Engineering Lead, Marketing Manager',
      'key_topics': 'Timeline, Resource allocation, Launch strategy, Risk assessment',
      'skill': 'Python programming',
      'current_level': 'Complete beginner with no coding experience',
      'target_level': 'Intermediate - able to build web applications',
      'time_available': '3 months, 10 hours per week',
      'learning_style': 'hands-on with real projects',
      'challenge': 'Increase user engagement on our mobile app',
      'context': 'Social fitness app with 50k users, engagement has plateaued',
      'constraints': 'Limited development resources, 3-month timeline',
      'target_audience': 'Fitness enthusiasts aged 25-40',
      'decision': 'Should we expand to international markets or focus on domestic growth?',
      'options': '1) Enter EU market, 2) Launch in Asia, 3) Deepen US presence',
      'stakeholders': 'CEO, Board, Sales team, Product team',
      'factors': 'Revenue potential, Competition, Resource requirements, Risk level',
      'timeframe': 'Decision needed within 2 weeks, implementation in 6 months',
      'topic': 'weekly schedule optimization',
      'goal': 'create a balanced weekly schedule that maximizes productivity',
      'format': 'day-by-day breakdown with time blocks',
      'output_format': 'bullet points with time blocks',
      'additional_notes': 'I do my best work in the morning'
    };

    const filledValues: Record<string, string> = {};
    promptVariables.forEach(v => {
      filledValues[v.key] = exampleValues[v.key] || `Example ${v.label.toLowerCase()}`;
    });
    setVariableValues(filledValues);
  };

  const canSendPrompt = initialPrompt
    ? Object.values(variableValues).some(v => v.trim())
    : input.trim();

  const examplePrompts = [
    "Help me plan my week with deep work blocks and meetings clustered together",
    "Create an optimized daily schedule based on my peak energy hours (9-11 AM)",
    "I need a weekly plan that balances client work, admin tasks, and learning time",
    "Design a daily schedule with 90-minute focus blocks and regular breaks"
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 bg-[#F4F4F4] border-r-2 border-black">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b-2 border-black">
            <h2 className="font-extrabold text-sm uppercase tracking-tight mb-4">Prompt Testing</h2>
            {messages.length > 1 && (
              <button
                onClick={handleClearChat}
                className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-white border border-transparent hover:border-black transition-all"
              >
                <RotateCcw className="w-3 h-3 inline mr-2" strokeWidth={2} />
                Clear Chat
              </button>
            )}
          </div>

          {/* Info Panel */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-tight mb-2">About</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  {initialPrompt
                    ? "Test your prompt template with different inputs and see how the AI responds. Experiment with variations to improve your results."
                    : "Practice writing effective prompts and learn how to get better results from AI. Try different approaches and compare the responses."}
                </p>
              </div>

              {initialPrompt && promptVariables.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-tight mb-2">Variables</h3>
                  <div className="space-y-1">
                    {promptVariables.map(v => (
                      <div key={v.key} className="text-xs text-[#666666] bg-white px-2 py-1 border border-black">
                        {v.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-tight mb-2">Tips</h3>
                <ul className="text-xs text-[#666666] space-y-2 leading-relaxed">
                  <li>• Be specific about your goals</li>
                  <li>• Provide context and constraints</li>
                  <li>• Specify the desired format</li>
                  <li>• Iterate and refine based on results</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="border-t-2 border-black p-4">
            <p className="text-xs font-semibold uppercase tracking-tight text-[#666666]">
              Messages: {messages.length - 1}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-white">
          <div>
            <h1 className="font-extrabold text-base uppercase tracking-tight">Prompt Tester</h1>
            <p className="text-xs text-[#666666]">
              {initialPrompt ? "Interactive prompt builder with AI testing" : "Practice and refine your AI prompts"}
            </p>
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
                      {message.role === 'user' ? 'You' : 'Prompt Tester'}
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

            {isTyping && (
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
            {/* Free-form input (no template) */}
            {!initialPrompt && (
              <>
                {messages.length === 1 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[#666666] mb-2 uppercase tracking-tight">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {examplePrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(prompt)}
                          className="text-xs px-3 py-2 bg-[#F4F4F4] border border-black hover:bg-white hover:border-[#FF6A00] transition-all"
                        >
                          {prompt}
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
                    placeholder="Type your prompt here..."
                    className="flex-1 bg-[#F4F4F4] border border-black px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black max-h-32"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="bg-black text-white border border-black p-3 hover:bg-[#FF6A00] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white"
                  >
                    <Send className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
                <p className="text-xs text-[#666666] mt-2">Press Enter to send, Shift+Enter for new line</p>
              </>
            )}

            {/* Template-based input (with variables) */}
            {initialPrompt && (
              <>
                {promptVariables.length > 0 ? (
                  <>
                    {/* Collapsible Form Builder */}
                    <div className="mb-4">
                      <button
                        onClick={() => setFormExpanded(!formExpanded)}
                        className="w-full flex items-center justify-between p-3 bg-[#F4F4F4] border border-black hover:bg-white transition-colors mb-2"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#FF6A00]" strokeWidth={2} />
                          <span className="text-xs font-extrabold uppercase tracking-tight">
                            {formExpanded ? 'Customize Prompt' : 'Expand Form'}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${formExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
                      </button>

                      {formExpanded && (
                        <div className="border-2 border-black p-4 bg-[#F4F4F4]">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-[#666666]">Fill in the fields below to customize your prompt</p>
                            <div className="flex gap-2">
                              <button
                                onClick={fillWithExample}
                                className="text-xs px-2 py-1 bg-white border border-black hover:bg-[#FFE5D9] hover:border-[#FF6A00] transition-all"
                              >
                                <Wand2 className="w-3 h-3 inline mr-1" strokeWidth={2} />
                                Example
                              </button>
                              <button
                                onClick={handleResetForm}
                                className="text-xs px-2 py-1 bg-white border border-black hover:bg-[#FFE5D9] hover:border-[#FF6A00] transition-all"
                              >
                                <RotateCcw className="w-3 h-3 inline mr-1" strokeWidth={2} />
                                Reset
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {promptVariables.map((variable) => (
                              <div key={variable.key}>
                                <label className="block text-xs font-extrabold uppercase tracking-tight mb-1">
                                  {variable.label}
                                </label>
                                <textarea
                                  value={variableValues[variable.key] || ''}
                                  onChange={(e) => setVariableValues(prev => ({
                                    ...prev,
                                    [variable.key]: e.target.value
                                  }))}
                                  placeholder={variable.placeholder}
                                  className="w-full bg-white border border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none min-h-[60px]"
                                  rows={2}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleSend}
                      disabled={!canSendPrompt || isTyping}
                      className="w-full bg-black text-white border border-black px-6 py-3 text-sm font-extrabold uppercase tracking-tight hover:bg-[#FF6A00] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white"
                    >
                      <Send className="w-4 h-4 inline mr-2" strokeWidth={2} />
                      Send Prompt to AI
                    </button>
                    <p className="text-xs text-[#666666] mt-2 text-center">
                      Fill in at least one field to send your customized prompt
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-[#F4F4F4] border border-black">
                      <p className="text-xs font-extrabold uppercase tracking-tight mb-2">Prompt Template</p>
                      <p className="text-sm whitespace-pre-wrap">{originalPrompt}</p>
                    </div>

                    <button
                      onClick={handleSend}
                      disabled={isTyping}
                      className="w-full bg-black text-white border border-black px-6 py-3 text-sm font-extrabold uppercase tracking-tight hover:bg-[#FF6A00] hover:text-black transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 inline mr-2" strokeWidth={2} />
                      Send Prompt to AI
                    </button>
                    <p className="text-xs text-[#666666] mt-2 text-center">
                      This prompt has no variables - send it as-is!
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
