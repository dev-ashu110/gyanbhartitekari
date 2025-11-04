import { supabase } from '@/integrations/supabase/client';

type AnalyticsEvent = 
  | 'page_view' 
  | 'event_registration' 
  | 'notice_view' 
  | 'download' 
  | 'search';

interface AnalyticsData {
  event_type: AnalyticsEvent;
  page_path?: string;
  metadata?: Record<string, any>;
}

export const trackAnalytics = async (data: AnalyticsData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('analytics_logs').insert({
      event_type: data.event_type,
      page_path: data.page_path || window.location.pathname,
      user_id: user?.id || null,
      metadata: data.metadata || {},
    });
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.debug('Analytics tracking failed:', error);
  }
};

// Helper functions for common events
export const trackPageView = (path?: string) => {
  trackAnalytics({
    event_type: 'page_view',
    page_path: path || window.location.pathname,
  });
};

export const trackEventRegistration = (eventId: string, eventTitle: string) => {
  trackAnalytics({
    event_type: 'event_registration',
    metadata: { eventId, eventTitle },
  });
};

export const trackNoticeView = (noticeId: string, noticeTitle: string) => {
  trackAnalytics({
    event_type: 'notice_view',
    metadata: { noticeId, noticeTitle },
  });
};

export const trackDownload = (fileName: string, fileType: string) => {
  trackAnalytics({
    event_type: 'download',
    metadata: { fileName, fileType },
  });
};

export const trackSearch = (query: string, resultCount: number) => {
  trackAnalytics({
    event_type: 'search',
    metadata: { query, resultCount },
  });
};
