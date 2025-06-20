import { useMemo } from 'react';

/**
 * ProgressDashboard Component
 * Shows workout history, progress charts, weekly summaries, and cumulative volume
 * Displays trends and achievements in the KSK program
 */
const ProgressDashboard = ({ workoutHistory = [], targetSnatches = 100 }) => {
  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!workoutHistory.length) {
      return {
        totalWorkouts: 0,
        totalReps: 0,
        totalSnatches: 0,
        totalVolume: 0,
        averageReps: 0,
        averageSnatches: 0,
        averageWeight: 0,
        bestSession: null,
        bestSnatchSession: null,
        recentWorkouts: []
      };
    }

    const totalWorkouts = workoutHistory.length;
    const totalReps = workoutHistory.reduce((sum, workout) => sum + workout.totalReps, 0);
    
    // Calculate total snatches: (left + right) × sets for each workout
    const totalSnatches = workoutHistory.reduce((sum, workout) => {
      // For newer workouts that have the correct calculation
      if (workout.setsCompleted && workout.leftHandReps && workout.rightHandReps) {
        return sum + ((workout.leftHandReps + workout.rightHandReps) * workout.setsCompleted);
      }
      // For older workouts, assume totalReps is already correct or use as fallback
      return sum + workout.totalReps;
    }, 0);
    
    const totalVolume = workoutHistory.reduce((sum, workout) => {
      const snatches = workout.setsCompleted && workout.leftHandReps && workout.rightHandReps 
        ? (workout.leftHandReps + workout.rightHandReps) * workout.setsCompleted
        : workout.totalReps;
      return sum + (snatches * workout.kettlebellWeight);
    }, 0);
    
    const averageReps = Math.round(totalReps / totalWorkouts);
    const averageSnatches = Math.round(totalSnatches / totalWorkouts);
    const averageWeight = Math.round(
      workoutHistory.reduce((sum, workout) => sum + workout.kettlebellWeight, 0) / totalWorkouts * 10
    ) / 10;

    // Find best session (highest total snatches)
    const bestSession = workoutHistory.reduce((best, current) => {
      const currentSnatches = current.setsCompleted && current.leftHandReps && current.rightHandReps 
        ? (current.leftHandReps + current.rightHandReps) * current.setsCompleted
        : current.totalReps;
      const bestSnatches = best?.setsCompleted && best?.leftHandReps && best?.rightHandReps 
        ? (best.leftHandReps + best.rightHandReps) * best.setsCompleted
        : best?.totalReps || 0;
      return currentSnatches > bestSnatches ? current : best;
    }, null);

    // Best snatch session is the same as best session
    const bestSnatchSession = bestSession;

    // Get recent workouts (last 5)
    const recentWorkouts = [...workoutHistory]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return {
      totalWorkouts,
      totalReps,
      totalSnatches,
      totalVolume,
      averageReps,
      averageSnatches,
      averageWeight,
      bestSession,
      bestSnatchSession,
      recentWorkouts
    };
  }, [workoutHistory]);

  // Calculate weekly summaries
  const weeklyData = useMemo(() => {
    if (!workoutHistory.length) return [];

    const weeks = {};
    
    workoutHistory.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          weekStart: weekKey,
          workouts: 0,
          totalReps: 0,
          totalVolume: 0,
          sessions: []
        };
      }
      
      const snatches = workout.setsCompleted && workout.leftHandReps && workout.rightHandReps 
        ? (workout.leftHandReps + workout.rightHandReps) * workout.setsCompleted
        : workout.totalReps;
      
      weeks[weekKey].workouts++;
      weeks[weekKey].totalReps += snatches;
      weeks[weekKey].totalVolume += snatches * workout.kettlebellWeight;
      weeks[weekKey].sessions.push(workout);
    });

    return Object.values(weeks)
      .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart))
      .slice(0, 8); // Last 8 weeks
  }, [workoutHistory]);

  // Daily snatches bar chart data with target comparison
  const dailyChartData = useMemo(() => {
    if (!workoutHistory.length) return [];

    // Group workouts by date and sum snatches for each day
    const dailyTotals = {};
    
    workoutHistory.forEach(workout => {
      const date = workout.date;
      const snatches = workout.setsCompleted && workout.leftHandReps && workout.rightHandReps 
        ? (workout.leftHandReps + workout.rightHandReps) * workout.setsCompleted
        : workout.totalReps;
      
      if (dailyTotals[date]) {
        dailyTotals[date] += snatches;
      } else {
        dailyTotals[date] = snatches;
      }
    });

    // Convert to array and sort by date, take last 14 days
    return Object.entries(dailyTotals)
      .map(([date, snatches]) => ({
        date,
        snatches,
        targetMet: snatches >= targetSnatches,
        percentage: Math.min((snatches / targetSnatches) * 100, 100)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14);
  }, [workoutHistory, targetSnatches]);

  // Simple line chart data for snatches over time
  const chartData = useMemo(() => {
    return workoutHistory
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10) // Last 10 sessions
      .map((workout, index) => {
        const snatches = workout.setsCompleted && workout.leftHandReps && workout.rightHandReps 
          ? (workout.leftHandReps + workout.rightHandReps) * workout.setsCompleted
          : workout.totalReps;
        return {
          session: index + 1,
          reps: snatches,
          date: workout.date
        };
      });
  }, [workoutHistory]);

  if (!workoutHistory.length) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">📈</div>
          <h2 className="text-xl font-bold text-neutral-800">Progress Dashboard</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-neutral-500 mb-2 font-medium">No workout data yet</p>
          <p className="text-sm text-neutral-400">Complete your first workout to see progress tracking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Statistics */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">📈</div>
          <h2 className="text-xl font-bold text-neutral-800">Progress Overview</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200/50">
            <p className="text-3xl font-bold text-primary-600 mb-2">{stats.totalWorkouts}</p>
            <p className="text-sm text-primary-800 font-medium">Total Workouts</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200/50">
            <p className="text-3xl font-bold text-emerald-600 mb-2">{stats.totalSnatches.toLocaleString()}</p>
            <p className="text-sm text-emerald-800 font-medium">Total Snatches</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl border border-violet-200/50">
            <p className="text-3xl font-bold text-violet-600 mb-2">{stats.averageSnatches}</p>
            <p className="text-sm text-violet-800 font-medium">Avg Snatches/Session</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200/50">
            <p className="text-3xl font-bold text-orange-600 mb-2">{stats.totalVolume.toLocaleString()}</p>
            <p className="text-sm text-orange-800 font-medium">Total Volume (kg×snatches)</p>
          </div>
        </div>
      </div>

      {/* Daily Snatches Bar Chart */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="text-xl mr-2">📊</div>
            <h3 className="text-lg font-bold text-neutral-800">Daily Snatches vs Target</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded mr-2"></div>
              <span className="text-neutral-600">Target Met</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded mr-2"></div>
              <span className="text-neutral-600">Below Target</span>
            </div>
          </div>
        </div>
        
        {dailyChartData.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-neutral-600 mb-4">
              <span>Target: {targetSnatches} snatches/day</span>
              <span>Last 14 days</span>
            </div>
            
            {dailyChartData.map((day, index) => {
              const maxHeight = Math.max(targetSnatches, Math.max(...dailyChartData.map(d => d.snatches)));
              const barHeight = (day.snatches / maxHeight) * 100;
              const targetLineHeight = (targetSnatches / maxHeight) * 100;
              
              return (
                <div key={index} className="relative">
                  <div className="flex items-end space-x-3 h-16">
                    <div className="w-20 text-xs text-neutral-600 text-right flex-shrink-0">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    <div className="flex-1 relative bg-neutral-100 rounded-lg h-full">
                      {/* Target line */}
                      <div 
                        className="absolute w-full border-t-2 border-dashed border-neutral-400 z-10"
                        style={{ bottom: `${targetLineHeight}%` }}
                      ></div>
                      
                      {/* Snatch bar */}
                      <div 
                        className={`absolute bottom-0 w-full rounded-lg transition-all duration-500 shadow-soft ${
                          day.targetMet 
                            ? 'bg-gradient-to-t from-emerald-500 to-green-400' 
                            : 'bg-gradient-to-t from-amber-500 to-orange-400'
                        }`}
                        style={{ height: `${barHeight}%` }}
                      ></div>
                      
                      {/* Value label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {day.snatches}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-12 text-xs text-neutral-600 flex-shrink-0">
                      {Math.round(day.percentage)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-neutral-500 font-medium text-center py-8">
            No workout data yet. Complete your first workout to see daily progress!
          </p>
        )}
      </div>

      {/* Simple Progress Chart */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8">
        <div className="flex items-center mb-6">
          <div className="text-xl mr-2">📉</div>
          <h3 className="text-lg font-bold text-neutral-800">Recent Progress (Last 10 Sessions)</h3>
        </div>
        {chartData.length > 0 ? (
          <div className="space-y-2">
            {chartData.map((session, index) => {
              const maxReps = Math.max(...chartData.map(s => s.reps));
              const barWidth = (session.reps / maxReps) * 100;
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-sm text-gray-600 text-right">
                    {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 bg-neutral-200 rounded-full h-8 relative shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-accent-500 h-8 rounded-full transition-all duration-500 shadow-soft"
                      style={{ width: `${barWidth}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {session.reps} snatches
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-neutral-500 font-medium">Need more sessions for progress tracking</p>
        )}
      </div>

      {/* Weekly Summary */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8">
        <div className="flex items-center mb-6">
          <div className="text-xl mr-2">🗓️</div>
          <h3 className="text-lg font-bold text-neutral-800">Weekly Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Week Starting</th>
                <th className="text-center p-2">Workouts</th>
                <th className="text-center p-2">Total Snatches</th>
                <th className="text-center p-2">Volume</th>
                <th className="text-center p-2">Avg per Session</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((week, index) => (
                <tr key={week.weekStart} className={index % 2 === 0 ? 'bg-neutral-50' : ''}>
                  <td className="p-2">
                    {new Date(week.weekStart).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="text-center p-2">{week.workouts}</td>
                  <td className="text-center p-2">{week.totalReps}</td>
                  <td className="text-center p-2">{Math.round(week.totalVolume).toLocaleString()}</td>
                  <td className="text-center p-2">{Math.round(week.totalReps / week.workouts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8">
        <div className="flex items-center mb-6">
          <div className="text-xl mr-2">🗒</div>
          <h3 className="text-lg font-bold text-neutral-800">Recent Workouts</h3>
        </div>
        <div className="space-y-3">
          {stats.recentWorkouts.map((workout, index) => (
            <div key={workout.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200/50">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {new Date(workout.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {workout.kettlebellWeight}kg
                  </span>
                  <span className="text-sm text-gray-600">
                    {workout.leftHandReps}L + {workout.rightHandReps}R = {workout.totalReps} snatches
                  </span>
                </div>
                {workout.notes && (
                  <p className="text-xs text-gray-500 mt-1">{workout.notes}</p>
                )}
              </div>
              {workout.rpe && (
                <div className="text-right">
                  <span className="text-xs text-gray-500">RPE</span>
                  <div className="text-sm font-medium">{workout.rpe}/10</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Best Session Highlight */}
      {stats.bestSession && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-100 rounded-2xl border border-amber-200/50 p-8 shadow-soft">
          <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center">
            <div className="text-2xl mr-3">🏆</div>
            Best Snatch Session
          </h3>
          <div className="text-yellow-700">
            <p className="font-medium">
              {stats.bestSession.setsCompleted && stats.bestSession.leftHandReps && stats.bestSession.rightHandReps 
                ? (stats.bestSession.leftHandReps + stats.bestSession.rightHandReps) * stats.bestSession.setsCompleted
                : stats.bestSession.totalReps} snatches on {new Date(stats.bestSession.date).toLocaleDateString()}
            </p>
            <p className="text-sm">
              {stats.bestSession.kettlebellWeight}kg • {stats.bestSession.leftHandReps}L + {stats.bestSession.rightHandReps}R
              {stats.bestSession.setsCompleted && ` • ${stats.bestSession.setsCompleted} sets`}
              {stats.bestSession.rpe && ` • RPE ${stats.bestSession.rpe}/10`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;