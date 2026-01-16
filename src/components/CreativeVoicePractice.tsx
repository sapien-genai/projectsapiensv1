import { useState } from 'react';
import { Send, RotateCcw, Sparkles, Lightbulb } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const starterPrompts = [
  "I'm a [your medium] creator. My style is conversational, honest, and practical. Help me write a piece about [topic] that sounds authentically like me.",
  "Here are 3 examples of my work: [paste examples]. Analyze my voice and tell me what makes it unique.",
  "I want to write about [topic] but it keeps sounding generic. How can I make it more 'me'?",
  "Help me define my creative voice in 3-5 clear adjectives based on [describe your work].",
];

export default function CreativeVoicePractice() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mockResponses: Record<string, string> = {
    'voice_analysis': `**YOUR CREATIVE VOICE ANALYSIS:**

Based on what you've shared, here's what makes your voice unique:

**TONE CHARACTERISTICS:**
- **Conversational & Direct** - You write like you're talking to a friend over coffee. No corporate jargon, no unnecessary complexity.
- **Honest & Vulnerable** - You're not afraid to share what didn't work. This builds immediate trust.
- **Action-Oriented** - Every piece includes clear next steps. You don't just inform - you empower.

**STRUCTURAL PATTERNS:**
- Short paragraphs (2-4 sentences max)
- Strong, declarative statements
- Questions that pull readers in
- Bullet points for clarity
- Personal examples that illustrate points

**LANGUAGE CHOICES:**
- Simple, everyday words (you'd say "use" not "utilize")
- Second person ("you") to make it feel personal
- Present tense for immediacy
- Metaphors from daily life (not technical or academic)

**WHAT MAKES YOU DIFFERENT:**
Most creators in your space either go too academic or too casual. You've found a sweet spot: professional insights delivered in a human voice. You teach without talking down.

**YOUR SIGNATURE MOVE:**
You start with the problem (making it relatable), acknowledge why it's hard (validation), then give the solution with a real example (proof it works). This pattern builds throughout your work.

**TO AMPLIFY THIS VOICE:**
1. Start every piece with "You know that feeling when..." to immediately create connection
2. Replace any sentence over 20 words with two shorter ones
3. Add one personal story or example per 500 words
4. End with "Your turn:" to create action

Try applying these patterns to your next piece and let me see how it feels!`,

    'voice_definition': `**DEFINING YOUR CREATIVE VOICE:**

Let's break down the key elements that make your voice distinctly yours:

**STYLE DESCRIPTORS:**
Choose 3-5 that feel most authentic:

**TONE OPTIONS:**
- Conversational / Formal / Academic
- Playful / Serious / Balanced
- Optimistic / Realistic / Critical
- Warm / Professional / Edgy

**APPROACH:**
- Story-driven / Data-driven / Example-driven
- Instructional / Inspirational / Provocative
- Beginner-friendly / Advanced / Multi-level

**YOUR VOICE STATEMENT:**
"I write in a [tone] style that's [characteristic 1], [characteristic 2], and [characteristic 3]. My audience appreciates that I [what you do differently]. I avoid [what you never do] because [why]."

**EXAMPLE:**
"I write in a conversational style that's honest, practical, and encouraging. My audience appreciates that I share what didn't work, not just success stories. I avoid jargon and theory-heavy explanations because real change comes from action, not just understanding."

**YOUR TURN:**
Fill in the blanks above based on your natural style. Share it with me and I'll help you refine it into a voice guide you can use every time you create!`,

    'make_unique': `**TURNING GENERIC INTO UNIQUE:**

You said it feels generic. Here's how to inject YOUR voice:

**THE GENERIC VERSION:**
"Productivity is important for success. Here are some tips to be more productive."

**PROBLEM WITH GENERIC:**
- Could be written by anyone
- No personality
- No specific point of view
- No reason to care

**HOW TO MAKE IT YOURS:**

**1. START WITH A SPECIFIC MOMENT:**
Generic: "Time management is difficult"
Yours: "Last Tuesday, I had 47 Chrome tabs open, 3 half-written documents, and I'd accomplished exactly nothing by 3pm"

**2. ADD YOUR BELIEF/ANGLE:**
Generic: "You should prioritize tasks"
Yours: "I believe most to-do lists are lies we tell ourselves. Here's what actually works"

**3. USE YOUR LANGUAGE:**
Generic: "Implement these strategies"
Yours: "Try this" or "Here's what I do" or "This changed everything"

**4. INCLUDE YOUR EXPERIENCE:**
Generic: "These methods are effective"
Yours: "I wasted 2 years trying complex systems before I learned this simple truth"

**5. END WITH YOUR CALL:**
Generic: "Apply these tips"
Yours: "Pick one. Just one. Try it tomorrow morning. Then tell me what happened"

**TRANSFORMATION EXAMPLE:**

**BEFORE (Generic):**
"Good writing requires practice and revision. Writers should develop a consistent routine."

**AFTER (Your Voice):**
"I used to think writer's block meant I had nothing to say. Turns out, I was just waiting for perfect sentences to arrive fully formed. They never did. Now I write badly on purpose - 500 awful words every morning before coffee. You can't edit a blank page. You can fix terrible writing."

**YOUR TURN:**
Show me your generic draft. I'll help you transform it into something that could only come from YOU.`,

    'style_examples': `**ANALYZING YOUR STYLE:**

Thank you for sharing those examples! Here's what I notice about your creative voice:

**CONSISTENT PATTERNS:**

**1. OPENING HOOKS:**
- You often start with a question or challenge
- "What if..." / "You know that feeling..." / "Most people think..."
- Creates immediate curiosity

**2. SENTENCE RHYTHM:**
- Mix of short punchy statements and longer explanatory ones
- Short for impact: "It changed everything."
- Longer for context: "I spent three years trying every productivity system until..."

**3. WORD CHOICES:**
- Specific verbs: "struggled" not "had difficulty"
- Active voice: "I learned" not "it was learned"
- Everyday language: "messed up" not "encountered challenges"

**4. STRUCTURAL MOVES:**
- Problem → Why it's hard → What worked → How to apply
- Personal story → Lesson learned → Your turn
- Question → Answer → Example → Action

**5. AUTHENTICITY MARKERS:**
- You admit mistakes and failures
- You share specific numbers/details
- You acknowledge when things are hard
- You don't oversell or overpromise

**WHAT MAKES THIS WORK:**
Your voice feels like a trusted friend who's been there, figured something out, and wants to save you the struggle. Not preachy, not perfect, not academic - just real.

**TO STRENGTHEN THIS VOICE:**
1. Keep leading with questions or relatable pain points
2. Add more specific details (names, times, exact moments)
3. Maintain that mix of "here's what sucked" and "here's what worked"
4. End every piece with a clear, simple next step

**PRACTICE PROMPT:**
Now try writing about [your topic] using these exact patterns. Start with a question, share a specific moment from your experience, extract the lesson, and end with one action step.

Show me what you create!`,

    'iteration': `**LET'S ITERATE TOGETHER:**

Great first draft! Here's how we'll refine it to sound more like YOU:

**ROUND 1 FEEDBACK:**

**What's Working:**
✓ Clear structure
✓ Good information
✓ Logical flow

**What Needs Your Voice:**
- Lines 2-5 feel a bit formal. What would you say to a friend?
- Paragraph 3 is telling, not showing. What's a specific example?
- The ending is generic. What's YOUR unique call-to-action?

**SPECIFIC EDITS TO TRY:**

**Original:** "It is important to establish a routine."
**More You:** "I fought routines for years. Turns out, I was just building bad ones."

**Original:** "This approach can be beneficial."
**More You:** "This changed everything for me. Maybe it will for you too."

**Original:** "Consider implementing these strategies."
**More You:** "Pick one. Try it tomorrow. That's it."

**VOICE-ADDING QUESTIONS:**
1. When did you first encounter this problem?
2. What did you try that DIDN'T work?
3. What was the "aha" moment?
4. What would you tell yourself a year ago?
5. What's the one thing people get wrong?

**YOUR NEXT DRAFT:**
Take this feedback and rewrite just the first paragraph. Make it sound like something you'd actually say out loud. Then show me - we'll iterate from there.

Remember: Your first draft is meant to be messy. That's where we find your real voice - in the edits, not the initial pass.

Ready for round 2?`,

    'default': `**CREATIVE VOICE PRACTICE:**

Let's work on finding and amplifying your unique voice! I can help you:

**ANALYZE YOUR VOICE:**
Share 2-3 examples of your work, and I'll identify:
- Your natural tone and rhythm
- Recurring patterns and phrases
- What makes your voice distinctive
- How to amplify what's already working

**DEFINE YOUR STYLE:**
Tell me about:
- What medium you create in (writing, video, design, etc.)
- Who your audience is
- What you want your voice to feel like
- Creators whose voice you admire (and why)

**PRACTICE WRITING IN YOUR VOICE:**
Give me a topic, and I'll help you:
- Brainstorm an approach that's uniquely yours
- Draft in your authentic voice
- Iterate to make it sound even more "you"
- Remove generic language

**FIX GENERIC CONTENT:**
Share something that feels too bland, and I'll help:
- Identify what's missing
- Add specificity and personality
- Transform it into your voice
- Show you the before/after

**QUICK STARTS:**
Try one of these:
- "Analyze my voice from these examples: [paste work]"
- "Help me define my creative voice for [your medium]"
- "Make this sound more like me: [paste draft]"
- "I want to write about [topic] in my unique voice"

What would you like to work on first?`
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
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
          prompt: userMessage,
          labId: 'creative-lab',
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
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
        return "Please sign in to use the creative voice practice.";
      }
      return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const generateMockResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('analyze') && (lowerMessage.includes('voice') || lowerMessage.includes('style') || lowerMessage.includes('examples'))) {
      return mockResponses['voice_analysis'];
    }
    if (lowerMessage.includes('define') || lowerMessage.includes('describe my voice') || lowerMessage.includes('what is my voice')) {
      return mockResponses['voice_definition'];
    }
    if (lowerMessage.includes('generic') || lowerMessage.includes('bland') || lowerMessage.includes('boring') || lowerMessage.includes('sounds like everyone')) {
      return mockResponses['make_unique'];
    }
    if (lowerMessage.includes('examples') || lowerMessage.includes('here are') || lowerMessage.includes('my work') || lowerMessage.includes('i wrote')) {
      return mockResponses['style_examples'];
    }
    if (lowerMessage.includes('iterate') || lowerMessage.includes('feedback') || lowerMessage.includes('improve this') || lowerMessage.includes('make it better')) {
      return mockResponses['iteration'];
    }

    return mockResponses['default'];
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const responseContent = await generateResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
    } catch (error) {
      console.error('Error in handleSend:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const useStarterPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 bg-[#F4F4F4] border-r-2 border-black">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b-2 border-black">
            <h2 className="font-extrabold text-sm uppercase tracking-tight mb-4">Creative Voice</h2>
            <p className="text-xs text-[#666666] leading-relaxed">
              Practice using AI while maintaining your authentic creative voice.
            </p>
          </div>

          {/* Lab Info */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-tight mb-2">About</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Learn to analyze your unique voice, identify what makes it distinctive, and use AI as a tool while staying authentically you.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-tight mb-2">What You'll Practice</h3>
                <ul className="text-xs text-[#666666] space-y-2 leading-relaxed">
                  <li>• Voice analysis</li>
                  <li>• Style definition</li>
                  <li>• Authentic writing</li>
                  <li>• AI collaboration</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-tight mb-2">Tips</h3>
                <ul className="text-xs text-[#666666] space-y-2 leading-relaxed">
                  <li>• Share examples of your work</li>
                  <li>• Be specific about your medium</li>
                  <li>• Iterate to refine your voice</li>
                  <li>• Don't aim for perfection first try</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="border-t-2 border-black p-4">
            <p className="text-xs font-semibold uppercase tracking-tight text-[#666666]">
              Messages: {messages.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-white">
          <div>
            <h1 className="font-extrabold text-base uppercase tracking-tight">Creative Voice Practice</h1>
            <p className="text-xs text-[#666666]">Discover and amplify your unique voice</p>
          </div>
          <Sparkles className="w-5 h-5 text-[#FF6A00]" strokeWidth={2} />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="max-w-md">
                  <Sparkles className="w-12 h-12 mx-auto mb-6 text-[#FF6A00]" strokeWidth={2} />
                  <h4 className="text-lg font-extrabold uppercase tracking-tight text-black mb-3">
                    Discover Your Unique Voice
                  </h4>
                  <p className="text-sm text-[#666666] leading-relaxed mb-4">
                    Start by sharing examples of your work, or use one of the starter prompts below.
                    I'll help you identify what makes your voice unique and how to amplify it.
                  </p>
                  <p className="text-xs text-[#666666]">
                    Type your message below or click a starter prompt to begin
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-[#F4F4F4] border border-black' : 'bg-white'} p-4`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-xs font-extrabold uppercase tracking-tight">
                          {message.role === 'user' ? 'You' : 'Creative Voice'}
                        </p>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
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
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-black bg-white p-4">
          <div className="max-w-3xl mx-auto">
            {/* Starter Prompts */}
            {messages.length === 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#666666] mb-2 uppercase tracking-tight">Try asking:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {starterPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => useStarterPrompt(prompt)}
                      className="text-left text-xs px-3 py-2 bg-[#F4F4F4] border border-black hover:bg-[#FFE5D9] hover:border-[#FF6A00] transition-all"
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your work or ask about your creative voice..."
                className="flex-1 bg-[#F4F4F4] border border-black px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black max-h-32"
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-black text-white border border-black p-3 hover:bg-[#FF6A00] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white"
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
