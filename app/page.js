'use client';

import React, { useState, useMemo } from 'react';
import { Clock, DollarSign, AlertTriangle, Mail, CheckCircle, Users, Target, TrendingUp } from 'lucide-react';
// Import tracking functions
import { trackEvent, trackFirstEngagement, trackCalculatorUsage, trackEmailSignup } from '../utils/analytics';

const MeetingCostCalculator = () => {
  const [selectedRoles, setSelectedRoles] = useState({
    'Product Manager': 0,
    'Engineer': 0,
    'Designer': 0,
    'Product Marketer': 0,
    'Engineering Manager': 0,
    'Director': 0,
    'VP/Executive': 0
  });
  
  const [duration, setDuration] = useState(60);
  const [showRecurring, setShowRecurring] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [hasInteractedWithRecurring, setHasInteractedWithRecurring] = useState(false);
  const [isCustomMeeting, setIsCustomMeeting] = useState(false);

  // FAANG+ compensation data
  const roleData = {
    'Product Manager': { hourlyRate: 168, emoji: '👩🏽‍💼' },
    'Engineer': { hourlyRate: 192, emoji: '👨🏿‍💻' },
    'Designer': { hourlyRate: 144, emoji: '👩🏻‍🎨' },
    'Product Marketer': { hourlyRate: 156, emoji: '👨🏻‍💼' },
    'Engineering Manager': { hourlyRate: 240, emoji: '👨🏾‍💼' },
    'Director': { hourlyRate: 288, emoji: '👩🏼‍💼' },
    'VP/Executive': { hourlyRate: 325, emoji: '👨🏽‍💼' }
  };

  const updateRoleCount = (role, change) => {
    // Track first interaction
    trackFirstEngagement();
    
    setSelectedRoles(prev => ({
      ...prev,
      [role]: Math.max(0, prev[role] + change)
    }));
    setSelectedMeeting(null); // Clear preset meeting when customizing
    setIsCustomMeeting(true);
    setInteractionCount(prev => prev + 1); // Count custom interactions
    
    // Track role selection activity
    trackEvent('RoleAdjusted', {
      role: role,
      change: change,
      new_count: Math.max(0, selectedRoles[role] + change),
      interaction_type: 'custom_role_selection'
    });
  };

  const calculations = useMemo(() => {
    const durationHours = duration / 60;
    
    let level1Cost = 0;
    Object.entries(selectedRoles).forEach(([role, count]) => {
      if (count > 0) {
        level1Cost += roleData[role].hourlyRate * count * durationHours;
      }
    });

    const contextSwitchHours = 23 / 60;
    let level2Cost = 0;
    Object.entries(selectedRoles).forEach(([role, count]) => {
      if (count > 0) {
        level2Cost += roleData[role].hourlyRate * count * contextSwitchHours;
      }
    });

    const deepWorkHours = 2;
    let level3Cost = 0;
    Object.entries(selectedRoles).forEach(([role, count]) => {
      if (count > 0) {
        level3Cost += roleData[role].hourlyRate * count * deepWorkHours;
      }
    });

    const totalCost = level1Cost + level2Cost + level3Cost;
    const totalAttendees = Object.values(selectedRoles).reduce((sum, count) => sum + count, 0);

    const frequencyMultipliers = {
      daily: 250,
      weekly: 52,
      biweekly: 26,
      monthly: 12
    };

    // Smart defaults based on meeting type
    let defaultFrequency = frequency;
    if (selectedMeeting === 'standup') defaultFrequency = 'daily';
    else if (selectedMeeting === 'sync') defaultFrequency = 'weekly';
    else if (selectedMeeting === 'demo') defaultFrequency = 'biweekly'; // Default to biweekly for demo prep

    const recurringCost = Math.round(totalCost * frequencyMultipliers[defaultFrequency]);

    // For custom meetings, calculate all frequencies
    const allFrequencyCosts = {
      daily: Math.round(totalCost * 250),
      weekly: Math.round(totalCost * 52),
      monthly: Math.round(totalCost * 12)
    };

    return {
      level1: Math.round(level1Cost),
      level2: Math.round(level2Cost),
      level3: Math.round(level3Cost),
      total: Math.round(totalCost),
      attendees: totalAttendees,
      multiplier: level1Cost > 0 ? (totalCost / level1Cost).toFixed(1) : 0,
      recurring: recurringCost,
      defaultFrequency,
      allFrequencyCosts
    };
  }, [selectedRoles, duration, frequency, selectedMeeting]);

  // Track when calculation results change (when user gets results)
  React.useEffect(() => {
    if (calculations.total > 0 && calculations.attendees > 0) {
      // Track calculator usage with detailed data
      trackCalculatorUsage({
        meeting_type: selectedMeeting || 'custom',
        attendee_count: calculations.attendees,
        duration_minutes: duration,
        total_cost: calculations.total,
        recurring_cost: calculations.recurring,
        cost_range: getCostRange(calculations.total),
        roles_used: Object.entries(selectedRoles)
          .filter(([_, count]) => count > 0)
          .map(([role, count]) => `${role}:${count}`)
          .join(','),
        is_custom_meeting: isCustomMeeting,
        interaction_count: interactionCount
      });
    }
  }, [calculations.total, calculations.attendees, selectedMeeting, duration, isCustomMeeting, interactionCount]);

  const getCostRange = (cost) => {
    if (cost < 500) return 'under_500';
    if (cost < 1000) return '500_to_1000';
    if (cost < 2500) return '1000_to_2500';
    if (cost < 5000) return '2500_to_5000';
    return 'over_5000';
  };

  React.useEffect(() => {
    if (calculations.attendees === 0) {
      setShowRecurring(false);
      setSelectedMeeting(null);
      setIsCustomMeeting(false);
    }
  }, [calculations.attendees]);

  // Auto-scroll to results when calculation is made
  React.useEffect(() => {
    if (calculations.total > 0 && selectedMeeting) {
      setTimeout(() => {
        const resultsElement = document.getElementById('calculation-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [calculations.total, selectedMeeting]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // Track email signup attempt
    trackEmailSignup(email);
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          calculationData: {
            total: calculations.total,
            attendees: calculations.attendees,
            duration,
            recurring: showRecurring ? calculations.recurring : null,
            frequency: showRecurring ? frequency : null
          }
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setShowThankYou(true);
        
        // Track successful signup
        trackEvent('EmailCaptureSuccess', {
          email_domain: email.split('@')[1],
          signup_context: 'calculator_results',
          calculated_cost: calculations.total
        });
        
        // Hide thank you message after 5 seconds
        setTimeout(() => {
          setShowThankYou(false);
        }, 5000);
      } else {
        alert('Something went wrong. Please try again.');
        trackEvent('EmailCaptureError', {
          error_type: 'api_error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
      trackEvent('EmailCaptureError', {
        error_type: 'network_error'
      });
    }
  };

  const handlePresetMeeting = (meetingType, roles, duration, meetingName) => {
    // Track first engagement
    trackFirstEngagement();
    
    setSelectedRoles(roles);
    setDuration(duration);
    setSelectedMeeting(meetingType);
    setInteractionCount(prev => prev + 1);
    setIsCustomMeeting(false);
    
    // Track preset meeting selection
    trackEvent('PresetMeetingSelected', {
      meeting_type: meetingType,
      meeting_name: meetingName,
      preset_attendees: Object.values(roles).reduce((sum, count) => sum + count, 0),
      preset_duration: duration
    });
  };

  const handleDurationChange = (newDuration) => {
    // Track engagement on duration change
    if (calculations.attendees > 0) {
      trackFirstEngagement();
    }
    
    setDuration(newDuration);
    if (isCustomMeeting) {
      setInteractionCount(prev => prev + 1);
    }
    
    // Track duration adjustment
    trackEvent('DurationChanged', {
      new_duration: newDuration,
      previous_duration: duration,
      meeting_type: selectedMeeting || 'custom'
    });
  };

  const shouldShowEmailCapture = calculations.total > 1000 && !isSubmitted && interactionCount >= 2 && calculations.attendees > 0;

  // Track when email capture becomes visible
  React.useEffect(() => {
    if (shouldShowEmailCapture) {
      trackEvent('EmailCaptureShown', {
        trigger_cost: calculations.total,
        trigger_interactions: interactionCount
      });
    }
  }, [shouldShowEmailCapture]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - ROI Focused */}
      <div className="bg-gradient-to-br from-red-500 to-orange-400 px-4 py-3">
        <div className="max-w-sm mx-auto text-center text-white">
          <h1 className="text-xl font-bold mb-2 leading-tight">
            Only 29% of Meetings Drive ROI
          </h1>
          <p className="text-sm text-orange-100 mb-2">
            Research shows 71% of meetings waste money & burn out teams
          </p>
          <div className="bg-white/20 backdrop-blur rounded-lg p-2 text-xs mb-1">
            <p className="font-medium">🎯 For Leaders & IC Top Performers Fighting Meeting Overload</p>
          </div>
          <p className="text-xs text-orange-200">
            (calculations based on FAANG+ salaries)
          </p>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="px-4 py-6 max-w-sm mx-auto">
        
        {/* Quick Start Buttons - Horizontal Thumb-Friendly */}
        <div className="mb-6">
          <h2 className="text-base font-bold mb-3 text-center text-gray-900">
            💰 Quick Start: High-Investment Meetings
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handlePresetMeeting('sync', {
                'Product Manager': 2,
                'Engineer': 6,
                'Designer': 2,
                'Product Marketer': 1,
                'Engineering Manager': 1,
                'Director': 1,
                'VP/Executive': 0
              }, 60, 'Weekly Team Sync')}
              className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-center hover:bg-red-100 transition-colors"
            >
              <div className="text-xs font-bold text-red-900 mb-1">Weekly</div>
              <div className="text-xs font-bold text-red-900">Team Sync</div>
              <div className="text-xs text-red-700 mt-1">13 people</div>
              <div className="text-xs text-red-700">1 hour</div>
            </button>
            
            <button
              onClick={() => handlePresetMeeting('standup', {
                'Product Manager': 1,
                'Engineer': 5,
                'Designer': 1,
                'Engineering Manager': 1,
                'Director': 0,
                'VP/Executive': 0
              }, 30, 'Daily Standup')}
              className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center hover:bg-yellow-100 transition-colors"
            >
              <div className="text-xs font-bold text-yellow-900 mb-1">Daily</div>
              <div className="text-xs font-bold text-yellow-900">Standup</div>
              <div className="text-xs text-yellow-700 mt-1">8 people</div>
              <div className="text-xs text-yellow-700">30 min</div>
            </button>

            <button
              onClick={() => handlePresetMeeting('demo', {
                'Product Manager': 2,
                'Engineer': 4,
                'Designer': 2,
                'Product Marketer': 0,
                'Engineering Manager': 1,
                'Director': 1,
                'VP/Executive': 0
              }, 60, 'Demo Prep')}
              className="p-3 bg-orange-50 border-2 border-orange-200 rounded-lg text-center hover:bg-orange-100 transition-colors"
            >
              <div className="text-xs font-bold text-orange-900 mb-1">Demo</div>
              <div className="text-xs font-bold text-orange-900">Prep</div>
              <div className="text-xs text-orange-700 mt-1">10 people</div>
              <div className="text-xs text-orange-700">1 hour</div>
            </button>
          </div>
        </div>

        {/* Role Selection - Brand Colors Applied */}
        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-900">Or customize your meeting:</h3>
          <div className="space-y-3">
            {Object.entries(roleData).map(([role, data]) => (
              <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center flex-1">
                  <span className="text-xl mr-2">{data.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">{role}</div>
                    <div className="text-xs text-gray-600">${data.hourlyRate}/hr</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateRoleCount(role, -1)}
                    className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg"
                    disabled={selectedRoles[role] === 0}
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-bold text-gray-900">{selectedRoles[role]}</span>
                  <button
                    onClick={() => updateRoleCount(role, 1)}
                    className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white font-bold text-lg transition-colors"
                    style={{ backgroundColor: '#FF6B6B' }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Duration - Brand Colors Applied */}
        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-900">⏱️ Meeting Duration</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[30, 60, 90, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => handleDurationChange(mins)}
                className={`py-3 px-2 rounded-lg font-bold transition-colors text-sm ${
                  duration === mins
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={duration === mins ? { backgroundColor: '#FF6B6B' } : {}}
              >
                {mins < 60 ? `${mins}m` : `${mins / 60}h`}
              </button>
            ))}
          </div>
        </div>

        {/* Results - Mobile Optimized with ID for scrolling */}
        {calculations.attendees > 0 && (
          <div id="calculation-results" className="space-y-4 mb-6 pt-4">
            
            {/* Shock Value - Brand Colors Applied */}
            <div className="text-center p-6 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}>
              <div className="text-3xl font-bold mb-1">
                ${calculations.total.toLocaleString()}
              </div>
              <div className="text-red-100">
                True cost of this {duration}min meeting
              </div>
              <div className="text-sm text-red-200 mt-2">
                {calculations.multiplier}x what you think it costs
              </div>
            </div>

            {/* ROI Reality Check */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                🤔 ROI Reality Check:
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div>□ Does this meeting create momentum?</div>
                <div className="font-semibold">□ Is this worth interrupting deep work for?</div>
                <div>□ Does this move your biggest priority forward?</div>
              </div>
            </div>

            {/* Breakdown - Brand Colors Applied */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg border-l-4" style={{ backgroundColor: '#B5EAD7', borderLeftColor: '#1A1C33' }}>
                <div>
                  <div className="font-bold" style={{ color: '#1A1C33' }}>Meeting Time</div>
                  <div className="text-xs" style={{ color: '#1A1C33', opacity: 0.8 }}>Direct salary cost</div>
                </div>
                <div className="text-lg font-bold" style={{ color: '#1A1C33' }}>
                  ${calculations.level1.toLocaleString()}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div>
                  <div className="font-bold text-yellow-900">Context Switch</div>
                  <div className="text-xs text-yellow-700">23min refocus time</div>
                </div>
                <div className="text-lg font-bold text-yellow-600">
                  +${calculations.level2.toLocaleString()}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg border-l-4" style={{ backgroundColor: '#FFEBE6', borderLeftColor: '#FF6B6B' }}>
                <div>
                  <div className="font-bold" style={{ color: '#FF6B6B' }}>Deep Work Lost</div>
                  <div className="text-xs" style={{ color: '#FF6B6B', opacity: 0.8 }}>2hr productivity loss</div>
                </div>
                <div className="text-lg font-bold" style={{ color: '#FF6B6B' }}>
                  +${calculations.level3.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Auto-Recurring Costs */}
            {selectedMeeting && !isCustomMeeting && (
              <div className="rounded-lg p-4 text-white text-center" style={{ background: 'linear-gradient(135deg, #FF6B6B, #D32F2F)' }}>
                <div className="text-2xl font-bold">
                  ${calculations.recurring.toLocaleString()}
                </div>
                <div className="text-red-200">
                  Annual cost ({calculations.defaultFrequency === 'daily' ? 'Daily' : 
                               calculations.defaultFrequency === 'weekly' ? 'Weekly' :
                               calculations.defaultFrequency === 'biweekly' ? 'Twice monthly' : 'Monthly'})
                </div>
                {selectedMeeting === 'demo' && (
                  <div className="mt-2 text-xs text-red-300">
                    Monthly: ${Math.round(calculations.total * 12).toLocaleString()}/year
                  </div>
                )}
              </div>
            )}

            {/* Custom Meeting - All Frequency Options */}
            {isCustomMeeting && calculations.total > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-center text-gray-900 mb-3">Annual Cost by Frequency:</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="font-semibold text-red-900">If Daily:</span>
                    <span className="font-bold text-red-600">${calculations.allFrequencyCosts.daily.toLocaleString()}/year</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="font-semibold text-orange-900">If Weekly:</span>
                    <span className="font-bold text-orange-600">${calculations.allFrequencyCosts.weekly.toLocaleString()}/year</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="font-semibold text-yellow-900">If Monthly:</span>
                    <span className="font-bold text-yellow-600">${calculations.allFrequencyCosts.monthly.toLocaleString()}/year</span>
                  </div>
                </div>
              </div>
            )}

            
            <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded border mt-4">
              <div className="font-medium text-yellow-800 mb-1">💡 Put this in perspective:</div>
              <div>• That's {Math.round((isCustomMeeting ? calculations.allFrequencyCosts.weekly : calculations.recurring) / 150000)} senior engineers</div>
              <div>• Or {Math.round((isCustomMeeting ? calculations.allFrequencyCosts.weekly : calculations.recurring) / 100000)} product managers</div>
            </div>

    {/* Tally Survey Button */}
    <div className="mt-6 text-center">
      <a 
        href="https://tally.so/r/wLjeWv" 
        target="_blank"
        className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors"
        onClick={() => trackEvent('ValidationSurveyClick', { meeting_cost: calculations.total })}
      >
        📊 Help us build better solutions (2 min survey)
      </a>
      <p className="text-xs text-gray-600 mt-2">
        Share your meeting frustrations so we can build better solutions
      </p>
    </div>
  </div>
)}

        {/* Email Capture CTA - Side Slide-in */}
        {shouldShowEmailCapture && !isSubmitted && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="bg-white border shadow-xl rounded-lg p-4 max-w-sm mx-auto">
              <div className="text-center mb-3">
                <h3 className="font-bold text-base" style={{ color: '#1A1C33' }}>✋ Stop being the calendar victim.</h3>
                <h3 className="font-bold text-base mb-2" style={{ color: '#FF6B6B' }}>🚀 Start being the clarity driver.</h3>
                <p className="text-xs text-gray-600">📘 Free Guide: How to design, run and manage meetings like a facilitator pro so your team and you have momentum</p>
              </div>
              <form onSubmit={handleEmailSubmit} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => trackFirstEngagement()}
                  placeholder="your.email@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#FF6B6B' }}
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 text-white rounded-lg font-bold text-sm transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#FF6B6B' }}
                >
                  Get Guide
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Thank You State - Updated Message */}
        {showThankYou && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="text-white rounded-lg p-4 max-w-sm mx-auto text-center" style={{ backgroundColor: '#1A1C33' }}>
              <CheckCircle className="mx-auto h-6 w-6 mb-2" style={{ color: '#B5EAD7' }} />
              <h3 className="font-bold">Check your email!</h3>
              <p className="text-sm text-gray-300">Your meeting facilitation guide is on the way.</p>
              <p className="text-xs text-gray-400 mt-1">Please check your spam folder.</p>
            </div>
          </div>
        )}
      </div>

      {/* Social Proof / Trust Indicators */}
      <div className="px-4 py-6 bg-gray-50">
        <div className="max-w-sm mx-auto text-center">
          <p className="text-sm text-gray-600 mb-4">Trusted by product leaders at:</p>
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span>🏢 Tech Startups</span>
            <span>🚀 Scale-ups</span>
            <span>🏬 Enterprise</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCostCalculator;