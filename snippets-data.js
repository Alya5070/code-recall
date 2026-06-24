const INITIAL_SNIPPETS = [
    {
        id: 'dijkstra-simple',
        title: 'Simple Dijkstra Algorithm',
        lang: 'python',
        filename: 'simpleDjikstra.py',
        code: `def dijkstra_simple(graph, start):
    # Initialize distances: set all node distances to infinity.
    distances = {vertex: float('inf') for vertex in graph}
    distances[start] = 0
    
    # Track visited vertices to ensure we do not re-process finalized nodes.
    visited = set()
    
    # Track predecessors for path reconstruction.
    predecessors = {vertex: None for vertex in graph}
    n = len(graph)
    
    # Find the shortest path for each vertex.
    for _ in range(n):
        min_distance = float('inf')
        current = None
        
        # Search all vertices to find the closest unvisited node.
        for vertex in graph:
            if vertex not in visited and distances[vertex] < min_distance:
                min_distance = distances[vertex]
                current = vertex
        
        # If no reachable vertices are left, terminate early.
        if current is None:
            break
        
        visited.add(current)
        
        # Update distances to all neighbors of the current node.
        for neighbor, weight in graph[current].items():
            if neighbor not in visited:
                new_distance = distances[current] + weight
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    predecessors[neighbor] = current
    
    return distances, predecessors`
    },
    {
        id: 'binary-search',
        title: 'Binary Search (Iterative)',
        lang: 'python',
        filename: 'binarySearch.py',
        code: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        guess = arr[mid]
        
        if guess == target:
            return mid
        if guess > target:
            high = mid - 1
        else:
            low = mid + 1
            
    return -1`
    }
];
