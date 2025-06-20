// KSK Program configurations with exact prescriptions from PDFs

export const KSK_PROGRAMS = {
  '1.0': {
    name: 'KSK 1.0',
    description: 'Original King-Sized Killer program',
    phases: 3,
    weeksPerPhase: 3,
    daysPerWeek: 3,
    dayNames: ['Monday', 'Wednesday', 'Friday'],
    schedule: {
      // Phase 1: Ladders
      1: {
        name: 'Phase 1 - Ladders',
        weeks: 3,
        workouts: {
          monday: {
            type: 'ladders',
            pattern: [1, 2, 3, 4, 5],
            description: 'Ladders of 1,2,3,4,5 reps per hand'
          },
          wednesday: {
            type: 'ladders', 
            pattern: [1, 2, 3],
            description: 'Ladders of 1,2,3 reps per hand'
          },
          friday: {
            type: 'ladders',
            pattern: [1, 2, 3, 4], 
            description: 'Ladders of 1,2,3,4 reps per hand'
          }
        }
      },
      // Phase 2: Sets
      2: {
        name: 'Phase 2 - Sets',
        weeks: 3,
        workouts: {
          monday: {
            type: 'sets',
            pattern: [3, 6, 9],
            description: 'Sets of 3,6,9 reps per hand'
          },
          wednesday: {
            type: 'sets',
            pattern: [3, 6],
            description: 'Sets of 3,6 reps per hand'
          },
          friday: {
            type: 'sets',
            pattern: [3, 6, 9, 12],
            description: 'Sets of 3,6,9,12 reps per hand'
          }
        }
      },
      // Phase 3: Heavy Sets
      3: {
        name: 'Phase 3 - Heavy Sets',
        weeks: 3,
        workouts: {
          monday: {
            type: 'sets',
            pattern: [9],
            description: 'Sets of 9 reps per hand'
          },
          wednesday: {
            type: 'sets',
            pattern: [15],
            description: 'Sets of 15 reps per hand'
          },
          friday: {
            type: 'sets',
            pattern: [12],
            description: 'Sets of 12 reps per hand'
          }
        }
      }
    }
  },

  '2.0': {
    name: 'KSK 2.0',
    description: 'King-Sized Killer 2.0 - Fixed rep targets',
    phases: 3,
    weeksPerPhase: 3,
    daysPerWeek: 3,
    dayNames: ['Monday', 'Wednesday', 'Friday'],
    schedule: {
      // Phase 1
      1: {
        name: 'Phase 1',
        weeks: 3,
        workouts: {
          monday: {
            type: 'fixed_reps',
            repsPerHand: 10,
            description: '10 reps per hand'
          },
          wednesday: {
            type: 'fixed_reps',
            repsPerHand: 20,
            description: '20 reps per hand'
          },
          friday: {
            type: 'fixed_reps',
            repsPerHand: 15,
            description: '15 reps per hand'
          }
        }
      },
      // Phase 2
      2: {
        name: 'Phase 2',
        weeks: 3,
        workouts: {
          monday: {
            type: 'fixed_reps',
            repsPerHand: 12,
            description: '12 reps per hand'
          },
          wednesday: {
            type: 'fixed_reps',
            repsPerHand: 24,
            description: '24 reps per hand'
          },
          friday: {
            type: 'fixed_reps',
            repsPerHand: 18,
            description: '18 reps per hand'
          }
        }
      },
      // Phase 3
      3: {
        name: 'Phase 3',
        weeks: 3,
        workouts: {
          monday: {
            type: 'fixed_reps',
            repsPerHand: 15,
            description: '15 reps per hand'
          },
          wednesday: {
            type: 'fixed_reps',
            repsPerHand: 30,
            description: '30 reps per hand'
          },
          friday: {
            type: 'fixed_reps',
            repsPerHand: 20,
            description: '20 reps per hand'
          }
        }
      }
    }
  },

  '3.0': {
    name: 'KSK 3.0',
    description: 'King-Sized Killer 3.0 - Percentage-based program',
    phases: 1,
    weeksPerPhase: 4,
    daysPerWeek: 3,
    dayNames: ['Monday', 'Wednesday', 'Friday'],
    requiresMaxInput: true,
    schedule: {
      1: {
        name: 'KSK 3.0 Program',
        weeks: 4,
        workouts: {
          monday: {
            type: 'percentage',
            percentages: {
              1: 50, // Week 1
              2: 60, // Week 2  
              3: 50, // Week 3
              4: 60  // Week 4
            },
            description: 'Week 1/3: 50% of max, Week 2/4: 60% of max'
          },
          wednesday: {
            type: 'percentage',
            percentages: {
              1: 65, // Week 1
              2: 75, // Week 2
              3: 65, // Week 3
              4: 75  // Week 4
            },
            description: 'Week 1/3: 65% of max, Week 2/4: 75% of max'
          },
          friday: {
            type: 'percentage',
            percentages: {
              1: 70, // Week 1
              2: 80, // Week 2
              3: 70, // Week 3
              4: 80  // Week 4
            },
            description: 'Week 1/3: 70% of max, Week 2/4: 80% of max'
          }
        }
      }
    }
  }
};

// Helper functions for calculations
export const calculateKSK3Reps = (maxReps, day, week) => {
  const program = KSK_PROGRAMS['3.0'];
  const workout = program.schedule[1].workouts[day];
  const percentage = workout.percentages[week];
  const totalReps = Math.round((maxReps * percentage) / 100);
  const repsPerHand = Math.round(totalReps / 2);
  
  return {
    totalReps,
    repsPerHand,
    percentage
  };
};

export const getTotalRepsForWorkout = (program, phase, day, week = 1) => {
  const programData = KSK_PROGRAMS[program];
  const workout = programData.schedule[phase].workouts[day];
  
  switch (workout.type) {
    case 'ladders':
      // For ladders, sum all rungs in the pattern
      return workout.pattern.reduce((sum, rung) => sum + rung, 0) * 2; // * 2 for both hands
    
    case 'sets':
      // For sets, sum all the reps
      return workout.pattern.reduce((sum, reps) => sum + reps, 0) * 2; // * 2 for both hands
    
    case 'fixed_reps':
      return workout.repsPerHand * 2; // Already per hand, multiply by 2
    
    case 'percentage':
      // This requires maxReps input, return null if not provided
      return null;
    
    default:
      return 0;
  }
};