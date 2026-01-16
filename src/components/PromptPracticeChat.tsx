import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PromptPracticeChatProps {
  labType?: 'writing' | 'decision-making' | 'schedule' | 'learning-path' | 'aim-framework' | 'map-framework' | 'debug-patterns' | 'ocean-framework';
}

const LAB_CONFIG = {
  'aim-framework': {
    title: 'AIM FRAMEWORK PRACTICE',
    labId: 'aim-practice-lab',
    initialMessage: "Hi! I'm your AIM Framework practice partner. Let's practice writing prompts using **Actor, Input, and Mission**.\n\n**The AIM Framework:**\n• **A - ACTOR**: Tell me who I'm acting as (expert, consultant, teacher, etc.)\n• **I - INPUT**: Give me the context and data I need\n• **M - MISSION**: Define the exact outcome you want\n\n**Try a prompt like this:**\n*Actor:* You are a resume editor with 20 years of experience.\n*Input:* I'm applying for a Senior Product Manager role at a tech startup. Here's my current resume [description].\n*Mission:* Give me 5 specific improvements ranked by impact, with before/after examples for each.",
    examplePrompts: [
      "Write a professional email to a client about a project delay",
      "Create a compelling product description for a minimalist desk lamp",
      "Draft a social media post announcing a new feature",
      "Rewrite this paragraph to be more concise and engaging"
    ],
    placeholder: "Try writing an AIM prompt... Start with 'Actor: You are...'"
  },
  'map-framework': {
    title: 'MAP FRAMEWORK PRACTICE',
    labId: 'map-practice-lab',
    initialMessage: "Hi! I'm your MAP Framework practice partner. Let's practice adding rich context to your prompts using **Memory, Assets, Actions, and Prompt**.\n\n**The MAP Framework:**\n• **M - MEMORY**: Reference previous conversations or history\n• **A - ASSETS**: Attach files, data, links, or paste relevant information\n• **A - ACTIONS**: Tools I can use (search, analyze, create)\n• **P - PROMPT**: Your instruction enriched by the above\n\n**Try building a layered prompt with all four MAP elements!**\n\nExample:\n*Memory:* Last time we discussed targeting ROI-focused clients.\n*Assets:* Here's my company overview and the client's website.\n*Actions:* Research their recent press releases.\n*Prompt:* Draft a 2-page proposal emphasizing measurable ROI with 3 industry-specific use cases.",
    examplePrompts: [
      "Build a proposal using MAP to provide full context",
      "Create a performance review outline with memory of previous feedback",
      "Design a marketing campaign with competitive analysis assets",
      "Plan a project with historical data and constraints"
    ],
    placeholder: "Start with Memory: ... then add Assets, Actions, and your Prompt"
  },
  'debug-patterns': {
    title: 'PROMPT DEBUGGING PRACTICE',
    labId: 'debug-prompting-lab',
    initialMessage: "Hi! I'm your debugging practice partner. Let's practice the **3 Debugging Patterns** that turn weak AI responses into powerful ones.\n\n**The 3 Patterns:**\n\n**1. CHAIN OF THOUGHT**\nAsk me to show my reasoning step by step before giving the answer.\nExample: \"Think step by step. Show your reasoning, then give the final answer.\"\n\n**2. VERIFIER PATTERN**\nAsk me to clarify your intent before answering.\nExample: \"Before answering, ask me 3 questions to clarify my intent.\"\n\n**3. REFINEMENT PATTERN**\nAsk me to improve your question first.\nExample: \"Propose 2 sharper versions of my question, then answer the best one.\"\n\n**Try using one of these patterns in your next prompt!**",
    examplePrompts: [
      "How do I improve team communication? (Use Refinement Pattern)",
      "Should I switch careers? (Use Verifier Pattern)",
      "Calculate the ROI of this investment (Use Chain of Thought)",
      "Design a new pricing strategy (Use all three patterns)"
    ],
    placeholder: "Try a prompt with one of the debugging patterns..."
  },
  'ocean-framework': {
    title: 'OCEAN FRAMEWORK PRACTICE',
    labId: 'ocean-practice-lab',
    initialMessage: "Hi! I'm your OCEAN Framework practice partner. Let's practice elevating generic AI responses to remarkable ones using **OCEAN**.\n\n**The OCEAN Framework:**\n• **O - ORIGINAL**: Push for non-obvious, creative angles\n• **C - CONCRETE**: Demand specific examples with names, numbers, details\n• **E - EVIDENT**: Show reasoning and evidence, not just conclusions\n• **A - ASSERTIVE**: Make it take a clear stance and defend it\n• **N - NARRATIVE**: Structure with clear flow (Hook → Problem → Insight → Proof → Action)\n\n**Example OCEAN Prompt:**\n\"Give me 3 unconventional perspectives on [topic] that most advice ignores. Label one as risky. Back each with a real example. Show your reasoning. Pick the strategy you believe in most and defend it. Structure as: Why this matters → Problem → Your approach → Evidence → My next steps.\"\n\n**Try enhancing a generic prompt with OCEAN elements!**",
    examplePrompts: [
      "Should I switch careers? (Add OCEAN elements)",
      "How do I grow my business? (Make it Original, Concrete, Assertive)",
      "What's the best productivity system? (Add Evidence and Narrative)",
      "Help me make a difficult decision (Use full OCEAN framework)"
    ],
    placeholder: "Write a prompt that includes OCEAN elements..."
  },
  'writing': {
    title: 'WRITING LAB',
    labId: 'writing-lab',
    initialMessage: "Hi! I'm your AI practice partner. Try writing prompts using the Context + Task + Format formula you just learned. I'll respond to help you practice!\n\nTry prompts like:\n• \"I'm planning a birthday party for my 8-year-old [CONTEXT]. Create a list of fun activities [TASK] organized by indoor and outdoor options [FORMAT].\"\n• \"I'm learning to cook healthier meals [CONTEXT]. Give me 5 easy recipes [TASK] with ingredient lists and cooking times [FORMAT].\"",
    examplePrompts: [
      "Write a professional email to a client about a project delay",
      "Create a compelling product description for a minimalist desk lamp",
      "Draft a social media post announcing a new feature",
      "Rewrite this paragraph to be more concise and engaging"
    ],
    placeholder: "Write a compelling product description for..."
  },
  'decision-making': {
    title: 'DECISION LAB',
    labId: 'decision-lab',
    initialMessage: "Hi! I'm your AI decision-making partner. Practice using the decision framework prompts you just learned. I'll help you analyze options and make confident choices!\n\nTry prompts like:\n• \"I have two job offers. Help me analyze them using a decision matrix based on my priorities: [list priorities]\"\n• \"I'm deciding whether to [option A] or [option B]. Use the 10/10/10 rule to evaluate each option.\"\n• \"What am I not considering about [your decision]? Play devil's advocate for both sides.\"",
    examplePrompts: [
      "I'm deciding between two apartments. Create a decision matrix comparing rent, location, size, and amenities.",
      "Should I accept this job offer? Use the regret minimization framework to help me think through it.",
      "I'm choosing between three software tools. Analyze the opportunity cost of each option.",
      "Help me make a decision about changing careers using the worst-case scenario test."
    ],
    placeholder: "I'm deciding between two options..."
  },
  'schedule': {
    title: 'SCHEDULE LAB',
    labId: 'schedule-lab',
    initialMessage: "Hi! I'm your AI scheduling partner. Practice the energy-based scheduling method you just learned. Tell me about your tasks, energy patterns, and I'll help you optimize your day!\n\nTry prompts like:\n• \"I have peak focus from 9 AM - 12 PM. I'm most creative in the afternoon 2-4 PM. My energy drops around 3 PM. I have these tasks: [list tasks]. Create an optimized daily schedule.\"\n• \"Help me batch similar tasks. I need to: [list tasks]. Group them efficiently and suggest time blocks.\"",
    examplePrompts: [
      "Create an optimized schedule for tomorrow based on my peak focus hours (9-11 AM) and these tasks: [list your tasks]",
      "I have 3 meetings and 5 projects. Help me time-block my week to protect deep work time.",
      "Design a daily schedule that includes 15-min breaks every 90 minutes and groups similar tasks together.",
      "I'm most creative in the morning. Help me plan my week with themed days for different types of work."
    ],
    placeholder: "I have peak focus from 9 AM - 12 PM..."
  },
  'learning-path': {
    title: 'LEARNING PATH LAB',
    labId: 'learning-path-lab',
    initialMessage: "Hi! I'm your AI learning path designer. Use the framework you just learned to create a personalized learning journey!\n\nTry prompts like:\n• \"I want to learn [skill] to [goal]. I'm a [level]. I can dedicate [time] per [day/week]. I learn best through [style]. Create a [duration] learning path with weekly themes, practice exercises, recommended resources, and milestone projects.\"\n• \"Design a learning path for [skill] that fits my schedule: [time available]. Include free resources and hands-on projects.\"",
    examplePrompts: [
      "I want to learn digital photography to take better travel photos. I'm a complete beginner with a basic camera. I can dedicate 45 minutes per day, 5 days a week. I learn best through hands-on practice with some theory. Create a 60-day learning path with weekly themes, daily practice exercises, recommended resources (prefer free), and milestone projects to track progress.",
      "Create a learning path for basic Python programming. I'm a complete beginner. I have 1 hour three times per week. I prefer interactive coding exercises over reading. Design a 90-day plan.",
      "I want to learn conversational Spanish for travel. Intermediate level. 30 minutes daily. I learn best through speaking practice. Create a 60-day immersive learning path.",
      "Design a learning path to master public speaking. Beginner level. 2 hours per week. Include practice opportunities and feedback checkpoints. 12-week timeline."
    ],
    placeholder: "I want to learn..."
  }
};

export default function PromptPracticeChat({ labType = 'writing' }: PromptPracticeChatProps) {
  const config = LAB_CONFIG[labType];
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: config.initialMessage
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateResponse = async (userPrompt: string): Promise<string> => {
    try {
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
          labId: config.labId,
          conversationHistory: messages.slice(1).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('AI API error:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          details: data.details
        });

        const errorMessage = data.error || 'Failed to get AI response';
        throw new Error(errorMessage);
      }

      if (!data.response) {
        console.error('No response in data:', data);
        throw new Error('AI returned an empty response');
      }

      return data.response;
    } catch (error) {
      console.error('Error calling AI:', error);
      if (error instanceof Error && error.message === 'Authentication required') {
        return "Please sign in to use the AI prompt practice features.";
      }
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return `I apologize, but I'm having trouble connecting right now.\n\nError: ${errorMsg}\n\nPlease try again in a moment.`;
    }
  };

  const generateMockResponse = (userPrompt: string): string => {
    const lowerPrompt = userPrompt.toLowerCase();

    // Check for Context + Task + Format pattern
    const hasContext = lowerPrompt.includes("i'm") || lowerPrompt.includes("i am") ||
                       lowerPrompt.includes("my") || lowerPrompt.includes("for");
    const hasTask = lowerPrompt.includes("create") || lowerPrompt.includes("give") ||
                    lowerPrompt.includes("write") || lowerPrompt.includes("make") ||
                    lowerPrompt.includes("help") || lowerPrompt.includes("plan");
    const hasFormat = lowerPrompt.includes("list") || lowerPrompt.includes("organized") ||
                      lowerPrompt.includes("table") || lowerPrompt.includes("steps") ||
                      lowerPrompt.includes("bullet") || lowerPrompt.includes("numbered");

    // Good prompt - has all elements
    if (hasContext && hasTask && hasFormat) {
      return `Excellent prompt! ✓ You included all three elements:\n\nCONTEXT: You gave me background about your situation\nTASK: You clearly stated what you need\nFORMAT: You specified how you want the answer\n\nThis is exactly how to get great AI results. The more specific you are, the better the response.\n\n💡 Pro tip: You can make this even better by adding details like:\n• Time constraints ("in under 30 minutes")\n• Skill level ("beginner-friendly")\n• Specific preferences or requirements\n\nTry another prompt, or ask me for help with a real task you have!`;
    }

    // Missing format
    if (hasContext && hasTask && !hasFormat) {
      return `Good start! You have context and a clear task. ✓\n\nTo make this stronger, add a FORMAT:\n• "organized as a table"\n• "in bullet points"\n• "as step-by-step instructions"\n• "with examples for each"\n\nTry rewording your prompt to include how you want the answer delivered.`;
    }

    // Missing context
    if (!hasContext && hasTask) {
      return `Nice! You have a clear task. ✓\n\nTo get better results, add CONTEXT:\n• Who are you? ("I'm a small business owner...")\n• What's your situation? ("I'm planning a...")\n• What's your skill level? ("I'm a beginner at...")\n• Any constraints? ("I have limited time...")\n\nContext helps AI tailor the response to YOUR specific needs.`;
    }

    // Too vague
    if (userPrompt.length < 20) {
      return `This prompt is a bit too brief. Let me show you how to improve it:\n\nYour prompt: "${userPrompt}"\n\nBetter version:\n"I'm [your context]. [Your task] in a format that [how you want it]"\n\nExample:\n"I'm a busy parent looking for quick dinner ideas. Give me 5 recipes that take under 30 minutes, organized with ingredients and steps."\n\nTry expanding your prompt with more detail!`;
    }

    // Generic meal/food request
    if (lowerPrompt.includes('meal') || lowerPrompt.includes('recipe') || lowerPrompt.includes('food') || lowerPrompt.includes('dinner')) {
      return `Here's a sample response based on your prompt:\n\nQuick Weeknight Dinners:\n\n1. Chicken Stir-Fry (20 mins)\n   - Chicken breast, mixed veggies, soy sauce\n   - Cook chicken, add veggies, season, serve over rice\n\n2. Pasta Primavera (25 mins)\n   - Pasta, seasonal vegetables, olive oil, parmesan\n   - Boil pasta, sauté veggies, combine, top with cheese\n\n3. Sheet Pan Salmon (30 mins)\n   - Salmon fillet, potatoes, asparagus\n   - Season all, bake together at 400°F\n\n---\n\nHow was your prompt?\n${hasContext && hasTask && hasFormat ? '✓ Great job! You used the full formula.' : '💡 Try adding more details to get even better results.'}\n\nWant to try another topic?`;
    }

    // Generic exercise/workout request
    if (lowerPrompt.includes('exercise') || lowerPrompt.includes('workout') || lowerPrompt.includes('fitness')) {
      return `Here's a sample response:\n\n20-Minute Home Workout Routine:\n\nWarm-up (3 mins)\n- Jumping jacks: 30 seconds\n- Arm circles: 30 seconds\n- High knees: 30 seconds\n\nMain Workout (15 mins - 3 rounds)\n1. Push-ups: 10 reps\n2. Squats: 15 reps\n3. Plank: 30 seconds\n4. Lunges: 10 each leg\n5. Mountain climbers: 20 reps\n\nCool-down (2 mins)\n- Stretch major muscle groups\n\n---\n\n${hasContext && hasTask && hasFormat ? '✓ Excellent prompt structure!' : '💡 Tip: Add your fitness level and any equipment you have for more personalized results.'}\n\nTry another prompt!`;
    }

    // Schedule/planning request
    if (lowerPrompt.includes('schedule') || lowerPrompt.includes('plan') || lowerPrompt.includes('organize')) {
      return `Based on your prompt, here's a sample:\n\nDaily Schedule Template:\n\nMorning (6-9 AM)\n□ Wake up routine\n□ Exercise/movement\n□ Breakfast\n□ Review daily goals\n\nWork Block 1 (9-12 PM)\n□ Most important task\n□ Focused work time\n□ Quick break every 90 mins\n\nMidday (12-1 PM)\n□ Lunch\n□ Short walk\n\nWork Block 2 (1-5 PM)\n□ Meetings/calls\n□ Secondary tasks\n□ Email/communication\n\nEvening (5-9 PM)\n□ Personal time\n□ Dinner\n□ Relaxation\n\n---\n\n${hasContext ? '✓ Good context!' : '💡 Add context about what you need the schedule for.'}\n${hasTask ? '✓ Clear task!' : '💡 Be specific about what you want to schedule.'}\n\nPractice another prompt?`;
    }

    // Default helpful response
    return `I can see you're practicing! Here's my response:\n\n"${userPrompt}"\n\n---\n\nFeedback on your prompt:\n${hasContext ? '✓ Context included' : '○ Missing context (who you are, your situation)'}\n${hasTask ? '✓ Clear task stated' : '○ Task could be more specific'}\n${hasFormat ? '✓ Format specified' : '○ No format specified (how you want the answer)'}\n\nTo improve this prompt, try:\n"I'm [context about you]. [Specific task you need help with], formatted as [bullet points/steps/table/etc]."\n\nExample:\n"I'm a college student preparing for finals. Create a 2-week study schedule for 4 classes, organized by day with time blocks for each subject."\n\nTry writing another prompt with all three elements!`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input
    };

    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const responseContent = await generateResponse(currentInput);
      const aiResponse: Message = {
        role: 'assistant',
        content: responseContent
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorResponse: Message = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
      };
      setMessages(prev => [...prev, errorResponse]);
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

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 bg-[#F4F4F4] border-r-2 border-black">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b-2 border-black">
            <h2 className="font-extrabold text-sm uppercase tracking-tight mb-4">Practice Lab</h2>
            <p className="text-xs text-[#666666] leading-relaxed">
              Practice using the {config.title.toLowerCase()} pattern to improve your prompting skills.
            </p>
          </div>

          {/* Lab Info */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-tight mb-2">About</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  {labType === 'aim-framework' && "Practice the Actor, Input, Mission framework to structure effective prompts."}
                  {labType === 'map-framework' && "Learn to add context with Memory, Assets, Actions, and Prompt."}
                  {labType === 'debug-patterns' && "Master the 3 debugging patterns: Chain of Thought, Verifier, and Refinement."}
                  {labType === 'ocean-framework' && "Elevate generic responses with Original, Concrete, Evident, Assertive, and Narrative elements."}
                  {!['aim-framework', 'map-framework', 'debug-patterns', 'ocean-framework'].includes(labType || '') && "Practice writing effective prompts and see how AI responds."}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-tight mb-2">Tips</h3>
                <ul className="text-xs text-[#666666] space-y-2 leading-relaxed">
                  <li>• Start with example prompts</li>
                  <li>• Experiment with variations</li>
                  <li>• Compare different approaches</li>
                  <li>• Learn from the responses</li>
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
            <h1 className="font-extrabold text-base uppercase tracking-tight">{config.title}</h1>
            <p className="text-xs text-[#666666]">Interactive practice environment</p>
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
                      {message.role === 'user' ? 'You' : config.title}
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
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-black bg-white p-4">
          <div className="max-w-3xl mx-auto">
            {/* Example Prompts */}
            {messages.length === 1 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#666666] mb-2 uppercase tracking-tight">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {config.examplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt)}
                      className="text-xs px-3 py-2 bg-[#F4F4F4] border border-black hover:bg-[#FFE5D9] hover:border-[#FF6A00] transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Field */}
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
                disabled={!input.trim() || isTyping}
                className="bg-black text-white border border-black p-3 hover:bg-[#FF6A00] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            <p className="text-xs text-[#666666] mt-2">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
}
