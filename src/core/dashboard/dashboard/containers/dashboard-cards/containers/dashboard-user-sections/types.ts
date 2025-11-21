export interface DashboardCardState {
  id: string;
  title: string;
  description: string | null;
  color: 'red' | 'orange' | 'yellow';
  icon: string;
  query: string;
  variables: Record<string, any> | string | null;
  queryKey: string;
  url?: string | null;
  loading: boolean;
  count: number;
  error: boolean;
  sortOrder: number | null;
}

export interface DashboardSectionState {
  id: string;
  title: string;
  description: string | null;
  cards: DashboardCardState[];
  sortOrder: number | null;
}

export interface EditableDashboardSection extends DashboardSectionState {
  clientId: string;
  persistedId: string | null;
  isNew?: boolean;
  cards: EditableDashboardCard[];
}

export interface EditableDashboardCard extends DashboardCardState {
  clientId: string;
  persistedId: string | null;
}
