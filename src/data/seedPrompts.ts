export const seedPrompts = [
  {
    title: "Email Enhancement Wizard",
    description: "Transform rough email drafts into polished, professional communications",
    prompt_text: "You are an expert email communicator. Your task is to take the following email draft and refine it into a clear, professional, and effective message.\n\nEMAIL DRAFT:\n{email_draft}\n\nTONE PREFERENCE:\n{tone}\n\nAUDIENCE:\n{audience}\n\nPlease enhance this email by:\n- Adding an appropriate greeting and closing\n- Improving clarity and structure\n- Adjusting the tone to be {tone}\n- Making the language concise and effective\n- Proper formatting\n\nProvide the enhanced email ready to send.",
    category: "writing",
    tags: ["email", "professional", "communication", "business"],
    use_case: "When you have a rough email draft that needs to be polished before sending"
  },
  {
    title: "Code Review Expert",
    description: "Get detailed code reviews with best practices and improvement suggestions",
    prompt_text: "You are an experienced software engineer performing a code review. Analyze the provided code for:\n\n1. **Correctness**: Does it work as intended?\n2. **Efficiency**: Are there performance improvements?\n3. **Readability**: Is the code clear and well-documented?\n4. **Best Practices**: Does it follow language conventions?\n5. **Security**: Are there any vulnerabilities?\n6. **Maintainability**: Is it easy to modify?\n\nProvide specific feedback with examples and suggestions for improvement. Be constructive and educational.",
    category: "coding",
    tags: ["code-review", "programming", "best-practices", "debugging"],
    use_case: "When you need feedback on your code before committing or deploying"
  },
  {
    title: "Meeting Agenda Architect",
    description: "Create structured, effective meeting agendas from basic meeting goals",
    prompt_text: "You are a productivity expert specializing in meeting facilitation. Create a comprehensive meeting agenda based on:\n\nMEETING PURPOSE:\n{meeting_purpose}\n\nDURATION:\n{duration}\n\nATTENDEES:\n{attendees}\n\nKEY TOPICS:\n{key_topics}\n\nCreate an agenda that includes:\n1. **Meeting Title & Clear Objective**\n2. **Time-boxed Agenda Items** with discussion and decision points\n3. **Pre-work** participants should prepare\n4. **Roles** (facilitator, note-taker)\n5. **Success Criteria**\n\nMake it actionable and time-efficient.",
    category: "strategy",
    tags: ["meetings", "productivity", "planning", "organization"],
    use_case: "When planning a meeting and need a structured agenda"
  },
  {
    title: "Data Analysis Storyteller",
    description: "Transform raw data findings into compelling narratives with insights",
    prompt_text: "You are a data analyst skilled at translating complex data into clear insights. Take the provided data or analysis and:\n\n1. **Executive Summary**: Key findings in 2-3 sentences\n2. **Main Insights**: 3-5 most important discoveries\n3. **Supporting Evidence**: Data points that prove each insight\n4. **Trends & Patterns**: What the data reveals over time\n5. **Actionable Recommendations**: What to do with this information\n6. **Visualizations**: Suggest charts/graphs that would help\n\nUse clear language accessible to non-technical stakeholders. Focus on 'so what?' - why the findings matter.",
    category: "analysis",
    tags: ["data", "insights", "reporting", "visualization"],
    use_case: "When you have data analysis results that need to be communicated to stakeholders"
  },
  {
    title: "Creative Brainstorm Facilitator",
    description: "Generate diverse, innovative ideas for any creative challenge",
    prompt_text: "You are a creative director leading an ideation session.\n\nCHALLENGE:\n{challenge}\n\nCONTEXT:\n{context}\n\nCONSTRAINTS:\n{constraints}\n\nTARGET AUDIENCE:\n{target_audience}\n\nGenerate creative ideas:\n1. **10 Conventional Ideas**: Solid, proven approaches\n2. **10 Unconventional Ideas**: Bold, innovative concepts\n3. **5 Combination Ideas**: Merge concepts from different domains\n4. **3 Moonshot Ideas**: Ambitious, breakthrough thinking\n\nFor each idea provide:\n- Brief description (1-2 sentences)\n- Why it could work for {target_audience}\n- Potential challenges\n- First steps to explore it\n\nConsider the constraints: {constraints}\nEncourage wild thinking - no idea is too unusual!",
    category: "creative",
    tags: ["brainstorming", "innovation", "ideation", "creativity"],
    use_case: "When you need fresh ideas and creative solutions for a project or problem"
  },
  {
    title: "Learning Path Designer",
    description: "Create personalized learning roadmaps for mastering any skill",
    prompt_text: "You are an expert learning designer. Create a comprehensive learning path for:\n\nSKILL TO LEARN:\n{skill}\n\nCURRENT LEVEL:\n{current_level}\n\nTARGET LEVEL:\n{target_level}\n\nTIME AVAILABLE:\n{time_available}\n\nLEARNING STYLE:\n{learning_style}\n\nCreate a learning path that includes:\n1. **Skill Assessment**: Gap analysis from current to target level\n2. **Learning Objectives**: Specific, measurable goals\n3. **Curriculum Phases**: Beginner → Intermediate → Advanced\n4. **Resources**: Books, courses, tutorials, practice projects\n5. **Timeline**: Realistic schedule based on {time_available}\n6. **Milestones**: How to measure progress\n7. **Practice Strategies**: How to reinforce learning\n8. **Common Pitfalls**: What to avoid\n\nTailor recommendations to their {learning_style} preference.",
    category: "learning",
    tags: ["education", "skill-development", "curriculum", "training"],
    use_case: "When you want to learn a new skill and need a structured roadmap"
  },
  {
    title: "Decision Framework Builder",
    description: "Create structured frameworks for making complex decisions",
    prompt_text: "You are a strategic advisor helping make an important decision.\n\nDECISION TO MAKE:\n{decision}\n\nOPTIONS BEING CONSIDERED:\n{options}\n\nKEY STAKEHOLDERS:\n{stakeholders}\n\nIMPORTANT FACTORS:\n{factors}\n\nTIME FRAME:\n{timeframe}\n\nBuild a decision framework:\n1. **Decision Statement**: Clearly reframe the decision\n2. **Stakeholder Analysis**: Priorities of {stakeholders}\n3. **Options Breakdown**: Analyze each option in {options}\n4. **Evaluation Criteria**:\n   - Must-haves based on {factors}\n   - Nice-to-haves\n   - Trade-offs\n5. **Scoring Matrix**: Rate each option\n6. **Risk Assessment**: What could go wrong\n7. **Time Horizon**: Consider {timeframe}\n8. **Recommendation**: With clear reasoning\n\nBe objective and thorough.",
    category: "strategy",
    tags: ["decision-making", "strategy", "analysis", "planning"],
    use_case: "When facing a complex decision and need a structured approach"
  },
  {
    title: "Documentation Generator",
    description: "Create clear, comprehensive documentation for code and projects",
    prompt_text: "You are a technical writer creating documentation. For the provided code or project, generate:\n\n1. **Overview**: What it does and why it exists\n2. **Getting Started**:\n   - Prerequisites\n   - Installation steps\n   - Basic usage example\n3. **Core Concepts**: Key terminology and architecture\n4. **API Reference**: Functions, parameters, return values\n5. **Examples**: Common use cases with code samples\n6. **Configuration**: Available options and settings\n7. **Troubleshooting**: Common issues and solutions\n8. **Contributing**: How others can help improve it\n\nUse clear language, code examples, and organize hierarchically.",
    category: "coding",
    tags: ["documentation", "technical-writing", "api", "guides"],
    use_case: "When you need to document code or a project for other developers"
  },
  {
    title: "Content Repurposing Strategist",
    description: "Transform one piece of content into multiple formats for different platforms",
    prompt_text: "You are a content strategist. Take the provided content and repurpose it into multiple formats:\n\n1. **Long-form Blog Post** (1500+ words): Deep dive with sections\n2. **Social Media Thread** (Twitter/X): 8-10 tweet thread\n3. **LinkedIn Article**: Professional perspective (500 words)\n4. **Email Newsletter**: Engaging format with CTA\n5. **Video Script**: 3-5 minute spoken format\n6. **Infographic Outline**: Key stats and visuals\n7. **Podcast Notes**: Conversational talking points\n\nAdapt the tone, format, and emphasis for each platform's audience. Maintain core message while optimizing for each medium.",
    category: "writing",
    tags: ["content-marketing", "social-media", "repurposing", "marketing"],
    use_case: "When you have content that needs to be adapted for multiple platforms"
  },
  {
    title: "Research Synthesis Expert",
    description: "Synthesize multiple research sources into coherent insights",
    prompt_text: "You are a research analyst synthesizing information from multiple sources. Create:\n\n1. **Research Question**: What we're trying to understand\n2. **Key Findings**:\n   - Main themes across sources\n   - Areas of agreement\n   - Contradictions or debates\n   - Gaps in current knowledge\n3. **Evidence Summary**: Support for each finding\n4. **Methodology Note**: How sources were selected/evaluated\n5. **Implications**: What this means for our context\n6. **Recommendations**: Next steps or actions\n7. **Further Research**: Unanswered questions\n\nCite sources appropriately. Be objective and note confidence levels.",
    category: "analysis",
    tags: ["research", "synthesis", "analysis", "academic"],
    use_case: "When you need to make sense of multiple research sources or articles"
  },
  {
    title: "Presentation Polisher",
    description: "Transform presentation outlines into compelling slide decks",
    prompt_text: "You are a presentation coach. Take the outline or draft and create a compelling presentation structure:\n\n1. **Opening Hook**: Grab attention in first 30 seconds\n2. **Key Message**: One clear takeaway\n3. **Slide-by-Slide Outline**:\n   - Title for each slide\n   - Main content/talking points\n   - Visual suggestions\n   - Estimated time\n4. **Storytelling Arc**: Beginning, middle, end\n5. **Data Visualization**: How to present numbers/charts\n6. **Transitions**: How slides connect\n7. **Closing CTA**: Strong ending and next steps\n8. **Backup Slides**: Anticipate questions\n\nFocus on clarity over complexity. Maximum impact, minimum text.",
    category: "writing",
    tags: ["presentations", "storytelling", "slides", "communication"],
    use_case: "When preparing a presentation and need help structuring the content"
  },
  {
    title: "User Story Writer",
    description: "Create clear, actionable user stories for product development",
    prompt_text: "You are a product manager writing user stories. For each feature, create:\n\n**User Story Format**:\n- As a [type of user]\n- I want [goal/desire]\n- So that [benefit/value]\n\n**Acceptance Criteria**:\n- Given [context]\n- When [action]\n- Then [outcome]\n\n**Additional Details**:\n- Priority (High/Medium/Low)\n- Story Points (complexity estimate)\n- Dependencies (what must happen first)\n- Edge Cases (unusual scenarios)\n- Success Metrics (how to measure impact)\n\nMake stories specific, testable, and independent when possible.",
    category: "strategy",
    tags: ["product-management", "agile", "user-stories", "requirements"],
    use_case: "When defining product features and need properly formatted user stories"
  },
  {
    title: "Prompt Engineering Coach",
    description: "Improve AI prompts for better results and consistency",
    prompt_text: "You are an expert in prompt engineering. Analyze the provided prompt and improve it by:\n\n1. **Clarity**: Make instructions unambiguous\n2. **Structure**: Organize logically with sections\n3. **Context**: Add relevant background\n4. **Constraints**: Define boundaries and limits\n5. **Output Format**: Specify desired structure\n6. **Examples**: Include sample inputs/outputs\n7. **Role Assignment**: Give AI clear persona\n8. **Quality Criteria**: How to evaluate success\n\nShow before/after comparison. Explain why each change improves results. Consider edge cases and potential misunderstandings.",
    category: "learning",
    tags: ["prompts", "ai", "prompt-engineering", "optimization"],
    use_case: "When your AI prompts aren't giving good results and need improvement"
  },
  {
    title: "Bug Report Formatter",
    description: "Create detailed, reproducible bug reports from issue descriptions",
    prompt_text: "You are a QA engineer creating a bug report. Format the issue as:\n\n**Bug ID**: [Auto-generated]\n**Title**: Clear, specific description\n**Severity**: Critical/High/Medium/Low\n**Priority**: P0/P1/P2/P3\n\n**Environment**:\n- OS/Browser/Device\n- Version numbers\n- Settings/configuration\n\n**Steps to Reproduce**:\n1. Numbered steps\n2. Be specific\n3. Include data used\n\n**Expected Behavior**: What should happen\n**Actual Behavior**: What actually happens\n**Screenshots/Videos**: Visual evidence\n**Workaround**: Temporary solution (if any)\n**Impact**: Who/what is affected\n\nMake it reproducible by engineers who didn't see the original issue.",
    category: "coding",
    tags: ["bug-reports", "qa", "testing", "debugging"],
    use_case: "When you encounter a software bug and need to report it properly"
  },
  {
    title: "Executive Summary Writer",
    description: "Distill long documents into concise executive summaries",
    prompt_text: "You are an executive communications specialist. Create an executive summary that:\n\n1. **One-Sentence Overview**: Entire document in one line\n2. **Key Findings** (3-5 bullets):\n   - Most important points only\n   - Action-oriented language\n   - Quantify when possible\n3. **Recommendation**: What to do next\n4. **Business Impact**: Why it matters (revenue, risk, etc.)\n5. **Timeline**: Critical dates or deadlines\n6. **Resources Required**: What's needed to execute\n\n**Guidelines**:\n- Maximum 1 page (250-300 words)\n- Assume reader has 60 seconds\n- No jargon unless essential\n- Bottom line up front\n\nBe decisive and specific.",
    category: "writing",
    tags: ["executive-summary", "business", "communication", "reports"],
    use_case: "When you need to summarize long reports for busy executives"
  }
];
