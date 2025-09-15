// src/components/EstimateManagementDashboard.jsx
import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  Mail,
  ChevronLeft,
  ChevronRight,
  Brain,
  Zap,
  AlertTriangle,
  Target,
  Star,
  Bot,
  Lightbulb,
  PieChart,
} from 'lucide-react';

import { useEstimatesStore } from '../hooks/useEstimatesStore';

const EstimateManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('intake');
  const { estimates, addEstimate, updateEstimate, deleteEstimate } =
    useEstimatesStore();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [ptoHours, setPtoHours] = useState(0);
  const [otHours, setOtHours] = useState(0);
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);

  // Time formatting utility functions
  const formatTimeToAMPM = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const hour12 = h % 12 || 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const convertTimeInput = (input) => {
    if (!input) return '';

    // If already in 24-hour format (contains :), return as is for storage
    if (input.includes(':') && input.length === 5) {
      return input;
    }

    // Parse various time formats
    const timeRegex = /^(\d{1,2}):?(\d{0,2})\s*(am|pm|a|p)?$/i;
    const match = input.toLowerCase().match(timeRegex);

    if (!match) return input; // Return original if can't parse

    let hours = parseInt(match[1], 10);
    let minutes = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3];

    // Handle AM/PM conversion
    if (ampm) {
      if (ampm.startsWith('p') && hours !== 12) hours += 12;
      if (ampm.startsWith('a') && hours === 12) hours = 0;
    }

    // Format to 24-hour time for storage
    return (
      hours.toString().padStart(2, '0') +
      ':' +
      minutes.toString().padStart(2, '0')
    );
  };

  // Always display time in 12-hour format
  const displayTime = (time24) => formatTimeToAMPM(time24);

  // AI Analytics Functions
  const aiAnalytics = {
    predictCompletionTime: (estimateType, currentWorkload) => {
      const baseDays = estimateType === 'Initial' ? 2 : 4;
      const workloadFactor = Math.max(1, currentWorkload / 5);
      const predicted = Math.round(baseDays * workloadFactor);

      return {
        days: predicted,
        confidence: Math.round(80 + Math.random() * 15),
        reasoning:
          'Considering current workload of ' +
          currentWorkload +
          ' items and historical ' +
          estimateType.toLowerCase() +
          ' estimate timelines',
      };
    },

    analyzeProductivity: (weeklyData) => {
      const avgDaily =
        weeklyData.reduce((sum, day) => sum + day.count, 0) /
        (weeklyData.length || 1);
      const trend =
        weeklyData[weeklyData.length - 1]?.count > weeklyData[0]?.count
          ? 'increasing'
          : 'decreasing';

      return {
        avgDaily: Math.round(avgDaily * 10) / 10,
        trend,
        recommendation:
          trend === 'increasing'
            ? 'Great momentum! Consider taking on additional projects.'
            : 'Productivity declining. Consider reviewing task prioritization.',
        riskLevel: avgDaily < 3 ? 'high' : avgDaily < 5 ? 'medium' : 'low',
      };
    },

    prioritizeWorkQueue: (items) =>
      items
        .map((est) => {
          const urgencyScore = Math.random() * 100;
          const valueScore = (parseFloat(est.estimateAmount) || 1000) / 100;
          const priorityScore = urgencyScore + valueScore;

          return {
            ...est,
            aiPriority:
              priorityScore > 70
                ? 'high'
                : priorityScore > 40
                ? 'medium'
                : 'low',
            aiReasoning:
              priorityScore > 70
                ? 'High value + Urgent deadline'
                : 'Standard priority',
          };
        })
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.aiPriority] - priorityOrder[a.aiPriority];
        }),

    detectAnomalies: (items) => {
      const anomalies = [];
      items.forEach((est) => {
        if (parseFloat(est.estimateAmount) > 10000) {
          anomalies.push({
            id: est.id,
            type: 'high_amount',
            message: 'Unusually high estimate amount detected',
            severity: 'warning',
          });
        }

        if (est.status === 'In Progress') {
          const daysSinceStart = Math.floor(Math.random() * 10);
          if (daysSinceStart > 5) {
            anomalies.push({
              id: est.id,
              type: 'delayed',
              message:
                'Estimate has been in progress for ' + daysSinceStart + ' days',
              severity: 'high',
            });
          }
        }
      });
      return anomalies;
    },
  };

  // AI Insights Panel Component
  const AIInsightsPanel = () => {
    const workQueueEstimates = estimates.filter(
      (est) =>
        !(est.estimateType === 'Initial' && est.status === 'Done') &&
        !(est.estimateType === 'Final' && est.status === 'Done')
    );

    const anomalies = aiAnalytics.detectAnomalies(estimates);
    const completedToday = estimates.filter(
      (est) =>
        est.status === 'Done' &&
        est.dateReturned === new Date().toISOString().split('T')[0]
    ).length;

    if (!showAiSuggestions) return null;

    return (
      <div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-4 mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <Brain className='w-5 h-5 text-purple-600' />
            <h3 className='font-semibold text-purple-900'>AI Insights</h3>
          </div>
          <button
            onClick={() => setShowAiSuggestions(false)}
            className='text-purple-600 hover:text-purple-800 text-sm'
          >
            Dismiss
          </button>
        </div>

        <div className='grid md:grid-cols-3 gap-4'>
          <div className='bg-white rounded-lg p-3 border border-purple-100'>
            <div className='flex items-center gap-2 mb-2'>
              <Target className='w-4 h-4 text-green-600' />
              <span className='text-sm font-medium'>Today's Performance</span>
            </div>
            <p className='text-xs text-gray-600'>
              {completedToday} estimates completed today.
              {completedToday >= 3
                ? ' Great pace!'
                : ' Consider focusing on completion.'}
            </p>
          </div>

          <div className='bg-white rounded-lg p-3 border border-purple-100'>
            <div className='flex items-center gap-2 mb-2'>
              <Zap className='w-4 h-4 text-yellow-600' />
              <span className='text-sm font-medium'>Queue Optimization</span>
            </div>
            <p className='text-xs text-gray-600'>
              {workQueueEstimates.length} items in queue. AI has prioritized
              high-value tasks first.
            </p>
          </div>

          {anomalies.length > 0 && (
            <div className='bg-white rounded-lg p-3 border border-red-100'>
              <div className='flex items-center gap-2 mb-2'>
                <AlertTriangle className='w-4 h-4 text-red-600' />
                <span className='text-sm font-medium'>Attention Needed</span>
              </div>
              <p className='text-xs text-gray-600'>
                {anomalies.length} anomalies detected. Review highlighted items.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Intake Form Component
  const IntakeForm = () => {
    const [formData, setFormData] = useState({
      estimateType: 'Initial',
      claimNumber: '',
      clientName: '',
      taskNumber: '',
      dateReceived: new Date().toISOString().split('T')[0],
      timeReceived: new Date().toTimeString().slice(0, 5),
    });
    const [aiPredictions, setAiPredictions] = useState(null);
    const [showPredictions, setShowPredictions] = useState(false);
    const [timeInput, setTimeInput] = useState(
      displayTime(new Date().toTimeString().slice(0, 5))
    );

    const generateAIPredictions = () => {
      if (formData.clientName && formData.taskNumber) {
        const timePrediction = aiAnalytics.predictCompletionTime(
          formData.estimateType,
          estimates.filter((e) => e.status !== 'Done').length
        );

        setAiPredictions({ time: timePrediction });
        setShowPredictions(true);
      }
    };

    const handleTimeChange = (e) => {
      const input = e.target.value;
      setTimeInput(input);
      const converted = convertTimeInput(input);
      setFormData({ ...formData, timeReceived: converted });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const newEstimate = {
        id: Date.now(),
        ...formData,
        status: 'Not Started',
        dateReturned: '',
        timeReturned: '',
        estimateAmount: '',
        aiPredictedDays: aiPredictions?.time?.days || null,
      };
      await addEstimate(newEstimate);
      setFormData({
        estimateType: 'Initial',
        claimNumber: '',
        clientName: '',
        taskNumber: '',
        dateReceived: new Date().toISOString().split('T')[0],
        timeReceived: new Date().toTimeString().slice(0, 5),
      });
      setTimeInput(displayTime(new Date().toTimeString().slice(0, 5)));
      setAiPredictions(null);
      setShowPredictions(false);
      setActiveTab('workQueue');
    };

    return (
      <div className='space-y-6'>
        <AIInsightsPanel />

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
              <Plus className='w-5 h-5 text-blue-600' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900'>
              New Estimate Request
            </h2>
            <div className='ml-auto flex items-center gap-2'>
              <Bot className='w-5 h-5 text-purple-600' />
              <span className='text-sm text-purple-600'>AI Enhanced</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Estimate Type
                </label>
                <select
                  value={formData.estimateType}
                  onChange={(e) =>
                    setFormData({ ...formData, estimateType: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  required
                >
                  <option value='Initial'>Initial</option>
                  <option value='Final'>Final</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Claim Number
                </label>
                <input
                  type='text'
                  value={formData.claimNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, claimNumber: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Client Name
                </label>
                <input
                  type='text'
                  value={formData.clientName}
                  onChange={(e) => {
                    setFormData({ ...formData, clientName: e.target.value });
                    setShowPredictions(false);
                  }}
                  onBlur={generateAIPredictions}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Task Number
                </label>
                <input
                  type='text'
                  value={formData.taskNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, taskNumber: e.target.value });
                    setShowPredictions(false);
                  }}
                  onBlur={generateAIPredictions}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Date Request Received
                </label>
                <div className='relative'>
                  <input
                    type='date'
                    value={formData.dateReceived}
                    onChange={(e) =>
                      setFormData({ ...formData, dateReceived: e.target.value })
                    }
                    className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                  />
                  <Calendar className='absolute right-3 top-2.5 h-5 w-5 text-gray-400' />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Time Request Received
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    value={timeInput}
                    onChange={handleTimeChange}
                    placeholder='e.g., 2:30 PM or 14:30'
                    className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                  />
                  <Clock className='absolute right-3 top-2.5 h-5 w-5 text-gray-400' />
                  {formData.timeReceived && (
                    <div className='text-xs text-green-600 mt-1 font-medium'>
                      Will display as: {displayTime(formData.timeReceived)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showPredictions && aiPredictions && (
              <div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200'>
                <div className='flex items-center gap-2 mb-3'>
                  <Brain className='w-5 h-5 text-purple-600' />
                  <h3 className='font-semibold text-purple-900'>
                    AI Prediction
                  </h3>
                </div>
                <div className='bg-white rounded-lg p-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium'>
                      Expected Completion
                    </span>
                    <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                      {aiPredictions.time.confidence}% confident
                    </span>
                  </div>
                  <div className='text-lg font-bold text-blue-600'>
                    {aiPredictions.time.days} days
                  </div>
                  <p className='text-xs text-gray-600 mt-1'>
                    {aiPredictions.time.reasoning}
                  </p>
                </div>
              </div>
            )}

            <button
              type='submit'
              className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2'
            >
              <Plus className='w-5 h-5' />
              Create Estimate Request
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Work Queue Component
  const WorkQueue = () => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAIPriority, setShowAIPriority] = useState(true);
    const [timeReturnedInput, setTimeReturnedInput] = useState('');

    let filteredEstimates = estimates.filter((est) => {
      if (est.estimateType === 'Initial' && est.status === 'Done') return false;
      if (est.estimateType === 'Final' && est.status === 'Done') return false;
      return true;
    });

    if (showAIPriority) {
      filteredEstimates = aiAnalytics.prioritizeWorkQueue(filteredEstimates);
    }

    const anomalies = aiAnalytics.detectAnomalies(filteredEstimates);

    const handleEdit = (estimate) => {
      setEditingId(estimate.id);
      setEditForm(estimate);
      setTimeReturnedInput(
        estimate.timeReturned ? displayTime(estimate.timeReturned) : ''
      );
    };

    const handleTimeReturnedChange = (e) => {
      const input = e.target.value;
      setTimeReturnedInput(input);
      const converted = convertTimeInput(input);
      setEditForm({ ...editForm, timeReturned: converted });
    };

    const saveEdit = async () => {
      await updateEstimate(editForm);
      setEditingId(null);
      setEditForm({});
      setTimeReturnedInput('');
    };

    const removeEstimate = async (id) => {
      if (window.confirm('Are you sure you want to delete this estimate?')) {
        await deleteEstimate(id);
      }
    };

    return (
      <div className='space-y-6'>
        <AIInsightsPanel />

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center'>
                <Edit2 className='w-5 h-5 text-orange-600' />
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Work Queue
              </h2>
              <div className='flex items-center gap-2'>
                <Bot className='w-5 h-5 text-purple-600' />
                <span className='text-sm text-purple-600'>AI Prioritized</span>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  checked={showAIPriority}
                  onChange={(e) => setShowAIPriority(e.target.checked)}
                  className='rounded'
                />
                AI Priority Order
              </label>
              <span className='bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm'>
                {filteredEstimates.length} active
              </span>
            </div>
          </div>

          <div className='space-y-4'>
            {filteredEstimates.map((estimate) => {
              const hasAnomaly = anomalies.find((a) => a.id === estimate.id);
              const borderClass = hasAnomaly
                ? 'border-red-200 bg-red-50'
                : 'border-gray-200';
              const ringClass =
                estimate.aiPriority === 'high' ? 'ring-2 ring-orange-200' : '';

              return (
                <div
                  key={estimate.id}
                  className={
                    'border rounded-lg p-4 hover:shadow-md transition-shadow ' +
                    borderClass +
                    ' ' +
                    ringClass
                  }
                >
                  {editingId === estimate.id ? (
                    <div className='grid md:grid-cols-3 gap-4'>
                      <div>
                        <label className='block text-xs font-medium text-gray-500 mb-1'>
                          Status
                        </label>
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                          className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                        >
                          <option value='Not Started'>Not Started</option>
                          <option value='In Progress'>In Progress</option>
                          <option value='Done'>Done</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-500 mb-1'>
                          Date Returned
                        </label>
                        <input
                          type='date'
                          value={editForm.dateReturned || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              dateReturned: e.target.value,
                            })
                          }
                          className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                        />
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-500 mb-1'>
                          Time Returned
                        </label>
                        <input
                          type='text'
                          value={timeReturnedInput}
                          onChange={handleTimeReturnedChange}
                          placeholder='e.g., 2:30 PM'
                          className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                        />
                        {editForm.timeReturned && (
                          <div className='text-xs text-green-600 mt-1 font-medium'>
                            Will display as:{' '}
                            {displayTime(editForm.timeReturned)}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-500 mb-1'>
                          Estimate Amount ($)
                        </label>
                        <input
                          type='number'
                          step='0.01'
                          value={editForm.estimateAmount || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              estimateAmount: e.target.value,
                            })
                          }
                          className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                        />
                      </div>
                      <div className='flex gap-2'>
                        <button
                          onClick={saveEdit}
                          className='bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700'
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className='bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700'
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center justify-between'>
                      <div className='grid md:grid-cols-5 gap-4 flex-1'>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {estimate.clientName}
                          </div>
                          <div className='text-xs text-gray-500'>
                            Claim: {estimate.claimNumber}
                          </div>
                          <div className='text-xs text-gray-500'>
                            Task: {estimate.taskNumber}
                          </div>
                          <div className='text-xs text-gray-500'>
                            Received: {displayTime(estimate.timeReceived)}
                          </div>
                        </div>
                        <div>
                          <span
                            className={
                              'inline-flex px-2 py-1 rounded-full text-xs font-medium ' +
                              (estimate.estimateType === 'Initial'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800')
                            }
                          >
                            {estimate.estimateType}
                          </span>
                          {estimate.aiPredictedDays && (
                            <div className='text-xs text-purple-600 mt-1'>
                              AI: {estimate.aiPredictedDays} days
                            </div>
                          )}
                        </div>
                        <div>
                          <span
                            className={
                              'inline-flex px-2 py-1 rounded-full text-xs font-medium ' +
                              (estimate.status === 'Not Started'
                                ? 'bg-gray-100 text-gray-800'
                                : estimate.status === 'In Progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800')
                            }
                          >
                            {estimate.status}
                          </span>
                          {estimate.timeReturned && (
                            <div className='text-xs text-gray-500 mt-1'>
                              Returned: {displayTime(estimate.timeReturned)}
                            </div>
                          )}
                        </div>
                        <div>
                          {estimate.estimateAmount && (
                            <div className='text-sm font-medium text-green-600'>
                              ${parseFloat(estimate.estimateAmount).toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div className='flex items-center gap-1'>
                          {estimate.aiPriority && (
                            <span
                              className={
                                'inline-flex px-2 py-1 rounded-full text-xs font-medium ' +
                                (estimate.aiPriority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : estimate.aiPriority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800')
                              }
                            >
                              {estimate.aiPriority} priority
                            </span>
                          )}
                          {hasAnomaly && (
                            <AlertTriangle className='w-4 h-4 text-red-500' />
                          )}
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleEdit(estimate)}
                          className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg'
                        >
                          <Edit2 className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => removeEstimate(estimate.id)}
                          className='p-2 text-red-600 hover:bg-red-50 rounded-lg'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  )}

                  {hasAnomaly && (
                    <div className='mt-3 p-2 bg-red-100 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <AlertTriangle className='w-4 h-4 text-red-600' />
                        <span className='text-sm font-medium text-red-800'>
                          AI Alert
                        </span>
                      </div>
                      <p className='text-sm text-red-700 mt-1'>
                        {hasAnomaly.message}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredEstimates.length === 0 && (
              <div className='text-center py-8 text-gray-500'>
                No estimates in the work queue. Create a new estimate to get
                started.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Billing Queue Component
  const BillingQueue = () => {
    const [editingAmount, setEditingAmount] = useState(null);
    const [editValue, setEditValue] = useState('');

    const billingEstimates = estimates.filter(
      (est) =>
        est.estimateType === 'Final' &&
        est.status === 'Done' &&
        !est.clientBilled
    );

    const totalBillingAmount = billingEstimates.reduce(
      (sum, est) => sum + parseFloat(est.estimateAmount || 0),
      0
    );

    const handleAmountEdit = (id, amount) => {
      setEditingAmount(id);
      setEditValue(amount ?? '');
    };

    const saveAmount = async (est) => {
      await updateEstimate({ ...est, estimateAmount: editValue });
      setEditingAmount(null);
      setEditValue('');
    };

    const markAsBilled = async (est) => {
      await updateEstimate({ ...est, clientBilled: true });
    };

    return (
      <div className='space-y-6'>
        <AIInsightsPanel />

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                <DollarSign className='w-5 h-5 text-green-600' />
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Billing Queue
              </h2>
            </div>
            <div className='flex items-center gap-4'>
              <div className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium'>
                Total: ${totalBillingAmount.toLocaleString()}
              </div>
              <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm'>
                {billingEstimates.length} ready to bill
              </span>
            </div>
          </div>

          <div className='space-y-4'>
            {billingEstimates.map((estimate) => (
              <div
                key={estimate.id}
                className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1 grid md:grid-cols-3 gap-4'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {estimate.clientName}
                      </div>
                      <div className='text-xs text-gray-500'>
                        Claim: {estimate.claimNumber}
                      </div>
                      <div className='text-xs text-gray-500'>
                        Task: {estimate.taskNumber}
                      </div>
                    </div>
                    <div>
                      <div className='text-xs text-gray-500 mb-1'>Returned</div>
                      <div className='text-sm'>
                        {estimate.dateReturned}{' '}
                        {displayTime(estimate.timeReturned)}
                      </div>
                    </div>
                    <div>
                      <div className='text-xs text-gray-500 mb-1'>
                        Estimate Amount
                      </div>
                      {editingAmount === estimate.id ? (
                        <div className='flex gap-2'>
                          <input
                            type='number'
                            step='0.01'
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className='w-24 px-2 py-1 border border-gray-300 rounded text-sm'
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveAmount(estimate);
                            }}
                          />
                          <button
                            onClick={() => saveAmount(estimate)}
                            className='bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700'
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleAmountEdit(
                              estimate.id,
                              estimate.estimateAmount
                            )
                          }
                          className='text-lg font-semibold text-green-600 hover:text-green-700'
                        >
                          ${parseFloat(estimate.estimateAmount || 0).toFixed(2)}
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => markAsBilled(estimate)}
                    className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium ml-4'
                  >
                    Client Billed
                  </button>
                </div>
              </div>
            ))}
            {billingEstimates.length === 0 && (
              <div className='text-center py-8 text-gray-500'>
                No estimates ready for billing. Complete final estimates to see
                them here.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Daily Estimate Tracker Component
  const DailyEstimateTracker = () => {
    const completedOnDate = estimates.filter(
      (est) => est.status === 'Done' && est.dateReturned === selectedDate
    );

    const initialCount = completedOnDate.filter(
      (est) => est.estimateType === 'Initial'
    ).length;
    const finalCount = completedOnDate.filter(
      (est) => est.estimateType === 'Final'
    ).length;
    const totalCount = completedOnDate.length;

    const avgDaily =
      estimates.filter((est) => est.status === 'Done' && est.dateReturned)
        .length / 30;
    const todayVsAverage = totalCount - avgDaily;
    const performanceMessage =
      todayVsAverage > 0
        ? '+' + todayVsAverage.toFixed(1) + ' above average'
        : todayVsAverage.toFixed(1) + ' below average';

    return (
      <div className='space-y-6'>
        <AIInsightsPanel />

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                <Calendar className='w-5 h-5 text-purple-600' />
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Daily Estimate Tracker
              </h2>
              <div className='flex items-center gap-2'>
                <Brain className='w-5 h-5 text-purple-600' />
                <span className='text-sm text-purple-600'>AI Analytics</span>
              </div>
            </div>
          </div>

          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Select Date
            </label>
            <input
              type='date'
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>

          <div className='grid md:grid-cols-4 gap-6 mb-6'>
            <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6'>
              <div className='text-2xl font-bold text-blue-800'>
                {totalCount}
              </div>
              <div className='text-sm text-blue-600'>Total Completed</div>
              <div className='text-xs text-blue-500 mt-1'>
                {performanceMessage}
              </div>
            </div>
            <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6'>
              <div className='text-2xl font-bold text-green-800'>
                {initialCount}
              </div>
              <div className='text-sm text-green-600'>Initial Estimates</div>
            </div>
            <div className='bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6'>
              <div className='text-2xl font-bold text-purple-800'>
                {finalCount}
              </div>
              <div className='text-sm text-purple-600'>Final Estimates</div>
            </div>
            <div className='bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6'>
              <div className='text-2xl font-bold text-orange-800'>
                {avgDaily.toFixed(1)}
              </div>
              <div className='text-sm text-orange-600'>Daily Average</div>
              <div className='text-xs text-orange-500 mt-1'>Last 30 days</div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-3'>
              <Lightbulb className='w-5 h-5 text-indigo-600' />
              <h3 className='font-semibold text-indigo-900'>
                AI Insights for {selectedDate}
              </h3>
            </div>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='bg-white rounded-lg p-3'>
                <div className='text-sm font-medium text-gray-900 mb-1'>
                  Performance Trend
                </div>
                <div
                  className={
                    'text-lg font-bold ' +
                    (todayVsAverage >= 0 ? 'text-green-600' : 'text-red-600')
                  }
                >
                  {todayVsAverage >= 0 ? '↗' : '↘'}{' '}
                  {Math.abs(todayVsAverage).toFixed(1)} estimates
                </div>
                <p className='text-xs text-gray-600 mt-1'>
                  {todayVsAverage >= 0
                    ? 'Above average performance'
                    : 'Below average - consider optimization'}
                </p>
              </div>
              <div className='bg-white rounded-lg p-3'>
                <div className='text-sm font-medium text-gray-900 mb-1'>
                  Efficiency Score
                </div>
                <div className='text-lg font-bold text-blue-600'>
                  {Math.round((totalCount / Math.max(avgDaily, 1)) * 100)}%
                </div>
                <p className='text-xs text-gray-600 mt-1'>
                  Compared to your historical average
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Productivity Calculator Component
  const ProductivityCalculator = () => {
    const getWeekStart = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };

    const getWeekEnd = (date) => {
      const start = getWeekStart(date);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return end;
    };

    const weekStart = getWeekStart(selectedWeek);
    const weekEnd = getWeekEnd(selectedWeek);

    const weekEstimates = estimates.filter((est) => {
      if (est.status !== 'Done' || !est.dateReturned) return false;
      const returnDate = new Date(est.dateReturned);
      return returnDate >= weekStart && returnDate <= weekEnd;
    });

    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEstimates = weekEstimates.filter(
        (est) => est.dateReturned === dateStr
      );
      dailyBreakdown.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayEstimates.length,
      });
    }

    const totalWeeklyEstimates = weekEstimates.length;
    const availableHours = 40 - ptoHours + otHours;
    const productivityRate =
      availableHours > 0
        ? ((totalWeeklyEstimates / availableHours) * 100).toFixed(1)
        : 0;

    const aiProductivityAnalysis =
      aiAnalytics.analyzeProductivity(dailyBreakdown);
    const weeklyRevenue = weekEstimates.reduce(
      (sum, est) => sum + parseFloat(est.estimateAmount || 0),
      0
    );
    const avgEstimateValue = weeklyRevenue / Math.max(totalWeeklyEstimates, 1);

    const navigateWeek = (direction) => {
      const newDate = new Date(selectedWeek);
      newDate.setDate(selectedWeek.getDate() + direction * 7);
      setSelectedWeek(newDate);
    };

    return (
      <div className='space-y-6'>
        <AIInsightsPanel />

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center'>
                <TrendingUp className='w-5 h-5 text-indigo-600' />
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Productivity Calculator
              </h2>
              <div className='flex items-center gap-2'>
                <Brain className='w-5 h-5 text-purple-600' />
                <span className='text-sm text-purple-600'>AI Enhanced</span>
              </div>
            </div>
            <button className='flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700'>
              <Mail className='w-4 h-4' />
              Email Report
            </button>
          </div>

          <div className='flex items-center justify-between mb-6'>
            <button
              onClick={() => navigateWeek(-1)}
              className='p-2 hover:bg-gray-100 rounded-lg'
            >
              <ChevronLeft className='w-5 h-5' />
            </button>
            <div className='text-center'>
              <div className='text-lg font-semibold text-gray-900'>
                {weekStart.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {weekEnd.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
            <button
              onClick={() => navigateWeek(1)}
              className='p-2 hover:bg-gray-100 rounded-lg'
            >
              <ChevronRight className='w-5 h-5' />
            </button>
          </div>

          <div className='grid md:grid-cols-2 gap-6 mb-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                PTO Hours
              </label>
              <input
                type='number'
                value={ptoHours}
                onChange={(e) => setPtoHours(Number(e.target.value))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                min='0'
                max='40'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                OT Hours
              </label>
              <input
                type='number'
                value={otHours}
                onChange={(e) => setOtHours(Number(e.target.value))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                min='0'
              />
            </div>
          </div>

          <div className='grid md:grid-cols-4 gap-6 mb-6'>
            <div className='bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-6'>
              <div className='text-2xl font-bold text-indigo-800'>
                {totalWeeklyEstimates}
              </div>
              <div className='text-sm text-indigo-600'>Estimates Completed</div>
              <div
                className={
                  'text-xs mt-1 ' +
                  (aiProductivityAnalysis.trend === 'increasing'
                    ? 'text-green-500'
                    : 'text-red-500')
                }
              >
                {aiProductivityAnalysis.trend === 'increasing' ? '↗' : '↘'}{' '}
                {aiProductivityAnalysis.trend}
              </div>
            </div>
            <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6'>
              <div className='text-2xl font-bold text-green-800'>
                {availableHours}h
              </div>
              <div className='text-sm text-green-600'>Available Hours</div>
            </div>
            <div className='bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6'>
              <div className='text-2xl font-bold text-yellow-800'>
                {productivityRate}%
              </div>
              <div className='text-sm text-yellow-600'>Productivity Rate</div>
              <div
                className={
                  'text-xs mt-1 ' +
                  (aiProductivityAnalysis.riskLevel === 'low'
                    ? 'text-green-500'
                    : aiProductivityAnalysis.riskLevel === 'medium'
                    ? 'text-yellow-500'
                    : 'text-red-500')
                }
              >
                {aiProductivityAnalysis.riskLevel} risk
              </div>
            </div>
            <div className='bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6'>
              <div className='text-2xl font-bold text-purple-800'>
                ${weeklyRevenue.toLocaleString()}
              </div>
              <div className='text-sm text-purple-600'>Weekly Revenue</div>
              <div className='text-xs text-purple-500 mt-1'>
                Avg: ${avgEstimateValue.toFixed(0)}/estimate
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6'>
            <div className='flex items-center gap-2 mb-3'>
              <PieChart className='w-5 h-5 text-blue-600' />
              <h3 className='font-semibold text-blue-900'>
                AI Productivity Analysis
              </h3>
            </div>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='bg-white rounded-lg p-3'>
                <div className='text-sm font-medium text-gray-900 mb-1'>
                  Performance Trend
                </div>
                <div
                  className={
                    'text-lg font-bold ' +
                    (aiProductivityAnalysis.trend === 'increasing'
                      ? 'text-green-600'
                      : 'text-red-600')
                  }
                >
                  {aiProductivityAnalysis.trend === 'increasing' ? '📈' : '📉'}{' '}
                  {aiProductivityAnalysis.trend}
                </div>
                <p className='text-xs text-gray-600 mt-1'>
                  Daily average: {aiProductivityAnalysis.avgDaily} estimates
                </p>
              </div>
              <div className='bg-white rounded-lg p-3'>
                <div className='text-sm font-medium text-gray-900 mb-1'>
                  AI Recommendation
                </div>
                <p className='text-sm text-gray-700'>
                  {aiProductivityAnalysis.recommendation}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-gray-50 rounded-lg p-4'>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>
              Daily Breakdown
            </h3>
            <div className='grid grid-cols-7 gap-2'>
              {dailyBreakdown.map((day, index) => {
                const isHighPerformance =
                  day.count > aiProductivityAnalysis.avgDaily;
                return (
                  <div key={index} className='text-center'>
                    <div className='text-xs text-gray-500 mb-1'>{day.day}</div>
                    <div
                      className={
                        'rounded-lg p-2 border ' +
                        (isHighPerformance
                          ? 'bg-green-100 border-green-200'
                          : 'bg-white border-gray-200')
                      }
                    >
                      <div
                        className={
                          'text-lg font-semibold ' +
                          (isHighPerformance
                            ? 'text-green-800'
                            : 'text-gray-900')
                        }
                      >
                        {day.count}
                      </div>
                      {isHighPerformance && (
                        <Star className='w-3 h-3 text-yellow-500 mx-auto mt-1' />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-3'>
              <h1 className='text-xl font-semibold text-gray-900'>
                Estimate Management Dashboard
              </h1>
              <div className='flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs'>
                <Brain className='w-3 h-3' />
                AI Enhanced
              </div>
            </div>
            <div className='flex space-x-1'>
              {[
                { id: 'intake', label: 'New Request', icon: Plus },
                { id: 'workQueue', label: 'Work Queue', icon: Edit2 },
                { id: 'billing', label: 'Billing', icon: DollarSign },
                { id: 'daily', label: 'Daily Tracker', icon: Calendar },
                { id: 'productivity', label: 'Productivity', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
                    (activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100')
                  }
                >
                  <tab.icon className='w-4 h-4' />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {activeTab === 'intake' && <IntakeForm />}
        {activeTab === 'workQueue' && <WorkQueue />}
        {activeTab === 'billing' && <BillingQueue />}
        {activeTab === 'daily' && <DailyEstimateTracker />}
        {activeTab === 'productivity' && <ProductivityCalculator />}
      </main>

      <footer className='bg-white border-t border-gray-200 mt-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='grid grid-cols-5 gap-6 text-center'>
            <div>
              <div className='text-lg font-semibold text-gray-900'>
                {estimates.filter((e) => e.status === 'Not Started').length}
              </div>
              <div className='text-xs text-gray-500'>Not Started</div>
            </div>
            <div>
              <div className='text-lg font-semibold text-yellow-600'>
                {estimates.filter((e) => e.status === 'In Progress').length}
              </div>
              <div className='text-xs text-gray-500'>In Progress</div>
            </div>
            <div>
              <div className='text-lg font-semibold text-green-600'>
                {estimates.filter((e) => e.status === 'Done').length}
              </div>
              <div className='text-xs text-gray-500'>Completed</div>
            </div>
            <div>
              <div className='text-lg font-semibold text-blue-600'>
                {
                  estimates.filter(
                    (e) =>
                      e.estimateType === 'Final' &&
                      e.status === 'Done' &&
                      !e.clientBilled
                  ).length
                }
              </div>
              <div className='text-xs text-gray-500'>Ready to Bill</div>
            </div>
            <div>
              <div className='text-lg font-semibold text-purple-600'>
                $
                {estimates
                  .filter((e) => e.estimateAmount)
                  .reduce((sum, e) => sum + parseFloat(e.estimateAmount), 0)
                  .toLocaleString()}
              </div>
              <div className='text-xs text-gray-500'>Total Value</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EstimateManagementDashboard;
