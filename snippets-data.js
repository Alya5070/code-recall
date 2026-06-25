const INITIAL_SNIPPETS = [
    {
        "id": "extended-dijkstras-algorithm-0",
        "title": "Extended Dijkstra's Algorithm",
        "lang": "python",
        "filename": "extended-dijkstras-algorithm.py",
        "code": "import heapq\n\ndef dijkstra_with_path(graph, source, target):\n    \"\"\"\n    Dijkstra's algorithm that finds the shortest path from source to target.\n    graph: dict {vertex: {neighbor: weight, ...}, ...}\n    Returns: (distance, path_list) or (None, []) if no path exists.\n    \"\"\"\n    # Initialize distances and predecessors\n    distances = {v: float('inf') for v in graph}\n    predecessors = {v: None for v in graph}\n    distances[source] = 0\n\n    # Priority queue: (distance, vertex)\n    pq = [(0, source)]\n    visited = set()\n\n    while pq:\n        current_dist, u = heapq.heappop(pq)\n        if u in visited:\n            continue\n        visited.add(u)\n\n        # If we reached the target, we can stop early\n        if u == target:\n            break\n\n        # Relax edges\n        for v, weight in graph[u].items():\n            if v not in visited:\n                new_dist = current_dist + weight\n                if new_dist < distances[v]:\n                    distances[v] = new_dist\n                    predecessors[v] = u\n                    heapq.heappush(pq, (new_dist, v))\n\n    # Reconstruct path\n    if distances[target] == float('inf'):\n        return None, []   # no path\n\n    path = []\n    current = target\n    while current is not None:\n        path.append(current)\n        current = predecessors[current]\n    path.reverse()   # source to target\n    return distances[target], path\n\n# Example usage (sample graph)\nif __name__ == \"__main__\":\n    G = {\n        'a': {'b': 4, 'c': 2},\n        'b': {'a': 4, 'c': 1, 'd': 5},\n        'c': {'a': 2, 'b': 1, 'd': 8, 'e': 10},\n        'd': {'b': 5, 'c': 8, 'e': 2, 'z': 6},\n        'e': {'c': 10, 'd': 2, 'z': 3},\n        'z': {'d': 6, 'e': 3}\n    }\n    dist, path = dijkstra_with_path(G, 'a', 'z')\n    print(f\"Shortest distance: {dist}\")\n    print(f\"Shortest path: {' -> '.join(path)}\")"
    },
    {
        "id": "kruskals-algorithm-2",
        "title": "Kruskal's Algorithm",
        "lang": "python",
        "filename": "kruskals-algorithm.py",
        "code": "class UnionFind:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [0]*n\n\n    def find(self, x):\n        while self.parent[x] != x:\n            self.parent[x] = self.parent[self.parent[x]]\n            x = self.parent[x]\n        return x\n\n    def union(self, x, y):\n        rx, ry = self.find(x), self.find(y)\n        if rx == ry:\n            return False\n        if self.rank[rx] < self.rank[ry]:\n            self.parent[rx] = ry\n        elif self.rank[rx] > self.rank[ry]:\n            self.parent[ry] = rx\n        else:\n            self.parent[ry] = rx\n            self.rank[rx] += 1\n        return True\n\n# List of edges from table\nedges = [\n    (\"Deep Springs\", \"Oasis\", 10),\n    (\"Gold Point\", \"Lida\", 12),\n    (\"Silver Pea\", \"Goldfield\", 20),\n    (\"Dyer\", \"Oasis\", 21),\n    (\"Oasis\", \"Silver Pea\", 23),\n    (\"Manhattan\", \"Tonopah\", 25),\n    (\"Dyer\", \"Silver Pea\", 25),\n    (\"Oasis\", \"Lida\", 25),\n    (\"Lida\", \"Goldfield\", 29),\n    (\"Deep Springs\", \"Gold Point\", 30),\n    (\"Tonopah\", \"Goldfield\", 35),\n    (\"Dyer\", \"Tonopah\", 40),\n    (\"Gold Point\", \"Beatty\", 45),\n    (\"Tonopah\", \"Warm Springs\", 55),\n    (\"Manhattan\", \"Warm Springs\", 60),\n    (\"Goldfield\", \"Beatty\", 70),\n    (\"Dyer\", \"Manhattan\", 80)\n]\n\n# Get unique vertices\nvertices = set()\nfor u, v, w in edges:\n    vertices.add(u); vertices.add(v)\nvertex_list = list(vertices)\nindex = {v:i for i,v in enumerate(vertex_list)}\nuf = UnionFind(len(vertex_list))\n\nmst_edges = []\ntotal_weight = 0\n\nfor u, v, w in edges:\n    if uf.union(index[u], index[v]):\n        mst_edges.append((u, v, w))\n        total_weight += w\n        if len(mst_edges) == len(vertices)-1:\n            break\n\nprint(\"Edges in MST:\", mst_edges)\nprint(\"Total length:\", total_weight)"
    },
    {
        "id": "maximum-spanning-tree-algorithm-3",
        "title": "Maximum Spanning Tree Algorithm",
        "lang": "python",
        "filename": "maximum-spanning-tree-algorithm.py",
        "code": "def maximum_spanning_tree(graph_edges, num_vertices):\n    \"\"\"\n    graph_edges: list of (u, v, weight)\n    num_vertices: total number of vertices\n    Returns: list of edges in the maximum spanning tree and total weight.\n    \"\"\"\n    # Sort edges by weight descending\n    edges_sorted = sorted(graph_edges, key=lambda x: x[2], reverse=True)\n    uf = UnionFind(num_vertices)\n    mst = []\n    total = 0\n    for u, v, w in edges_sorted:\n        if uf.union(u, v):\n            mst.append((u, v, w))\n            total += w\n            if len(mst) == num_vertices - 1:\n                break\n    return mst, total"
    },
    {
        "id": "minimum-spanning-forest-4",
        "title": "Minimum Spanning Forest",
        "lang": "python",
        "filename": "minimum-spanning-forest.py",
        "code": "def prim_msf(graph, num_vertices):\n    \"\"\"\n    graph: adjacency list with weights, e.g., {0: [(1,5), (2,3)], ...}\n    Returns: list of edges in the minimum spanning forest.\n    \"\"\"\n    visited = [False]*num_vertices\n    forest_edges = []\n    for start in range(num_vertices):\n        if not visited[start]:\n            # Prim's algorithm for this component\n            import heapq\n            pq = [(0, start, -1)]  # (weight, vertex, parent)\n            while pq:\n                w, u, parent = heapq.heappop(pq)\n                if visited[u]:\n                    continue\n                visited[u] = True\n                if parent != -1:\n                    forest_edges.append((parent, u, w))\n                for v, weight in graph[u]:\n                    if not visited[v]:\n                        heapq.heappush(pq, (weight, v, u))\n    return forest_edges"
    },
    {
        "id": "merge-sort-5",
        "title": "Merge Sort",
        "lang": "python",
        "filename": "merge-sort.py",
        "code": "def merge_sort(arr):\n    \"\"\"\n    Sorts arr in ascending order using merge sort.\n    \"\"\"\n    if len(arr) <= 1:\n        return arr\n\n    # Divide the array into two halves\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n\n    # Merge the two sorted halves\n    return merge(left, right)\n\ndef merge(left, right):\n    \"\"\"\n    Merges two sorted lists into one sorted list.\n    \"\"\"\n    merged = []\n    i = j = 0\n    # Compare elements from left and right and add the smaller one\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            merged.append(left[i])\n            i += 1\n        else:\n            merged.append(right[j])\n            j += 1\n    # Append any remaining elements\n    merged.extend(left[i:])\n    merged.extend(right[j:])\n    return merged"
    },
    {
        "id": "binary-search-6",
        "title": "Binary Search",
        "lang": "python",
        "filename": "binary-search.py",
        "code": "def binary_search_iterative(arr, target):\n    \"\"\"\n    Returns index of target in sorted arr, or -1 if not found.\n    \"\"\"\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1"
    },
    {
        "id": "recursive-divide-and-conquer-7",
        "title": "Recursive Divide-and-Conquer",
        "lang": "python",
        "filename": "recursive-divide-and-conquer.py",
        "code": "def power_2n(a, n):\n    \"\"\"\n    Returns a^(2n) for n >= 0.\n    \"\"\"\n    if n == 0:\n        return 1\n    # Compute a^n using fast exponentiation\n    def power(a, n):\n        if n == 0:\n            return 1\n        half = power(a, n//2)\n        if n % 2 == 0:\n            return half * half\n        else:\n            return half * half * a\n    an = power(a, n)\n    return an * an"
    },
    {
        "id": "graph-theory-8",
        "title": "Graph Theory",
        "lang": "python",
        "filename": "graph-theory.py",
        "code": "A  B  C  D  E  F  G\nA  0  8 10 \u221e \u221e \u221e \u221e\nB  8  0 \u221e 12 11 \u221e \u221e\nC 10 \u221e  0 \u221e \u221e  4  7\nD \u221e 12 \u221e  0 19  5 \u221e\nE \u221e 11 \u221e 19  0 \u221e  9\nF \u221e \u221e  4  5 \u221e  0 \u221e\nG \u221e \u221e  7 \u221e  9 \u221e  0"
    },
    {
        "id": "bubble-sort-9",
        "title": "Bubble Sort",
        "lang": "python",
        "filename": "bubble-sort.py",
        "code": "def bubble_sort(arr):\n    \"\"\"\n    Sorts arr in ascending order using bubble sort.\n    \"\"\"\n    n = len(arr)\n    for i in range(n):                # Number of passes\n        swapped = False\n        # Last i elements are already in place\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n                swapped = True\n        # If no swaps, array is sorted\n        if not swapped:\n            break\n    return arr"
    },
    {
        "id": "binary-search-10",
        "title": "Binary Search",
        "lang": "python",
        "filename": "binary-search.py",
        "code": "def slow_binary_search(arr, target):\n    # Artificially add O(n\u00b2) operations\n    n = len(arr)\n    for i in range(n):\n        for j in range(n):\n            _ = i * j   # dummy\n    # Actual binary search (O(log n))\n    low, high = 0, n-1\n    while low <= high:\n        mid = (low+high)//2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1"
    },
    {
        "id": "recursive-divide-and-conquer-11",
        "title": "Recursive Divide-and-Conquer",
        "lang": "python",
        "filename": "recursive-divide-and-conquer.py",
        "code": "def power_5n(a, n):\n    # compute a^n\n    def pow(a, n):\n        if n == 0:\n            return 1\n        half = pow(a, n//2)\n        if n % 2 == 0:\n            return half * half\n        else:\n            return half * half * a\n    an = pow(a, n)\n    return an ** 5   # or an*an*an*an*an"
    },
    {
        "id": "recursive-algorithms-14",
        "title": "Recursive Algorithms",
        "lang": "python",
        "filename": "recursive-algorithms.py",
        "code": "def power(a, n):\n    if n == 0:\n        return 1\n    if n == 1:\n        return a\n    half = power(a, n//2)\n    if n % 2 == 0:\n        return half * half\n    else:\n        return half * half * a"
    },
    {
        "id": "graph-theory-15",
        "title": "Graph Theory",
        "lang": "python",
        "filename": "graph-theory.py",
        "code": "A  B  C  D  E  F  G\nA  0  4  8  \u221e  \u221e  \u221e  \u221e\nB  4  0  \u221e  7  \u221e  \u221e  \u221e\nC  8  \u221e  0 10  \u221e  \u221e  \u221e\nD  \u221e  7 10  0 12 17  \u221e\nE  \u221e  \u221e  \u221e 12  0  9  6\nF  \u221e  \u221e  \u221e 17  9  0  9\nG  \u221e  \u221e  \u221e  \u221e  6  9  0"
    },
    {
        "id": "quick-sort-21",
        "title": "Quick Sort",
        "lang": "python",
        "filename": "quick-sort.py",
        "code": "def quicksort(arr, low, high):\n    if low < high:\n        pi = partition(arr, low, high)\n        quicksort(arr, low, pi-1)\n        quicksort(arr, pi+1, high)\n\ndef partition(arr, low, high):\n    pivot = arr[high]   # choose last element as pivot\n    i = low - 1\n    for j in range(low, high):\n        if arr[j] <= pivot:\n            i += 1\n            arr[i], arr[j] = arr[j], arr[i]\n    arr[i+1], arr[high] = arr[high], arr[i+1]\n    return i+1"
    },
    {
        "id": "recursive-algorithms-22",
        "title": "Recursive Algorithms",
        "lang": "python",
        "filename": "recursive-algorithms.py",
        "code": "def fib(n):\n    if n == 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fib(n-1) + fib(n-2)"
    },
    {
        "id": "graph-theory-23",
        "title": "Graph Theory",
        "lang": "python",
        "filename": "graph-theory.py",
        "code": "A  B  C  D  E  F\nA  0  1  2  \u221e  \u221e  \u221e\nB  1  0  \u221e  3  \u221e  \u221e\nC  2  \u221e  0  4  5  \u221e\nD  \u221e  3  4  0  \u221e  6\nE  \u221e  \u221e  5  \u221e  0  7\nF  \u221e  \u221e  \u221e  6  7  0"
    }
];
