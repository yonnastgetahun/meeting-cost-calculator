export const trackEvent = (eventName, customData = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
      const timeOnPage = Math.round((Date.now() - window.sessionStartTime) / 1000);
      
      const eventData = {
        time_on_page: timeOnPage,
        calculator_usage_count: window.calculatorUsageCount || 0,
        ...customData
      };
      
      window.fbq('track', eventName, eventData);
      console.log(`📊 Tracked: ${eventName}`, eventData);
    }
  };
  
  export const trackFirstEngagement = () => {
    if (typeof window !== 'undefined' && !window.hasEngaged) {
      window.hasEngaged = true;
      const timeToFirstAction = Math.round((Date.now() - window.sessionStartTime) / 1000);
      
      trackEvent('FirstEngagement', {
        time_to_first_action: timeToFirstAction
      });
    }
  };
  
  export const trackCalculatorUsage = (calculationData) => {
    if (typeof window !== 'undefined') {
      window.calculatorUsageCount = (window.calculatorUsageCount || 0) + 1;
      trackFirstEngagement();
      
      trackEvent('CalculatorUsed', {
        usage_number: window.calculatorUsageCount,
        ...calculationData
      });
    }
  };
  
  export const trackEmailSignup = (email) => {
    trackEvent('CompleteRegistration', {
      email_provided: !!email,
      registration_method: 'meeting_calculator'
    });
  };
  
  export const trackDownload = (resourceType) => {
    trackFirstEngagement();
    trackEvent('Lead', {
      content_name: resourceType,
      content_category: 'resource_download'
    });
  };
  