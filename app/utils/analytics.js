/**
 * Analytics utility functions for Meeting Cost Calculator
 * Tracks events to both Google Analytics 4 and Meta Pixel
 */

// Main event tracking function
export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.trackAnalytics) {
    window.trackAnalytics(eventName, params);
  }
};

// Track when calculator is started
export const trackCalculatorStart = () => {
  if (typeof window !== 'undefined' && window.trackCalculatorStart) {
    window.trackCalculatorStart();
  }
};

// Track when calculation is completed
export const trackCalculatorComplete = (meetingCost, attendees, duration) => {
  if (typeof window !== 'undefined' && window.trackCalculatorComplete) {
    window.trackCalculatorComplete(meetingCost, attendees, duration);
  }
};

// Track user engagement
export const trackEngagement = (action, label) => {
  if (typeof window !== 'undefined' && window.trackEngagement) {
    window.trackEngagement(action, label);
  }
};

// Track specific calculator interactions
export const trackInteraction = (interactionType, details = {}) => {
  trackEvent(`calculator_${interactionType}`, {
    event_category: 'calculator_interaction',
    event_label: interactionType,
    ...details
  });
};

// Track form field changes
export const trackFieldChange = (fieldName, value) => {
  trackEvent('field_changed', {
    event_category: 'calculator',
    event_label: fieldName,
    field_value: value
  });
};

// Track calculator errors
export const trackError = (errorType, errorMessage) => {
  trackEvent('calculator_error', {
    event_category: 'error',
    event_label: errorType,
    error_message: errorMessage
  });
};

// Track CTA clicks
export const trackCTAClick = (ctaName, ctaLocation) => {
  trackEvent('cta_clicked', {
    event_category: 'conversion',
    event_label: ctaName,
    cta_location: ctaLocation
  });
};

// Track template downloads
export const trackTemplateDownload = (templateName) => {
  trackEvent('template_downloaded', {
    event_category: 'conversion',
    event_label: templateName,
    value: 1
  });
};

// Track social shares
export const trackSocialShare = (platform, meetingCost) => {
  trackEvent('social_share', {
    event_category: 'engagement',
    event_label: platform,
    shared_cost: Math.round(meetingCost)
  });
};

// Track calculator reset
export const trackCalculatorReset = () => {
  trackEvent('calculator_reset', {
    event_category: 'calculator',
    event_label: 'reset_clicked'
  });
};

// Track advanced options toggle
export const trackAdvancedOptions = (isOpen) => {
  trackEvent('advanced_options_toggled', {
    event_category: 'calculator',
    event_label: isOpen ? 'opened' : 'closed'
  });
};

// Track calculation method change (if you have multiple calculation types)
export const trackCalculationMethod = (method) => {
  trackEvent('calculation_method_changed', {
    event_category: 'calculator',
    event_label: method
  });
};

// Track ConvertKit form interactions
export const trackConvertKitInteraction = (action, formLocation) => {
  trackEvent('convertkit_interaction', {
    event_category: 'lead_generation',
    event_label: action,
    form_location: formLocation
  });
};

// Track ConvertKit form submission
export const trackConvertKitSubmission = (formLocation) => {
  trackEvent('convertkit_form_submitted', {
    event_category: 'conversion',
    event_label: 'email_signup',
    form_location: formLocation,
    value: 1
  });
};

// Helper to safely get numeric values
const safeNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// Track detailed calculation data
export const trackDetailedCalculation = (calculationData) => {
  const {
    attendees,
    duration,
    averageHourlyRate,
    totalCost,
    includesContextSwitching,
    includesOpportunityCost
  } = calculationData;

  trackEvent('detailed_calculation', {
    event_category: 'calculator',
    value: Math.round(safeNumber(totalCost)),
    attendees: safeNumber(attendees),
    duration_minutes: safeNumber(duration),
    hourly_rate: Math.round(safeNumber(averageHourlyRate)),
    context_switching: includesContextSwitching ? 'yes' : 'no',
    opportunity_cost: includesOpportunityCost ? 'yes' : 'no'
  });
};