import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface TeamPulse {
  id: string;
  teamName: string;
  memberCount: number;
  responseRate: number; // Percentage
  engagementScore: number; // 0-100 eNPS equivalent
  burnoutRisk: number; // 0-100
  sentimentTrend: number[]; // Last 14 days history
  topTopics: string[];
  status: 'Thriving' | 'Stable' | 'At Risk';
  lastSurveyDate: string;
}

interface PulseState {
  teams: Record<string, TeamPulse>;
  updateTeam: (id: string, data: Partial<TeamPulse>) => void;
  setTeams: (teams: TeamPulse[]) => void;
}

const MOCK_TEAMS: TeamPulse[] = [
  {
    id: 'eng-001',
    teamName: 'Engineering',
    memberCount: 42,
    responseRate: 78,
    engagementScore: 62,
    burnoutRisk: 85,
    sentimentTrend: [65, 64, 62, 60, 58, 55, 62],
    topTopics: ['On - Call Load', 'Tech Debt', 'Remote Policy'],
    status: 'At Risk',
    lastSurveyDate: new Date().toISOString()
  },
  {
    id: 'sales-001',
    teamName: 'Revenue & Sales',
    memberCount: 28,
    responseRate: 92,
    engagementScore: 88,
    burnoutRisk: 30,
    sentimentTrend: [82, 85, 88, 86, 90, 88, 89],
    topTopics: ['Commission Structure', 'Q4 Targets', 'Travel'],
    status: 'Thriving',
    lastSurveyDate: new Date().toISOString()
  },
  {
    id: 'ops-001',
    teamName: 'People Operations',
    memberCount: 15,
    responseRate: 100,
    engagementScore: 75,
    burnoutRisk: 45,
    sentimentTrend: [70, 72, 75, 74, 75, 76, 75],
    topTopics: ['Benefits', 'L&D Budget', 'Hiring Pace'],
    status: 'Stable',
    lastSurveyDate: new Date().toISOString()
  }
];

export const usePulseStore = create<PulseState>()(
  immer((set) => ({
    teams: MOCK_TEAMS.reduce((acc, team) => {
      acc[team.id] = team;
      return acc;
    }, {} as Record<string, TeamPulse>),
    
    updateTeam: (id, data) =>
      set((state) => {
        if (state.teams[id]) {
          Object.assign(state.teams[id], data);
        }
      }),
      
    setTeams: (teams) =>
      set((state) => {
        state.teams = teams.reduce((acc, team) => {
          acc[team.id] = team;
          return acc;
        }, {} as Record<string, TeamPulse>);
      }),
  }))
);
