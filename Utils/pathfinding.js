function aStarPathfinding(grid, start, end) {
  // Initialize the open set with the starting node
  let openSet = [];
  openSet.push(start);

  // The set of nodes already evaluated
  let closedSet = new Set();

  // To store the cost of the path from the start node
  const gScore = {};
  gScore[`${start.x},${start.y}`] = 0;

  // Estimated total cost from start to end node
  const fScore = {};
  fScore[`${start.x},${start.y}`] = heuristic(start, end);

  // A map to track the path
  const cameFrom = {};

  while (openSet.length > 0) {
    // Find the node in openSet with the lowest fScore value
    let current = openSet.reduce((lowest, node) => {
      const currentFScore = fScore[`${node.x},${node.y}`] || Infinity;
      const lowestFScore = fScore[`${lowest.x},${lowest.y}`] || Infinity;
      return currentFScore < lowestFScore ? node : lowest;
    });

    // If we've reached the end node, reconstruct the path
    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(cameFrom, current);
    }

    // Remove the current node from openSet and add to closedSet
    openSet = openSet.filter(node => node.x !== current.x || node.y !== current.y);
    closedSet.add(`${current.x},${current.y}`);

    // Explore neighbors
    for (let neighbor of getNeighbors(grid, current)) {
      if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
        continue; // Ignore the neighbor if it's already evaluated
      }

      const tentativeGScore = gScore[`${current.x},${current.y}`] + 1; // Assuming each move costs '1'

      if (!openSet.find(node => node.x === neighbor.x && node.y === neighbor.y)) {
        openSet.push(neighbor); // Discover a new node
      } else if (tentativeGScore >= gScore[`${neighbor.x},${neighbor.y}`]) {
        continue; // This is not a better path
      }

      // This path is the best so far, record it
      cameFrom[`${neighbor.x},${neighbor.y}`] = current;
      gScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore;
      fScore[`${neighbor.x},${neighbor.y}`] = gScore[`${neighbor.x},${neighbor.y}`] + heuristic(neighbor, end);
    }
  }

  // If we reach here, there's no path
  return [];
}

// Heuristic function for A* (Manhattan distance)
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Reconstructs path from end to start
function reconstructPath(cameFrom, current) {
  const totalPath = [current];
  while (cameFrom[`${current.x},${current.y}`]) {
    current = cameFrom[`${current.x},${current.y}`];
    totalPath.push(current);
  }
  return totalPath.reverse();
}

// Helper function to get neighbors
function getNeighbors(grid, cell) {
  const neighbors = [];
  const directions = [
    { x: 0, y: -1 },  // North
    { x: 1, y: 0 },   // East
    { x: 0, y: 1 },   // South
    { x: -1, y: 0 },  // West
  ];

  for (const direction of directions) {
    const newX = cell.x + direction.x;
    const newY = cell.y + direction.y;

    if (
      Array.isArray(grid) &&
      newX >= 0 &&
      newX < grid.length &&
      Array.isArray(grid[newX]) &&
      newY >= 0 &&
      newY < grid[newX].length
    ) {
      const terrain = grid[newX][newY];
      if (isPassable(terrain)) {
        neighbors.push({ x: newX, y: newY });
      }
    }
  }

  return neighbors;
}

// Check if the terrain is passable (modify based on your terrain types)
function isPassable(terrain) {
  return terrain !== 'WATER' && terrain !== 'MOUNTAIN';
}

module.exports = { aStarPathfinding };
