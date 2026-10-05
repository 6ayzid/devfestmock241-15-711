export type NodeType = 'room' | 'junction' | 'exit';

export interface BuildingNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
}

export interface BuildingEdge {
  id: string;
  from: string;
  to: string;
  cost: number;
}

export interface InitialState {
  blocked_nodes: string[];
  blocked_edges: string[];
  closed_exits: string[];
}

export interface BuildingData {
  building: string;
  nodes: BuildingNode[];
  edges: BuildingEdge[];
  initial_state: InitialState;
}

export type RouteStatus = 'FOUND' | 'NO_ROUTE' | 'START_BLOCKED';

export interface RouteResult {
  status: RouteStatus;
  path: string[];          // Sequence of node IDs: ['R1', 'C1', 'C2', 'E1']
  edgeIds: string[];      // Sequence of edge IDs traversed
  totalCost: number;
  targetExitId: string | null;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: BuildingData;
}
