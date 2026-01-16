# Project Sapiens

An AI mastery learning platform designed to transform users from AI Users to AI Architects through structured learning paths, interactive labs, and practical challenges.

## What is Project Sapiens?

Project Sapiens is a comprehensive educational platform focused on AI fluency development. It provides:

- **Structured Learning Paths**: Five core paths covering AI fundamentals, prompt engineering, workflow automation, creative applications, and strategic implementation
- **Interactive AI Labs**: Hands-on environments for writing, analysis, creative work, strategy, and coding with AI assistance
- **Progress Tracking**: AI Fluency Spectrum system that tracks user progression from Level 1 (Aware) to Level 5 (Architect)
- **Community Features**: Intentional Network for peer collaboration, mentorship matching, and project sharing
- **Command Center**: Integrated task management, calendar, and project organization tools
- **Badge System**: Gamified achievements for completing lessons, labs, and challenges

The platform emphasizes practical, hands-on learning with real-world AI applications rather than theoretical knowledge alone.

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication (email/password)
  - Real-time subscriptions
  - Edge Functions (serverless)
- **Supabase Edge Functions** - Serverless API endpoints (Deno runtime)

### AI Integration
- **Google Gemini API** - AI model for lab interactions (gemini-2.0-flash-exp)

## How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for database)
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-sapiens
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

**How to get these values:**
- **Supabase credentials**: Sign up at [supabase.com](https://supabase.com), create a project, and find your URL and anon key in Project Settings → API
- **Gemini API key**: Get a free key at [Google AI Studio](https://makersuite.google.com/app/apikey)

4. Run database migrations:

The database schema is located in `supabase/migrations/`. If using Supabase CLI:
```bash
supabase db push
```

Or apply migrations manually through the Supabase dashboard SQL editor.

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Where AI/Model Calls Live

All AI model interactions are centralized in **Supabase Edge Functions** for security and rate limiting:

### Edge Function: `lab-ai-chat`
**Location**: `supabase/functions/lab-ai-chat/index.ts`

**Purpose**: Handles all conversational AI interactions in the lab environments

**Features**:
- Supports 5 lab types: writing, analysis, creative, strategy, and code
- Uses Google Gemini 2.0 Flash Exp model
- Maintains conversation history for context-aware responses
- Lab-specific system prompts for specialized assistance
- Plain text formatting (no markdown) for consistent UI rendering

**API Endpoint**:
```
POST https://your-project.supabase.co/functions/v1/lab-ai-chat
```

**Request Body**:
```json
{
  "prompt": "User's message",
  "labId": "writing-lab",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "AI response" }
  ]
}
```

**Frontend Integration**:
The edge function is called from:
- `src/components/LabSandbox.tsx` - Main lab interface
- `src/components/PromptPracticeChat.tsx` - Prompt practice exercises

**Why Edge Functions?**
- Keeps API keys secure (never exposed to client)
- Centralized rate limiting and error handling
- Consistent AI behavior across the platform
- Easy to monitor and debug server-side

## Core vs Experimental Features

### Core Features (Production-Ready)
These features are fully implemented, tested, and form the foundation of the platform:

- **Authentication System** - Email/password auth with Supabase
- **Learning Paths** - 5 structured paths with lessons and checkpoints
- **Lesson Viewer** - Rich lesson content with journal entries
- **Progress Tracking** - Fluency spectrum and path progression
- **Badge System** - Achievements and gamification
- **User Profiles** - Public profiles with bios, strengths, and activity
- **Command Center** - Task management and calendar
- **Forms System** - Interactive priority matrices and project planning
- **Database Schema** - Comprehensive PostgreSQL schema with RLS policies
- **Settings & Preferences** - Dark mode, display name, bio editing

### Experimental Features (AI Layer)
These features involve AI and are under active development:

#### 1. AI Lab Environments (EXPERIMENTAL)
**Status**: Beta - Functional but evolving

**What it does**:
- Provides 5 specialized AI assistants for different tasks
- Maintains conversation context within sessions
- Offers lab-specific guidance and outputs

**Known limitations**:
- Conversation history not persisted between sessions
- No token/cost tracking
- Limited context window (2048 tokens)
- No streaming responses (full response only)

**Future enhancements planned**:
- Persistent conversation storage in database
- Streaming responses for better UX
- Multi-turn conversation improvements
- Lab session saving and sharing
- Usage analytics and insights

#### 2. Prompt Practice Chat (EXPERIMENTAL)
**Status**: Alpha - Basic functionality

**What it does**:
- Interactive prompt engineering practice
- Real-time feedback on prompt quality
- Structured exercises for skill building

**Known limitations**:
- No evaluation of prompt effectiveness
- No automated feedback system
- Limited exercise variety

**Future enhancements planned**:
- AI-powered prompt analysis and scoring
- Personalized exercise recommendations
- Progressive difficulty adjustment
- Community prompt sharing

#### 3. Network AI Matching (PLANNED)
**Status**: Not yet implemented

**Vision**:
- AI-powered mentor/mentee matching based on skills and goals
- Intelligent project collaboration suggestions
- Automated connection recommendations

### Why These Are Experimental

The AI conversational layer is considered experimental because:

1. **Cost Management** - AI API calls have associated costs that need monitoring
2. **Quality Control** - AI responses require ongoing prompt engineering and testing
3. **User Experience** - Chat interfaces need refinement based on user feedback
4. **Scalability** - Performance under load needs validation
5. **Safety** - Content moderation and abuse prevention in development

As these features mature and prove their value, they will be promoted to core status.

## Project Structure

```
project-sapiens/
├── src/
│   ├── components/        # React components
│   │   ├── admin/         # Admin portal components
│   │   ├── LabSandbox.tsx # AI lab interface (EXPERIMENTAL)
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   └── ...
│   ├── contexts/          # React contexts (Auth, Toast, DarkMode)
│   ├── data/              # Static data (paths, badges, prompts)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Library configurations (Supabase client)
│   └── utils/             # Utility functions
├── supabase/
│   ├── migrations/        # Database schema migrations
│   └── functions/         # Edge Functions (AI endpoints)
│       └── lab-ai-chat/   # AI chat handler (EXPERIMENTAL)
├── .env                   # Environment variables (not committed)
└── package.json          # Dependencies and scripts
```

## Key Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
```

## Contributing

This is an educational platform in active development. Contributions are welcome, especially for:

- Improving the experimental AI features
- Adding new lesson content
- Enhancing the UI/UX
- Writing tests
- Documentation improvements

## License

[Add your license here]

## Support

For issues, questions, or feature requests, please open an issue on GitHub or contact the development team.

---

Built with care for the future of AI education.
