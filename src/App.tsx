import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ToastProvider } from './contexts/ToastContext';
import { BillingProvider } from './contexts/BillingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAdminStatus } from './hooks/useAdminStatus';
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
import AboutPage from './components/AboutPage';
import { saveAppState, loadAppState, clearAppState } from './utils/appStateStorage';

type View = 'home' | 'auth' | 'dashboard' | 'labs' | 'lab-sandbox' | 'path' | 'lesson' | 'paths-list' | 'network' | 'prompts' | 'badges' | 'profile' | 'settings' | 'journal' | 'projects' | 'command-center' | 'admin' | 'billing' | 'terms' | 'privacy' | 'help' | 'about';

function AppContent() {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading, error: adminError } = useAdminStatus();
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
  // Don't save state for informational pages like terms/privacy/billing/about/help
  useEffect(() => {
    if (user && initialized && view !== 'terms' && view !== 'privacy' && view !== 'billing' && view !== 'about' && view !== 'help') {
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
      // Admin route guard
      if (adminLoading) {
        return (
          <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
              <p className="mt-4 text-[#57524D] font-semibold">Verifying access...</p>
            </div>
          </div>
        );
      }

      if (!isAdmin) {
        return (
          <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center p-4">
            <div className="max-w-md text-center p-8 bg-white border border-black shadow-[4px_4px_0px_#000000]">
              <div className="mb-4">
                <Lock className="w-16 h-16 mx-auto text-[#57524D]" />
              </div>
              <h1 className="font-extrabold text-2xl uppercase tracking-tight mb-2">
                ACCESS DENIED
              </h1>
              <p className="text-[#57524D] mb-4">
                You do not have permission to access the admin portal.
              </p>
              {adminError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm text-left rounded">
                  <strong>Error:</strong> {adminError}
                </div>
              )}
              {user && (
                <div className="mb-6 p-3 bg-gray-50 border border-gray-200 text-gray-700 text-xs text-left rounded">
                  <div className="font-mono break-all">
                    <strong>User ID:</strong><br />
                    {user.id}
                  </div>
                  <div className="mt-2">
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div className="mt-2 text-gray-500">
                    Check browser console for detailed logs
                  </div>
                </div>
              )}
              <button
                onClick={() => setView('dashboard')}
                className="bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                BACK TO DASHBOARD
              </button>
            </div>
          </div>
        );
      }

      return <AdminPortal onBackToPlatform={() => setView('dashboard')} />;
    }

    if (view === 'billing') {
      return <BillingPage onBack={() => setView('dashboard')} />;
    }

    if (view === 'help') {
      return <HelpCenter onBack={() => setView('dashboard')} onNavigate={(view) => setView(view)} />;
    }

    if (view === 'about') {
      return <AboutPage onBack={() => setView('dashboard')} />;
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
    return <HelpCenter onBack={() => setView(user ? 'dashboard' : 'home')} onNavigate={(view) => setView(view)} />;
  }

  if (view === 'about') {
    return <AboutPage onBack={() => setView('home')} />;
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
