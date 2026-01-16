type View = 'home' | 'auth' | 'dashboard' | 'labs' | 'lab-sandbox' | 'path' | 'lesson' | 'paths-list' | 'network' | 'prompts' | 'badges' | 'profile' | 'settings' | 'journal' | 'projects' | 'command-center' | 'admin';

interface AppState {
  view: View;
  selectedLab: string;
  selectedPath: string;
  selectedModule: string;
  selectedLesson: string;
}

const STORAGE_KEY = 'project-sapiens-app-state';
const STORAGE_VERSION = 1;

interface StoredState extends AppState {
  version: number;
  timestamp: number;
  userId: string;
}

export function saveAppState(state: AppState, userId: string): void {
  try {
    const storedState: StoredState = {
      ...state,
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      userId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedState));
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
}

export function loadAppState(userId: string): Partial<AppState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed: StoredState = JSON.parse(stored);

    // Validate version
    if (parsed.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Validate userId matches
    if (parsed.userId !== userId) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Expire after 24 hours
    const age = Date.now() - parsed.timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Return only the app state, not metadata
    const { view, selectedLab, selectedPath, selectedModule, selectedLesson } = parsed;
    return { view, selectedLab, selectedPath, selectedModule, selectedLesson };
  } catch (error) {
    console.error('Failed to load app state:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearAppState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear app state:', error);
  }
}
