'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Clock, DollarSign, AlertTriangle, Mail, CheckCircle, Users, Target, TrendingUp } from 'lucide-react';

// Mock tracking functions for demo
const trackEvent = (eventName, data) => console.log('Track:', eventName, data);
const trackFirstEngagement = () => console.log('First engagement tracked');
const trackCalculatorUsage = (data) => console.log('Calculator usage:', data);
const trackEmailSignup = (email) => console.log('Email signup:', email);

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

  // Exit intent detection
  useEffect(() => {
    const handleExit = (e) => {
      if (interactionCount > 0 && !isSubmitted && calculations.attendees > 0) {
        setShowEmailCapture(true);
        trackEvent('ExitIntentTriggered');
      }
    };
    
    document.addEventListener('mouseleave', handleExit);
    return () => document.removeEventListener('mouseleave', handleExit);
  }, [interactionCount, isSubmitted]);

  const updateRoleCount = (role, change) => {
    trackFirstEngagement();
    
    setSelectedRoles(prev => ({
      ...prev,
      [role]: Math.max(0, prev[role] + change)
    }));
    setSelectedMeeting(null);
    setIsCustomMeeting(true);
    setInteractionCount(prev => prev + 1);
    
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

    let defaultFrequency = frequency;
    if (selectedMeeting === 'standup') defaultFrequency = 'daily';
    else if (selectedMeeting === 'sync') defaultFrequency = 'weekly';
    else if (selectedMeeting === 'demo') defaultFrequency = 'biweekly';

    const recurringCost = Math.round(totalCost * frequencyMultipliers[defaultFrequency]);

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

  useEffect(() => {
    if (calculations.total > 0 && calculations.attendees > 0) {
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

  useEffect(() => {
    if (calculations.attendees === 0) {
      setShowRecurring(false);
      setSelectedMeeting(null);
      setIsCustomMeeting(false);
    }
  }, [calculations.attendees]);

  useEffect(() => {
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
    if (e && e.preventDefault) e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    trackEmailSignup(email);
    
    // Mock API call for demo
    setIsSubmitted(true);
    setShowThankYou(true);
    
    trackEvent('EmailCaptureSuccess', {
      email_domain: email.split('@')[1],
      signup_context: 'calculator_results',
      calculated_cost: calculations.total
    });
    
    setTimeout(() => {
      setShowThankYou(false);
    }, 5000);
  };

  const handlePresetMeeting = (meetingType, roles, duration, meetingName) => {
    trackFirstEngagement();
    
    setSelectedRoles(roles);
    setDuration(duration);
    setSelectedMeeting(meetingType);
    setInteractionCount(prev => prev + 1);
    setIsCustomMeeting(false);
    
    trackEvent('PresetMeetingSelected', {
      meeting_type: meetingType,
      meeting_name: meetingName,
      preset_attendees: Object.values(roles).reduce((sum, count) => sum + count, 0),
      preset_duration: duration
    });
  };

  const handleDurationChange = (newDuration) => {
    if (calculations.attendees > 0) {
      trackFirstEngagement();
    }
    
    setDuration(newDuration);
    if (isCustomMeeting) {
      setInteractionCount(prev => prev + 1);
    }
    
    trackEvent('DurationChanged', {
      new_duration: newDuration,
      previous_duration: duration,
      meeting_type: selectedMeeting || 'custom'
    });
  };

  // Updated email capture trigger - removed cost threshold
  const shouldShowEmailCapture = !isSubmitted && interactionCount > 0 && calculations.attendees > 0;

  useEffect(() => {
    if (shouldShowEmailCapture) {
      trackEvent('EmailCaptureShown', {
        trigger_interactions: interactionCount
      });
    }
  }, [shouldShowEmailCapture]);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky top CTA bar */}
      {interactionCount > 0 && !isSubmitted && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 py-2 z-50">
          <div className="max-w-sm mx-auto text-white text-center">
            <span className="font-bold">🔓 Unlock full report + facilitation templates</span>
            <button 
              onClick={() => setShowEmailCapture(true)}
              className="ml-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded text-sm font-bold"
            >
              Get Access
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
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
        </div>
      </div>

      {/* Calculator Section */}
      <div className="px-4 py-6 max-w-sm mx-auto">
        
        {/* Quick Start Buttons */}
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

        {/* Role Selection */}
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

        {/* Duration */}
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

        {/* Results */}
        {calculations.attendees > 0 && (
          <div id="calculation-results" className="space-y-4 mb-6 pt-4">
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

            {/* Cost Breakdown */}
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

            {/* Recurring Costs */}
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
              </div>
            )}

            {/* Custom Meeting Frequencies */}
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

            {/* Perspective */}
            <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded border mt-4">
              <div className="font-medium text-yellow-800 mb-1">💡 Put this in perspective:</div>
              <div>• That's {Math.round((isCustomMeeting ? calculations.allFrequencyCosts.weekly : calculations.recurring) / 150000)} senior engineers</div>
              <div>• Or {Math.round((isCustomMeeting ? calculations.allFrequencyCosts.weekly : calculations.recurring) / 100000)} product managers</div>
            </div>

            {/* Survey Button */}
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

        {/* Email Capture Modal */}
        {shouldShowEmailCapture && !isSubmitted && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="bg-white border shadow-xl rounded-lg p-4 max-w-sm mx-auto">
              <div className="text-center mb-3">
                <h3 className="font-bold text-base" style={{ color: '#1A1C33' }}>🚀 Get Your Free Facilitation Kit</h3>
                <p className="text-xs text-gray-600">
                  Perfect for anyone running meetings: <br/>
                  • 5 Meeting Templates That Save 42% Time <br/>
                  • ROI Calculator Spreadsheet <br/>
                   • Facilitation Best Practices Guide
                </p>
              </div>
              <div className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => trackFirstEngagement()}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent"
                  required
                />
                <button
                  onClick={handleEmailSubmit}
                  className="w-full py-2 text-white rounded-lg font-bold text-sm transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#FF6B6B' }}
                  disabled={!email || !email.includes('@')}
                >
                  Get Instant Access
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Thank You Message */}
        {showThankYou && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="text-white rounded-lg p-4 max-w-sm mx-auto text-center" style={{ backgroundColor: '#1A1C33' }}>
              <CheckCircle className="mx-auto h-6 w-6 mb-2" style={{ color: '#B5EAD7' }} />
              <h3 className="font-bold">Check your email!</h3>
              <p className="text-sm text-gray-300">Your Facilitation Kit is on the way.</p>
              <p className="text-xs text-gray-400 mt-1">Please check your spam folder.</p>
            </div>
          </div>
        )}
      </div>

      {/* Social Proof */}
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
