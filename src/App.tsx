import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ToastProvider } from './contexts/ToastContext';
import { BillingProvider } from './contexts/BillingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Pillars from './components/Pillars';
import FeaturedPaths from './components/FeaturedPaths';
import FluencySpectrum from './components/FluencySpectrum';
import PricingSection from './components/PricingSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LabsPage from './components/LabsPage';
import LabSandbox from './components/LabSandbox';
import PathPage from './components/PathPage';
import LessonViewer from './components/LessonViewer';
import PathsListPage from './components/PathsListPage';
import NetworkPage from './components/NetworkPage';
import PromptLibrary from './components/PromptLibrary';
import { BadgeDisplay } from './components/BadgeDisplay';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import JournalPage from './components/JournalPage';
import ProjectsPage from './components/ProjectsPage';
import CommandCenter from './components/CommandCenter';
import AdminPortal from './components/AdminPortal';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import BillingPage from './components/BillingPage';
import HelpCenter from './components/HelpCenter';
import { saveAppState, loadAppState, clearAppState } from './utils/appStateStorage';

type View = 'home' | 'auth' | 'dashboard' | 'labs' | 'lab-sandbox' | 'path' | 'lesson' | 'paths-list' | 'network' | 'prompts' | 'badges' | 'profile' | 'settings' | 'journal' | 'projects' | 'command-center' | 'admin' | 'billing' | 'terms' | 'privacy' | 'help';

function AppContent() {
  const { user, loading } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [view, setView] = useState<View>('home');
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [pathRefreshKey, setPathRefreshKey] = useState<number>(0);

  // Load saved state on mount (only for authenticated users)
  useEffect(() => {
    if (!loading && user && !initialized) {
      const savedState = loadAppState(user.id);
      if (savedState) {
        if (savedState.view) setView(savedState.view);
        if (savedState.selectedLab) setSelectedLab(savedState.selectedLab);
        if (savedState.selectedPath) setSelectedPath(savedState.selectedPath);
        if (savedState.selectedModule) setSelectedModule(savedState.selectedModule);
        if (savedState.selectedLesson) setSelectedLesson(savedState.selectedLesson);
      }
      setInitialized(true);
    } else if (!loading && !user) {
      clearAppState();
      setInitialized(true);
    }
  }, [user, loading, initialized]);

  // Save state whenever it changes (only for authenticated users)
  // Don't save state for informational pages like terms/privacy/billing
  useEffect(() => {
    if (user && initialized && view !== 'terms' && view !== 'privacy' && view !== 'billing') {
      saveAppState({
        view,
        selectedLab,
        selectedPath,
        selectedModule,
        selectedLesson,
      }, user.id);
    }
  }, [user, initialized, view, selectedLab, selectedPath, selectedModule, selectedLesson]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
          <p className="mt-4 font-semibold">LOADING...</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (view === 'lesson') {
      return (
        <LessonViewer
          pathId={selectedPath}
          moduleId={selectedModule}
          lessonId={selectedLesson}
          onBack={() => setView('path')}
          onComplete={() => {
            setPathRefreshKey(prev => prev + 1);
            setView('path');
          }}
          onPromptsClick={() => setView('prompts')}
          onCommandCenterClick={() => setView('command-center')}
        />
      );
    }

    if (view === 'path') {
      return (
        <PathPage
          key={pathRefreshKey}
          pathId={selectedPath}
          onBack={() => setView('paths-list')}
          onLessonSelect={(moduleId, lessonId) => {
            setSelectedModule(moduleId);
            setSelectedLesson(lessonId);
            setView('lesson');
          }}
        />
      );
    }

    if (view === 'paths-list') {
      return (
        <PathsListPage
          onBack={() => setView('dashboard')}
          onPathSelect={(pathId) => {
            setSelectedPath(pathId);
            setView('path');
          }}
        />
      );
    }

    if (view === 'lab-sandbox') {
      return (
        <LabSandbox
          labId={selectedLab}
          onBack={() => setView('labs')}
          onLabSwitch={(labId) => {
            setSelectedLab(labId);
          }}
        />
      );
    }

    if (view === 'labs') {
      return (
        <LabsPage
          onLabSelect={(labId) => {
            setSelectedLab(labId);
            setView('lab-sandbox');
          }}
          onBack={() => setView('dashboard')}
        />
      );
    }

    if (view === 'network') {
      return (
        <NetworkPage
          onBack={() => setView('dashboard')}
        />
      );
    }

    if (view === 'prompts') {
      return (
        <PromptLibrary
          onBack={() => setView('dashboard')}
        />
      );
    }

    if (view === 'badges') {
      return <BadgeDisplay onBack={() => setView('dashboard')} />;
    }

    if (view === 'profile') {
      return <ProfilePage onBack={() => setView('dashboard')} />;
    }

    if (view === 'settings') {
      return <SettingsPage onBack={() => setView('dashboard')} />;
    }

    if (view === 'journal') {
      return <JournalPage onBack={() => setView('dashboard')} />;
    }

    if (view === 'projects') {
      return <ProjectsPage onBack={() => setView('dashboard')} />;
    }

    if (view === 'command-center') {
      return (
        <CommandCenter
          onBack={() => setView('dashboard')}
          onLessonClick={(pathId, lessonId) => {
            setSelectedPath(pathId);
            setSelectedLesson(lessonId);
            const match = lessonId.match(/lesson-(\d+)-\d+/);
            const moduleId = match ? `module-${match[1]}` : 'module-1';
            setSelectedModule(moduleId);
            setView('lesson');
          }}
        />
      );
    }

    if (view === 'admin') {
      return <AdminPortal onBackToPlatform={() => setView('dashboard')} />;
    }

    if (view === 'billing') {
      return <BillingPage onBack={() => setView('dashboard')} />;
    }

    return (
      <Dashboard
        onLabsClick={() => setView('labs')}
        onNetworkClick={() => setView('network')}
        onPromptsClick={() => setView('prompts')}
        onBadgesClick={() => setView('badges')}
        onProfileClick={() => setView('settings')}
        onJournalClick={() => setView('journal')}
        onProjectsClick={() => setView('projects')}
        onCommandCenterClick={() => setView('command-center')}
        onPathsListClick={() => setView('paths-list')}
        onAdminClick={() => setView('admin')}
        onBillingClick={() => setView('billing')}
        onHelpClick={() => setView('help')}
        onPathSelect={(pathId) => {
          setSelectedPath(pathId);
          setView('path');
        }}
        onLabSelect={(labId) => {
          setSelectedLab(labId);
          setView('lab-sandbox');
        }}
      />
    );
  }

  if (view === 'auth') {
    return (
      <AuthPage
        onSuccess={() => setView('home')}
        onTermsClick={() => setView('terms')}
        onPrivacyClick={() => setView('privacy')}
      />
    );
  }

  if (view === 'terms') {
    return <TermsPage onBack={() => setView('home')} />;
  }

  if (view === 'privacy') {
    return <PrivacyPage onBack={() => setView('home')} />;
  }

  if (view === 'help') {
    return <HelpCenter onBack={() => setView(user ? 'dashboard' : 'home')} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <Navigation
        onAuthClick={() => setView('auth')}
        onPathsClick={() => {
          const pathsSection = document.getElementById('paths');
          pathsSection?.scrollIntoView({ behavior: 'smooth' });
        }}
        onLabsClick={() => {
          const labsSection = document.getElementById('labs');
          labsSection?.scrollIntoView({ behavior: 'smooth' });
        }}
        onPricingClick={() => {
          const pricingSection = document.getElementById('pricing');
          pricingSection?.scrollIntoView({ behavior: 'smooth' });
        }}
        onCommunityClick={() => {
          const communitySection = document.getElementById('community');
          communitySection?.scrollIntoView({ behavior: 'smooth' });
        }}
        onHelpClick={() => setView('help')}
      />
      <Hero
        onStartJourney={() => setView('auth')}
        onExploreLabs={() => {
          const labsSection = document.getElementById('labs');
          labsSection?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <Pillars />
      <FeaturedPaths />
      <FluencySpectrum />
      <PricingSection onGetStarted={() => setView('auth')} />
      <CTASection onStartJourney={() => setView('auth')} />
      <Footer
        onTermsClick={() => setView('terms')}
        onPrivacyClick={() => setView('privacy')}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <AuthProvider>
          <BillingProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </BillingProvider>
        </AuthProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App;
