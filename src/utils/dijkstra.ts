import type {
  BuildingData,
  BuildingEdge,
  BuildingNode,
  RouteResult,
  ValidationResult,
} from '../types/building';

/**
 * Validates uploaded or provided BuildingData according to Section 3.1 rules.
 */
export function validateBuildingData(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Input must be a valid JSON object.' };
  }

  const obj = data as Record<string, unknown>;

  // 1. building name
  if (typeof obj.building !== 'string' || obj.building.trim().length === 0) {
    return { valid: false, error: 'Field "building" must be a non-empty string.' };
  }

  // 2. nodes array
  if (!Array.isArray(obj.nodes)) {
    return { valid: false, error: 'Field "nodes" must be an array.' };
  }
  if (obj.nodes.length < 2 || obj.nodes.length > 60) {
    return { valid: false, error: `Nodes count must be between 2 and 60 (found ${obj.nodes.length}).` };
  }

  const nodeMap = new Map<string, BuildingNode>();
  let hasRoomOrJunction = false;
  let hasExit = false;

  for (let i = 0; i < obj.nodes.length; i++) {
    const node = obj.nodes[i];
    if (!node || typeof node !== 'object') {
      return { valid: false, error: `Node at index ${i} is invalid.` };
    }
    const { id, label, type, x, y } = node as Record<string, unknown>;

    if (typeof id !== 'string' || id.trim().length === 0) {
      return { valid: false, error: `Node at index ${i} has an invalid or empty "id".` };
    }
    if (nodeMap.has(id)) {
      return { valid: false, error: `Duplicate node ID "${id}" detected.` };
    }
    if (typeof label !== 'string' || label.trim().length === 0) {
      return { valid: false, error: `Node "${id}" must have a non-empty "label".` };
    }
    if (type !== 'room' && type !== 'junction' && type !== 'exit') {
      return { valid: false, error: `Node "${id}" has invalid type "${type}". Must be room, junction, or exit.` };
    }
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      return { valid: false, error: `Node "${id}" has invalid display coordinates x, y.` };
    }

    if (type === 'room' || type === 'junction') hasRoomOrJunction = true;
    if (type === 'exit') hasExit = true;

    nodeMap.set(id, { id, label, type, x, y });
  }

  if (!hasRoomOrJunction) {
    return { valid: false, error: 'Dataset must contain at least one room or junction.' };
  }
  if (!hasExit) {
    return { valid: false, error: 'Dataset must contain at least one exit.' };
  }

  // 3. edges array
  if (!Array.isArray(obj.edges)) {
    return { valid: false, error: 'Field "edges" must be an array.' };
  }
  if (obj.edges.length < 1 || obj.edges.length > 150) {
    return { valid: false, error: `Edges count must be between 1 and 150 (found ${obj.edges.length}).` };
  }

  const edgeIdSet = new Set<string>();
  const edgePairSet = new Set<string>();
  const parsedEdges: BuildingEdge[] = [];

  for (let i = 0; i < obj.edges.length; i++) {
    const edge = obj.edges[i];
    if (!edge || typeof edge !== 'object') {
      return { valid: false, error: `Edge at index ${i} is invalid.` };
    }
    const { id, from, to, cost } = edge as Record<string, unknown>;

    if (typeof id !== 'string' || id.trim().length === 0) {
      return { valid: false, error: `Edge at index ${i} has an invalid "id".` };
    }
    if (edgeIdSet.has(id)) {
      return { valid: false, error: `Duplicate edge ID "${id}" detected.` };
    }
    edgeIdSet.add(id);

    if (typeof from !== 'string' || !nodeMap.has(from)) {
      return { valid: false, error: `Edge "${id}" references non-existent "from" node "${from}".` };
    }
    if (typeof to !== 'string' || !nodeMap.has(to)) {
      return { valid: false, error: `Edge "${id}" references non-existent "to" node "${to}".` };
    }
    if (from === to) {
      return { valid: false, error: `Self-loops are not allowed: edge "${id}" connects "${from}" to itself.` };
    }

    // Undirected pair check: sort pair IDs
    const pairKey = from < to ? `${from}__${to}` : `${to}__${from}`;
    if (edgePairSet.has(pairKey)) {
      return { valid: false, error: `Repeated edge pair detected between "${from}" and "${to}".` };
    }
    edgePairSet.add(pairKey);

    if (typeof cost !== 'number' || !Number.isInteger(cost) || cost <= 0) {
      return { valid: false, error: `Edge "${id}" cost must be a positive integer (found ${cost}).` };
    }

    parsedEdges.push({ id, from, to, cost });
  }

  // 4. initial_state (supports standard object or defaults if omitted)
  const init = (obj.initial_state && typeof obj.initial_state === 'object'
    ? obj.initial_state
    : {}) as Record<string, unknown>;

  const checkArray = (arr: unknown, name: string): string[] => {
    if (arr === undefined || arr === null) return [];
    if (!Array.isArray(arr)) {
      throw new Error(`initial_state.${name} must be an array.`);
    }
    return arr.map((item, idx) => {
      if (typeof item !== 'string') {
        throw new Error(`initial_state.${name}[${idx}] must be a string.`);
      }
      return item;
    });
  };

  try {
    const blocked_nodes = checkArray(init.blocked_nodes, 'blocked_nodes');
    const blocked_edges = checkArray(init.blocked_edges, 'blocked_edges');
    const closed_exits = checkArray(init.closed_exits, 'closed_exits');

    for (const bNodeId of blocked_nodes) {
      const node = nodeMap.get(bNodeId);
      if (!node) {
        return { valid: false, error: `Blocked node "${bNodeId}" does not exist in nodes list.` };
      }
      if (node.type === 'exit') {
        return { valid: false, error: `Blocked node "${bNodeId}" is an exit; exits must be listed in closed_exits.` };
      }
    }

    for (const bEdgeId of blocked_edges) {
      if (!edgeIdSet.has(bEdgeId)) {
        return { valid: false, error: `Blocked edge "${bEdgeId}" does not exist in edges list.` };
      }
    }

    for (const cExitId of closed_exits) {
      const node = nodeMap.get(cExitId);
      if (!node) {
        return { valid: false, error: `Closed exit "${cExitId}" does not exist in nodes list.` };
      }
      if (node.type !== 'exit') {
        return { valid: false, error: `Closed exit "${cExitId}" is not of type "exit".` };
      }
    }

    const validatedData: BuildingData = {
      building: obj.building,
      nodes: Array.from(nodeMap.values()),
      edges: parsedEdges,
      initial_state: {
        blocked_nodes,
        blocked_edges,
        closed_exits,
      },
    };

    return { valid: true, data: validatedData };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
}

/**
 * Compare two paths lexicographically by node IDs
 */
function compareNodePaths(pathA: string[], pathB: string[]): number {
  const minLen = Math.min(pathA.length, pathB.length);
  for (let i = 0; i < minLen; i++) {
    if (pathA[i] < pathB[i]) return -1;
    if (pathA[i] > pathB[i]) return 1;
  }
  return pathA.length - pathB.length;
}

interface PathCandidate {
  cost: number;
  exitId: string;
  path: string[];
  edgeIds: string[];
}

/**
 * Compares two candidates according to Section 3.3:
 * 1. Minimum cost
 * 2. Lexicographically smallest exit ID
 * 3. Lexicographically smallest sequence of node IDs
 */
export function compareCandidates(a: PathCandidate, b: PathCandidate): number {
  if (a.cost !== b.cost) return a.cost - b.cost;
  if (a.exitId !== b.exitId) return a.exitId.localeCompare(b.exitId);
  return compareNodePaths(a.path, b.path);
}

/**
 * Finds the optimal evacuation route using Dijkstra's algorithm.
 */
export function findEvacuationRoute(
  buildingData: BuildingData,
  startNodeId: string,
  blockedNodes: Set<string>,
  blockedEdges: Set<string>,
  closedExits: Set<string>
): RouteResult {
  // Case 1: Start node is blocked
  if (blockedNodes.has(startNodeId)) {
    return {
      status: 'START_BLOCKED',
      path: [],
      edgeIds: [],
      totalCost: 0,
      targetExitId: null,
    };
  }

  const startNode = buildingData.nodes.find((n) => n.id === startNodeId);
  if (!startNode) {
    return {
      status: 'NO_ROUTE',
      path: [],
      edgeIds: [],
      totalCost: 0,
      targetExitId: null,
    };
  }

  // Open exits set
  const openExits = new Set(
    buildingData.nodes
      .filter((n) => n.type === 'exit' && !closedExits.has(n.id) && !blockedNodes.has(n.id))
      .map((n) => n.id)
  );

  if (openExits.size === 0) {
    return {
      status: 'NO_ROUTE',
      path: [],
      edgeIds: [],
      totalCost: 0,
      targetExitId: null,
    };
  }

  // Build Adjacency List (undirected edges)
  // Exclude blocked nodes, closed exits (even as intermediate), and blocked edges
  interface AdjEdge {
    to: string;
    cost: number;
    edgeId: string;
  }

  const adj = new Map<string, AdjEdge[]>();
  for (const node of buildingData.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of buildingData.edges) {
    if (blockedEdges.has(edge.id)) continue;
    if (blockedNodes.has(edge.from) || blockedNodes.has(edge.to)) continue;
    // Closed exits cannot be traversed or entered
    if (closedExits.has(edge.from) || closedExits.has(edge.to)) continue;

    adj.get(edge.from)?.push({ to: edge.to, cost: edge.cost, edgeId: edge.id });
    adj.get(edge.to)?.push({ to: edge.from, cost: edge.cost, edgeId: edge.id });
  }

  // Dijkstra search state tracking best cost and best path to every node
  interface State {
    nodeId: string;
    cost: number;
    path: string[];
    edgeIds: string[];
  }

  // Priority queue simulated via sorted array or min tracking (<= 60 nodes)
  const queue: State[] = [{ nodeId: startNodeId, cost: 0, path: [startNodeId], edgeIds: [] }];

  // Track best candidates to each node
  const bestPathToNode = new Map<string, { cost: number; path: string[] }>();
  bestPathToNode.set(startNodeId, { cost: 0, path: [startNodeId] });

  const exitCandidates: PathCandidate[] = [];

  while (queue.length > 0) {
    // Pick smallest element
    queue.sort((a, b) => {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return compareNodePaths(a.path, b.path);
    });

    const current = queue.shift()!;

    // If current is an open exit, record as candidate
    if (openExits.has(current.nodeId)) {
      exitCandidates.push({
        cost: current.cost,
        exitId: current.nodeId,
        path: current.path,
        edgeIds: current.edgeIds,
      });
      // Do not expand beyond an exit destination
      continue;
    }

    const neighbors = adj.get(current.nodeId) || [];
    for (const neighbor of neighbors) {
      // Do not revisit nodes already in path (prevent loops)
      if (current.path.includes(neighbor.to)) continue;

      const newCost = current.cost + neighbor.cost;
      const newPath = [...current.path, neighbor.to];
      const newEdgeIds = [...current.edgeIds, neighbor.edgeId];

      const existingBest = bestPathToNode.get(neighbor.to);

      let shouldExplore = false;
      if (!existingBest) {
        shouldExplore = true;
      } else if (newCost < existingBest.cost) {
        shouldExplore = true;
      } else if (newCost === existingBest.cost && compareNodePaths(newPath, existingBest.path) < 0) {
        shouldExplore = true;
      }

      if (shouldExplore) {
        bestPathToNode.set(neighbor.to, { cost: newCost, path: newPath });
        queue.push({
          nodeId: neighbor.to,
          cost: newCost,
          path: newPath,
          edgeIds: newEdgeIds,
        });
      }
    }
  }

  if (exitCandidates.length === 0) {
    return {
      status: 'NO_ROUTE',
      path: [],
      edgeIds: [],
      totalCost: 0,
      targetExitId: null,
    };
  }

  // Sort candidates by Section 3.3 criteria
  exitCandidates.sort(compareCandidates);
  const best = exitCandidates[0];

  return {
    status: 'FOUND',
    path: best.path,
    edgeIds: best.edgeIds,
    totalCost: best.cost,
    targetExitId: best.exitId,
  };
}
