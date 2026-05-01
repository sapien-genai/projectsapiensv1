export interface WritingStep {
  stepId: string;
  title: string;
  instruction: string;
  mode: string;
  promptTemplate: string;
}

export interface WritingMission {
  missionId: string;
  title: string;
  goal: string;
  intro: string;
  exampleInput: string;
  steps: WritingStep[];
  expectedOutput: string;
  keyLesson: string;
  challenge: string;
}

export const writingSystemsPath = {
  pathId: 'ai-writing-systems',
  title: 'AI Writing Systems',
  subtitle: 'Turn rough ideas into clear, compelling, high-impact writing using AI.',
  level: 'Beginner to Intermediate',
  estimatedTime: '45–60 minutes',
  description:
    'Build repeatable AI writing workflows for emails, content, messaging, and professional communication.',
  primaryLab: 'writing-lab',
  skills: ['Clarity', 'Tone control', 'Prompt chaining', 'Content repurposing', 'AI-assisted editing'],
  missions: [
    {
      missionId: 'raw-ideas-to-clear-writing',
      title: 'Turn Raw Ideas into Clear Writing',
      goal: 'Turn messy thoughts into clean, organized writing.',
      intro:
        'Most people struggle with writing because their thoughts are messy — not because they are bad writers. In this mission, you will use AI to turn raw thinking into structured communication.',
      exampleInput:
        'i want to send an email to a client about delays but also reassure them and not sound unprofessional and also explain we are working on improvements',
      steps: [
        {
          stepId: 'dump-thoughts',
          title: 'Dump Your Thoughts',
          instruction: 'Paste messy thoughts into the Writing Lab.',
          mode: 'freeform',
          promptTemplate:
            'Take the following rough thoughts and turn them into a clear, structured message:\n\n{{user_input}}',
        },
        {
          stepId: 'make-clearer',
          title: 'Make It Clearer',
          instruction: 'Use the Clearer mode to improve readability.',
          mode: 'rewrite_clearer',
          promptTemplate: 'Rewrite this to be clearer and easier to understand:\n\n{{previous_output}}',
        },
        {
          stepId: 'make-professional',
          title: 'Polish the Tone',
          instruction: 'Use Professional mode to make it confident and client-ready.',
          mode: 'rewrite_more_professional',
          promptTemplate:
            'Make this sound more professional and confident, while keeping the message intact:\n\n{{previous_output}}',
        },
      ],
      expectedOutput: 'A polished, professional message ready to send.',
      keyLesson: 'Writing is not about getting it perfect the first time. It is about refining in steps.',
      challenge: 'Take a real message you have been putting off and run it through this workflow.',
    },
    {
      missionId: 'rewrite-for-impact',
      title: 'Rewrite for Impact',
      goal: 'Learn how tone, length, and persuasion change the effect of your writing.',
      intro:
        'The same message can be interpreted very differently depending on how it is written. In this mission, you will learn how to control tone and impact using AI.',
      exampleInput: 'We launched a new feature that helps users organize their tasks better.',
      steps: [
        {
          stepId: 'make-clearer',
          title: 'Make It Clearer',
          instruction: 'Improve clarity without changing the meaning.',
          mode: 'rewrite_clearer',
          promptTemplate: 'Rewrite this to be clearer:\n\n{{user_input}}',
        },
        {
          stepId: 'make-shorter',
          title: 'Make It Shorter',
          instruction: 'Compress the message while preserving the point.',
          mode: 'rewrite_shorter',
          promptTemplate:
            'Rewrite this to be shorter while keeping the core message:\n\n{{previous_output}}',
        },
        {
          stepId: 'make-persuasive',
          title: 'Make It More Persuasive',
          instruction: 'Make the message more compelling.',
          mode: 'rewrite_more_persuasive',
          promptTemplate:
            'Rewrite this to be more persuasive and compelling:\n\n{{previous_output}}',
        },
        {
          stepId: 'generate-variations',
          title: 'Generate Variations',
          instruction: 'Create multiple versions for different contexts.',
          mode: 'freeform',
          promptTemplate:
            'Create 5 variations of this message with different tones: excited, professional, bold, casual, and persuasive.\n\n{{previous_output}}',
        },
      ],
      expectedOutput: 'Multiple improved versions of the same message.',
      keyLesson: 'Writing is adjustable. The best writers iterate.',
      challenge: 'Take something you wrote recently and generate 5 improved versions.',
    },
    {
      missionId: 'build-content-engine',
      title: 'Build a Content Engine',
      goal: 'Create a repeatable system for generating content at scale.',
      intro:
        'Instead of writing one piece at a time, you can build a system that produces content consistently. This is how professionals use AI.',
      exampleInput: 'Why consistency matters when building a startup',
      steps: [
        {
          stepId: 'start-with-idea',
          title: 'Start With an Idea',
          instruction: 'Enter a raw idea or topic.',
          mode: 'freeform',
          promptTemplate:
            'Turn this idea into a structured post with an intro, key points, and conclusion:\n\n{{user_input}}',
        },
        {
          stepId: 'improve-clarity',
          title: 'Improve the Draft',
          instruction: 'Make the post clearer and easier to follow.',
          mode: 'rewrite_clearer',
          promptTemplate:
            'Rewrite this post to be clearer and better structured:\n\n{{previous_output}}',
        },
        {
          stepId: 'professional-polish',
          title: 'Polish the Voice',
          instruction: 'Make the post more professional and publish-ready.',
          mode: 'rewrite_more_professional',
          promptTemplate:
            'Make this post sound more polished and professional:\n\n{{previous_output}}',
        },
        {
          stepId: 'repurpose-content',
          title: 'Repurpose the Content',
          instruction: 'Turn one idea into multiple useful assets.',
          mode: 'freeform',
          promptTemplate:
            'Create:\n- 3 short social posts\n- 2 LinkedIn versions\n- 5 title options\n- 1 short summary\n\nBased on this content:\n\n{{previous_output}}',
        },
      ],
      expectedOutput: 'A full post, social variations, title ideas, and a short summary.',
      keyLesson: 'AI is not just a writing tool. It is a system multiplier.',
      challenge: 'Use this workflow to create one week of content ideas.',
    },
  ] as WritingMission[],
};

export const modeLabels: Record<string, string> = {
  freeform: 'Freeform',
  rewrite_clearer: 'Make Clearer',
  rewrite_shorter: 'Make Shorter',
  rewrite_more_professional: 'Professional',
  rewrite_more_persuasive: 'Persuasive',
  summarize: 'Summarize',
  title_suggestions: 'Title Ideas',
};
