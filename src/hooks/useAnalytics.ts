import { useEffect } from 'react';
import { analytics } from '../utils/analytics';

export function usePageView(pageName: string, metadata?: Record<string, any>) {
  useEffect(() => {
    analytics.trackPageView(pageName, metadata);
  }, [pageName]);
}

export function useAnalytics() {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserLogin: analytics.trackUserLogin.bind(analytics),
    trackUserSignup: analytics.trackUserSignup.bind(analytics),
    trackUserLogout: analytics.trackUserLogout.bind(analytics),
    trackLessonStarted: analytics.trackLessonStarted.bind(analytics),
    trackLessonCompleted: analytics.trackLessonCompleted.bind(analytics),
    trackLabStarted: analytics.trackLabStarted.bind(analytics),
    trackLabCompleted: analytics.trackLabCompleted.bind(analytics),
    trackBadgeEarned: analytics.trackBadgeEarned.bind(analytics),
    trackProjectCreated: analytics.trackProjectCreated.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackFeatureUsed: analytics.trackFeatureUsed.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
  };
}
