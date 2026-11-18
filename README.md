# Project Sapiens

Project Sapiens, Inc. is an independent AI consultancy and product studio founded by Tony Marks. We turn OpenAI technology into practical products, agents, and voice experiences, connecting strategy, design, development, and evaluation from the first useful prototype to production.

We work with founders, product teams, and established organizations through focused projects, fractional AI leadership, and ongoing advisory. Project Sapiens is a member of the OpenAI Partner Network.

## What we do

- **[Custom AI agent development](https://www.projectsapiens.ai/custom-ai-agents/)**: Knowledge assistants, connected workflow agents, and document workflows built around approved information and useful tasks.
- **[Voice AI development](https://www.projectsapiens.ai/voice-ai-development/)**: Custom voice agents and conversational interfaces that connect spoken requests to information, actions, and human handoff.
- **[AI brand visibility](https://www.projectsapiens.ai/ai-visibility/)**: Evidence-based reports on how AI assistants recognize, recommend, and describe a business, with a prioritized plan for improvement.
- **[Strategy and advisory](https://www.projectsapiens.ai/work-with-us/)**: Product definition, evaluation, fractional AI leadership, and ongoing support for decisions about AI.

Visit [projectsapiens.ai](https://www.projectsapiens.ai/) for current services, [meet Tony Marks](https://www.projectsapiens.ai/about/), or [get in touch](https://www.projectsapiens.ai/work-with-us/#contact).

## What this repository contains

This repository powers the public company website and the Project Sapiens academy. Company pages are pre-rendered so their content is available to readers and crawlers without JavaScript.

The **academy is a learning product within Project Sapiens**, not a description of the company's entire business. Its features include guided lessons, hands-on labs, prompt practice, progress tracking, and personal workspaces. Academy development notes and earlier training go-to-market plans describe that product; the company website is the source for current service positioning.

For the academy's earlier pilot planning, see [Small Team AI Fluency GTM Plan](./SMALL_TEAM_AI_FLUENCY_GTM.md).

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **Supabase** - Backend-as-a-service
  - PostgreSQL database
  - Row Level Security (RLS) for authorization
  - Edge Functions for serverless API endpoints
  - Real-time subscriptions

### Infrastructure
- Git-based workflow
- Environment variables for configuration
- Migration-based database schema management

## How to Run Locally

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (free tier works)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project-sapiens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   Get these values from your Supabase project dashboard at: `Settings > API`

   **For AI Edge Function**: Set the `GEMINI_API_KEY` in Supabase Dashboard under `Edge Functions > Secrets` to enable AI features. Also update the CORS allowlist in `supabase/functions/lab-ai-chat/index.ts` with your production domain.

4. **Run database migrations**

   The migrations in `supabase/migrations/` need to be applied to your Supabase database. You can use the Supabase dashboard SQL editor to run them in order, or use the Supabase CLI if you have it configured.

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

6. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

### Optional: Seed Data

To populate the database with sample badges and prompts, you can run the seed utilities after signing up for an account:
- Badge seeding: Uses `src/utils/seedBadges.ts`
- Prompt library: Uses `src/utils/seedPromptLibrary.ts`

## Where AI/Model Calls Live

### Current AI Integration

**Supabase Edge Function**: `supabase/functions/lab-ai-chat/index.ts`

This is the primary endpoint for AI interactions. It handles:
- Chat messages in the Lab Sandbox
- AI-guided exercises and feedback
- Prompt practice conversations

**Security Features:**
- JWT authentication required (validates Supabase access tokens)
- CORS allowlist (localhost + production domain)
- Rate limiting (20 requests/minute per user)
- Request timeouts (20 seconds) with 2 retries
- Sanitized error messages (no internal details leaked to clients)

The edge function is designed to proxy external AI API calls securely, keeping API keys server-side. Currently integrated with Google's Gemini API.

### Frontend AI Components

Components that interact with AI functionality:
- `src/components/LabSandbox.tsx` - Main AI lab interface
- `src/components/PromptPracticeChat.tsx` - Conversational prompt practice
- `src/components/PromptTester.tsx` - Prompt testing and iteration
- `src/components/CreativeVoicePractice.tsx` - Creative exercises with AI feedback

### Integration Points

The edge function currently uses Google Gemini. To switch providers:

1. Set up API credentials in Supabase Edge Function secrets
2. Update `supabase/functions/lab-ai-chat/index.ts` with provider SDK
3. Configure streaming responses for real-time chat UX (if supported)

**Important:** The edge function requires a valid Supabase JWT token. Frontend components automatically retrieve the user's access token and pass it in the Authorization header.

## Core vs Experimental Features

### 🏗️ Core Features (Production-Ready)

These are stable, tested, and ready for users:

- **Authentication System** - Email/password auth via Supabase
- **Learning Paths & Lessons** - Structured curriculum with 5 main paths
- **Progress Tracking** - User path completion, lesson tracking, streaks
- **Badge System** - 30+ achievement badges with unlock conditions
- **Baseline Assessment** - Entry evaluation and spectrum placement
- **Journal Entries** - Reflective writing for each lesson
- **Command Center** - Project management, tasks, calendar
- **Prompt Library** - Curated prompts with categories and practice exercises
- **Network Features** - Project sharing, user profiles, connections
- **Admin Portal** - User management, analytics, support tickets
- **Mobile Responsive** - Mobile-first design throughout

### 🧪 Experimental Features (In Development)

These features involve AI model calls and are actively being developed:

- **AI Lab Chat** - Real-time conversational AI in sandbox environments
- **Prompt Practice with AI** - Interactive prompt refinement with AI feedback
- **Creative Voice Development** - AI-guided exercises for developing unique voice
- **Adaptive Learning Paths** - AI-recommended next steps based on progress
- **Intelligent Feedback** - Context-aware suggestions on projects and exercises

**Why these are experimental:**
- Require external API integrations (cost implications)
- Need usage monitoring and rate limiting
- Conversation quality and safety guardrails in progress
- Model selection and prompt engineering still being optimized

The experimental AI layer is designed to be conversational and adaptive, providing personalized guidance as users progress through the curriculum. Once fully implemented and tested, these features will graduate to core status.

## Project Structure

```
/src
  /components       # React components
    /admin         # Admin portal components
  /contexts        # React context providers (auth, theme, toast)
  /data            # Static data (badges, lessons, paths, prompts)
  /hooks           # Custom React hooks
  /lib             # Third-party integrations (Supabase client)
  /utils           # Utility functions and seeding scripts

/supabase
  /functions       # Edge functions (serverless API)
  /migrations      # Database schema migrations

```

## Security

This project implements multiple security layers:

### Database Security
- **Row Level Security (RLS)** enabled on all tables
- Private projects only visible to owners (`is_public` flag enforced)
- User analytics prevents ID spoofing (users can only insert their own data)
- SECURITY DEFINER functions have explicit `search_path = public` set

### API Security
- **AI Edge Function** requires JWT authentication
- CORS restricted to localhost and production domain (update in code)
- Rate limiting: 20 requests/minute per authenticated user
- Request timeouts (20s) with automatic retries
- Error messages sanitized (no internal details exposed)

### Application Security
- Session-based authentication via Supabase
- localStorage state persistence (user-specific, expires after 24h)
- Protected routes require authentication

## Contributing

This project follows a migration-based database workflow. All schema changes must be applied using the `mcp__supabase__apply_migration` tool with:
- Descriptive filename in snake_case
- Detailed markdown summary at the top
- Safe SQL with `IF EXISTS` / `IF NOT EXISTS` checks
- Proper Row Level Security policies for all tables

## License

[Add your license information]

## Support

[Add support/contact information]
