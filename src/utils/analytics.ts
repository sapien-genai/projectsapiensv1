import { supabase } from '../lib/supabase';

export type AnalyticsEventType =
  | 'user_login'
  | 'user_logout'
  | 'user_signup'
  | 'lesson_started'
  | 'lesson_completed'
  | 'lesson_viewed'
  | 'lab_started'
  | 'lab_completed'
  | 'lab_experiment_created'
  | 'badge_earned'
  | 'path_started'
  | 'path_completed'
  | 'profile_updated'
  | 'project_created'
  | 'project_shared'
  | 'project_liked'
  | 'prompt_created'
  | 'prompt_used'
  | 'network_connection_created'
  | 'mentorship_request_created'
  | 'support_ticket_created'
  | 'page_view'
  | 'feature_used'
  | 'error_occurred'
  | 'search_performed'
  | 'filter_applied'
  | 'export_data'
  | 'settings_changed';

interface AnalyticsEventData {
  [key: string]: any;
}

class AnalyticsTracker {
  private sessionId: string;
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = true;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private getUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  }

  async trackEvent(
    eventType: AnalyticsEventType,
    eventData: AnalyticsEventData = {}
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const analyticsPayload = {
        user_id: user?.id || null,
        event_type: eventType,
        event_data: eventData,
        session_id: this.sessionId,
        ip_address: null,
        user_agent: this.getUserAgent(),
      };

      const { error } = await supabase
        .from('user_analytics')
        .insert([analyticsPayload]);

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  trackPageView(pageName: string, metadata: AnalyticsEventData = {}): void {
    this.trackEvent('page_view', {
      page: pageName,
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      ...metadata,
    });
  }

  trackUserLogin(method: string = 'email'): void {
    this.trackEvent('user_login', { method });
  }

  trackUserSignup(method: string = 'email'): void {
    this.trackEvent('user_signup', { method });
  }

  trackUserLogout(): void {
    this.trackEvent('user_logout', {});
  }

  trackLessonStarted(pathId: string, lessonId: string): void {
    this.trackEvent('lesson_started', { path_id: pathId, lesson_id: lessonId });
  }

  trackLessonCompleted(pathId: string, lessonId: string, timeSpent?: number): void {
    this.trackEvent('lesson_completed', {
      path_id: pathId,
      lesson_id: lessonId,
      time_spent_seconds: timeSpent,
    });
  }

  trackLabStarted(labId: string): void {
    this.trackEvent('lab_started', { lab_id: labId });
  }

  trackLabCompleted(labId: string, experimentCount: number): void {
    this.trackEvent('lab_completed', {
      lab_id: labId,
      experiment_count: experimentCount,
    });
  }

  trackBadgeEarned(badgeId: string, badgeName: string): void {
    this.trackEvent('badge_earned', { badge_id: badgeId, badge_name: badgeName });
  }

  trackProjectCreated(projectId: string, projectType: string): void {
    this.trackEvent('project_created', { project_id: projectId, project_type: projectType });
  }

  trackError(errorMessage: string, errorCode?: string, context?: AnalyticsEventData): void {
    this.trackEvent('error_occurred', {
      error_message: errorMessage,
      error_code: errorCode,
      ...context,
    });
  }

  trackFeatureUsed(featureName: string, metadata: AnalyticsEventData = {}): void {
    this.trackEvent('feature_used', { feature: featureName, ...metadata });
  }

  trackSearch(query: string, resultCount: number, filters?: AnalyticsEventData): void {
    this.trackEvent('search_performed', {
      query,
      result_count: resultCount,
      filters,
    });
  }

  disable(): void {
    this.isEnabled = false;
  }

  enable(): void {
    this.isEnabled = true;
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export const analytics = new AnalyticsTracker();
