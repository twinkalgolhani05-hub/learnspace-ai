import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Progress from '../models/Progress.js';
import { connectDB, disconnectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const coursesCatalog = [
  {
    title: 'Data Structures & Algorithms',
    code: 'CS-301',
    description:
      'Master fundamental and advanced data structures including arrays, linked lists, trees, graphs, hash tables, and algorithmic complexity analysis for coding interviews and university exams.',
    instructor: 'Dr. Aarav Mehta',
    instructorTitle: 'Senior Professor, Algorithms & Computation',
    thumbnail:
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=900&q=80',
    category: 'Core Computer Science',
    level: 'Intermediate',
    duration: '8 Weeks',
    skills: ['Big-O Analysis', 'Linked Lists & Stacks', 'Binary Trees & BST', 'Graph Traversal'],
    lessons: [
      {
        title: 'Asymptotic Notation & Time Complexity Analysis',
        order: 1,
        duration: '35 mins',
        summary:
          'Understand how to measure algorithm efficiency in terms of input size N using Big-O, Big-Omega, and Big-Theta notations.',
        content: `### Why Analyze Algorithms?
When solving computational problems, two algorithms might produce the exact same output, yet one takes 10 milliseconds while the other takes 4 hours on large inputs. Asymptotic analysis measures how runtime and memory scale as input size \`n\` grows toward infinity.

### The Three Core Notations
1. **Big-O Notation O(f(n))**: Represents the **upper bound** (worst-case growth rate). An algorithm is O(n^2) if its running time grows no faster than a constant multiple of n^2.
2. **Big-Omega Notation Ω(f(n))**: Represents the **lower bound** (best-case growth rate).
3. **Big-Theta Notation Θ(f(n))**: Represents the **tight bound** when both upper and lower bounds match asymptotically.

### Common Complexity Classes (Fastest to Slowest)
- **O(1) – Constant Time**: Accessing an array index \`arr[i]\` or hash table lookup.
- **O(log n) – Logarithmic Time**: Binary search on a sorted array of size \`n\`.
- **O(n) – Linear Time**: Single loop traversing an array of \`n\` elements.
- **O(n log n) – Linearithmic Time**: Merge Sort, Heap Sort, and average-case Quick Sort.
- **O(n^2) – Quadratic Time**: Nested loops over \`n\` elements (Bubble Sort, Selection Sort, Insertion Sort).`,
        codeExample: `// Comparing O(n) Linear Search vs O(log n) Binary Search
function binarySearch(sortedArr, target) {
  let low = 0;
  let high = sortedArr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (sortedArr[mid] === target) return mid;
    if (sortedArr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
        keyTakeaways: [
          'Drop lower-order terms and constant multipliers when expressing Big-O.',
          'Binary search halves the search space on each iteration, giving O(log n) time.',
          'Space complexity measures auxiliary memory allocated during execution.',
        ],
      },
      {
        title: 'Linked Lists, Stacks & Queues',
        order: 2,
        duration: '45 mins',
        summary:
          'Learn dynamic linear data structures, pointer manipulation, LIFO stack operations, and FIFO queue scheduling.',
        content: `### Singly & Doubly Linked Lists
Unlike contiguous arrays, a **Linked List** stores elements in nodes scattered in heap memory, connected via pointers (\`next\` and optionally \`prev\`).
- **Insertion/Deletion at Head**: \`O(1)\` time without shifting elements.
- **Random Access**: \`O(n)\` time because we must traverse from \`head\`.

### Stacks (LIFO – Last In, First Out)
A stack restricts insertion (\`push\`) and removal (\`pop\`) to a single end called the \`top\`.
- **Real-world applications**: Function call stack (recursion), Undo/Redo history, balanced parentheses validation, and infix-to-postfix conversion.

### Queues (FIFO – First In, First Out)
A queue inserts elements at the \`rear\` (\`enqueue\`) and removes them from the \`front\` (\`dequeue\`).
- **Real-world applications**: CPU task scheduling, Breadth-First Search (BFS), and printer spooling.`,
        codeExample: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// Reverse a Singly Linked List in O(n) time and O(1) space
function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}`,
        keyTakeaways: [
          'Linked lists excel at O(1) insertions/deletions when the node pointer is known.',
          'Stacks follow LIFO ordering and power recursion and expression evaluation.',
          'Circular queues prevent wasted array slots in fixed-capacity queue buffers.',
        ],
      },
      {
        title: 'Binary Trees, BSTs & Tree Traversals',
        order: 3,
        duration: '50 mins',
        summary:
          'Explore hierarchical tree structures, Binary Search Tree invariants, and Depth-First / Breadth-First traversals.',
        content: `### Binary Search Tree (BST) Property
For every node \`N\` in a Binary Search Tree:
- All keys in the **left subtree** are strictly less than \`N.key\`.
- All keys in the **right subtree** are strictly greater than \`N.key\`.

### Tree Traversal Strategies
1. **Inorder (Left -> Root -> Right)**: Produces keys in **sorted ascending order** for a BST!
2. **Preorder (Root -> Left -> Right)**: Useful for cloning or serializing trees.
3. **Postorder (Left -> Right -> Root)**: Useful for bottom-up computations like directory size or deleting nodes.
4. **Level-Order (BFS)**: Visits nodes level by level using a Queue.

### Balanced vs Skewed Trees
A balanced BST (like AVL or Red-Black Tree) maintains height \`h = O(log n)\`, guaranteeing \`O(log n)\` search, insert, and delete. A degenerate (skewed) BST degrades to a linked list with \`O(n)\` operations.`,
        codeExample: `function inorderTraversal(root, result = []) {
  if (!root) return result;
  inorderTraversal(root.left, result);
  result.push(root.val);
  inorderTraversal(root.right, result);
  return result;
}`,
        keyTakeaways: [
          'Inorder traversal of any valid Binary Search Tree yields sorted values.',
          'Height of a balanced binary tree with n nodes is floor(log2(n)).',
          'AVL trees use rotations (LL, RR, LR, RL) to maintain a balance factor in {-1, 0, 1}.',
        ],
      },
      {
        title: 'Graphs, BFS, DFS & Shortest Paths',
        order: 4,
        duration: '55 mins',
        summary:
          'Represent networks using adjacency lists and matrices, and traverse graphs using BFS, DFS, and Dijkstra’s algorithm.',
        content: `### Graph Representations
A graph \`G = (V, E)\` consists of vertices \`V\` and edges \`E\`.
- **Adjacency Matrix**: \`|V| x |V|\` 2D grid. \`O(1)\` edge lookup, \`O(V^2)\` space (best for dense graphs).
- **Adjacency List**: Array/Map of lists. \`O(V + E)\` space (ideal for sparse graphs).

### Breadth-First Search (BFS) vs Depth-First Search (DFS)
- **BFS** uses a **Queue** and explores vertices in layers of distance. It guarantees the shortest path in an **unweighted graph** in \`O(V + E)\` time.
- **DFS** uses a **Stack** (or recursion) to plunge deep along paths before backtracking. Used for cycle detection, topological sorting, and connected components.

### Dijkstra's Shortest Path Algorithm
Finds shortest paths from a source vertex to all other vertices in a graph with **non-negative edge weights** using a Min-Priority Queue in \`O((V + E) log V)\` time.`,
        codeExample: `function bfsShortestReach(adjList, startNode) {
  const visited = new Set([startNode]);
  const queue = [[startNode, 0]];
  const distances = { [startNode]: 0 };

  while (queue.length > 0) {
    const [node, dist] = queue.shift();
    for (const neighbor of adjList[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        distances[neighbor] = dist + 1;
        queue.push([neighbor, dist + 1]);
      }
    }
  }
  return distances;
}`,
        keyTakeaways: [
          'Adjacency lists use O(V + E) memory and are preferred for sparse real-world networks.',
          'BFS finds shortest paths in unweighted graphs; Dijkstra handles non-negative weights.',
          'Topological sorting only applies to Directed Acyclic Graphs (DAGs).',
        ],
      },
    ],
    quiz: {
      title: 'Data Structures & Algorithms Mastery Quiz',
      description:
        'Test your understanding of time complexity, linked lists, stacks, binary search trees, and graph algorithms.',
      durationMinutes: 15,
      passingPercentage: 60,
      questions: [
        {
          questionText:
            'What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (AVL Tree) with n nodes?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correctOptionIndex: 1,
          explanation:
            'An AVL tree is height-balanced so its height is strictly bounded by O(log n), making search operations O(log n) in the worst case.',
        },
        {
          questionText:
            'Which tree traversal visits the nodes of a Binary Search Tree in ascending sorted order?',
          options: ['Preorder Traversal', 'Postorder Traversal', 'Inorder Traversal', 'Level-Order Traversal'],
          correctOptionIndex: 2,
          explanation:
            'Inorder traversal visits Left subtree, then Root, then Right subtree, which outputs BST keys in non-decreasing order.',
        },
        {
          questionText:
            'Which data structure is used internally by Breadth-First Search (BFS) to track vertices to visit next?',
          options: ['Stack', 'Queue', 'Binary Heap', 'Hash Table'],
          correctOptionIndex: 1,
          explanation:
            'BFS explores nodes level by level in First-In, First-Out (FIFO) order using a Queue.',
        },
        {
          questionText:
            'What is the time complexity of inserting a new node at the beginning (head) of a singly linked list?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
          correctOptionIndex: 0,
          explanation:
            'Inserting at the head only requires allocating the node, pointing its next reference to the current head, and updating head in O(1) constant time.',
        },
        {
          questionText:
            'For Dijkstra’s shortest path algorithm to guarantee optimal results, what condition must the graph edge weights satisfy?',
          options: [
            'All edge weights must be equal to 1',
            'The graph must be a tree',
            'All edge weights must be non-negative',
            'The graph must contain no cycles',
          ],
          correctOptionIndex: 2,
          explanation:
            'Dijkstra relies on a greedy relaxation assumption that adding edges to a path never decreases its total weight, which requires non-negative edge weights.',
        },
      ],
    },
  },
  {
    title: 'Database Management Systems',
    code: 'CS-302',
    description:
      'Comprehensive study of relational database architecture, ER modeling, SQL queries, functional dependencies, normalization (1NF–BCNF), ACID transactions, and B+ Tree indexing.',
    instructor: 'Prof. Ananya Kulkarni',
    instructorTitle: 'Associate Professor, Data Systems Lab',
    thumbnail:
      'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=900&q=80',
    category: 'Database & Backend Systems',
    level: 'Intermediate',
    duration: '6 Weeks',
    skills: ['ER Modeling', 'Advanced SQL Joins', 'Normalization (BCNF)', 'ACID & Concurrency'],
    lessons: [
      {
        title: 'Relational Model, Keys & ER Diagrams',
        order: 1,
        duration: '40 mins',
        summary:
          'Design conceptual database schemas using Entity-Relationship diagrams, primary keys, candidate keys, and foreign key constraints.',
        content: `### The Relational Model
Proposed by E.F. Codd, the relational model organizes data into **relations (tables)** composed of **tuples (rows)** and **attributes (columns)**.

### Types of Keys in DBMS
- **Super Key**: Any set of attributes that uniquely identifies a tuple in a relation.
- **Candidate Key**: A minimal Super Key (no proper subset is a super key).
- **Primary Key**: The candidate key chosen by the database designer to uniquely identify tuples; cannot be \`NULL\`.
- **Foreign Key**: An attribute in one relation that references the Primary Key of another relation, enforcing **Referential Integrity**.`,
        codeExample: `CREATE TABLE Departments (
  dept_id INT PRIMARY KEY,
  dept_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Students (
  student_id INT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  dept_id INT NOT NULL,
  FOREIGN KEY (dept_id) REFERENCES Departments(dept_id) ON DELETE RESTRICT
);`,
        keyTakeaways: [
          'Every Candidate Key is a Super Key, but not every Super Key is a Candidate Key.',
          'Entity Integrity requires that Primary Key attributes never contain NULL values.',
          'Referential Integrity ensures a Foreign Key matches an existing Primary Key or is NULL.',
        ],
      },
      {
        title: 'SQL Queries, Joins, Aggregation & Subqueries',
        order: 2,
        duration: '45 mins',
        summary:
          'Write expressive declarative SQL queries using INNER/LEFT/RIGHT joins, GROUP BY, HAVING, and correlated subqueries.',
        content: `### SQL Execution Order
Although we write \`SELECT\` first, the SQL engine logically evaluates clauses in this order:
1. \`FROM\` & \`JOIN\`
2. \`WHERE\` (filters individual rows before grouping)
3. \`GROUP BY\` (buckets rows by shared values)
4. \`HAVING\` (filters aggregated groups)
5. \`SELECT\` (projects expressions and aggregates)
6. \`ORDER BY\` & \`LIMIT\`

### Join Types
- **INNER JOIN**: Returns rows that have matching keys in both tables.
- **LEFT OUTER JOIN**: Returns all rows from the left table and matched rows from the right table (or \`NULL\` if unmatched).`,
        codeExample: `-- Find departments with an average GPA above 8.5 and at least 5 students
SELECT d.dept_name,
       COUNT(s.student_id) AS total_students,
       ROUND(AVG(s.gpa), 2) AS avg_gpa
FROM Departments d
INNER JOIN Students s ON d.dept_id = s.dept_id
GROUP BY d.dept_id, d.dept_name
HAVING COUNT(s.student_id) >= 5 AND AVG(s.gpa) > 8.5
ORDER BY avg_gpa DESC;`,
        keyTakeaways: [
          'WHERE filters rows before aggregation; HAVING filters groups after GROUP BY.',
          'LEFT JOIN preserves all records from the left relation even when no match exists.',
          'Aggregate functions (COUNT, SUM, AVG) ignore NULL values except COUNT(*).',
        ],
      },
      {
        title: 'Functional Dependencies & Normalization (1NF to BCNF)',
        order: 3,
        duration: '50 mins',
        summary:
          'Eliminate data redundancy and insertion, update, and deletion anomalies through lossless decomposition.',
        content: `### Why Normalize?
Poorly designed schemas suffer from **Redundancy**, **Update Anomalies**, **Insertion Anomalies**, and **Deletion Anomalies**.

### Normal Forms Hierarchy
- **First Normal Form (1NF)**: All attributes must hold **atomic** (indivisible) values; no repeating groups or arrays.
- **Second Normal Form (2NF)**: In 1NF + **no Partial Dependency** (no non-prime attribute depends on only part of a composite candidate key).
- **Third Normal Form (3NF)**: In 2NF + **no Transitive Dependency** for non-prime attributes (\`X -> Y\` requires \`X\` is a superkey OR \`Y\` is a prime attribute).
- **Boyce-Codd Normal Form (BCNF)**: Stricter than 3NF; for every non-trivial functional dependency \`X -> Y\`, \`X\` **must be a Super Key**.`,
        codeExample: `-- Unnormalized table with transitive dependency:
-- StudentCourse(student_id, dept_id, dept_head) where student_id -> dept_id -> dept_head

-- Decomposed into 3NF / BCNF lossless tables:
-- Table 1: StudentDept(student_id PRIMARY KEY, dept_id)
-- Table 2: DeptInfo(dept_id PRIMARY KEY, dept_head)`,
        keyTakeaways: [
          '2NF eliminates partial dependencies on composite candidate keys.',
          '3NF eliminates transitive dependencies of non-prime attributes.',
          'BCNF guarantees zero redundancy from functional dependencies by requiring every determinant X in X -> Y to be a superkey.',
        ],
      },
      {
        title: 'Transactions, ACID Properties & Indexing',
        order: 4,
        duration: '45 mins',
        summary:
          'Guarantee database reliability under concurrent access and hardware failures using ACID properties, two-phase locking, and B+ Trees.',
        content: `### ACID Properties of Transactions
1. **Atomicity ("All or Nothing")**: Enforced via Undo logs / Write-Ahead Logging (WAL). Either all operations commit or none take effect.
2. **Consistency**: A transaction transforms the database from one valid state satisfying all integrity constraints to another valid state.
3. **Isolation**: Concurrent transactions execute as if isolated from each other (controlled by Lock Manager / MVCC).
4. **Durability**: Once committed, changes survive power loss or crashes via Redo logs.

### Why Databases Use B+ Trees for Indexes
B+ Trees are high-fanout balanced search trees where internal nodes store only routing keys and **leaf nodes store all data pointers linked sequentially**, making both point lookups and range queries (\`WHERE age BETWEEN 20 AND 25\`) extremely fast in \`O(log_B N)\` disk I/O operations.`,
        codeExample: `BEGIN TRANSACTION;

UPDATE Accounts SET balance = balance - 5000 WHERE account_id = 101;
UPDATE Accounts SET balance = balance + 5000 WHERE account_id = 202;

-- Commit only if both updates succeed without violating constraints
COMMIT;`,
        keyTakeaways: [
          'Atomicity and Durability are managed by the Recovery System (Undo/Redo WAL logs).',
          'Isolation is managed by Concurrency Control (2PL, Timestamp Ordering, or MVCC).',
          'B+ Tree leaf nodes are linked in a doubly linked list for fast sequential range scans.',
        ],
      },
    ],
    quiz: {
      title: 'Database Management Systems Assessment',
      description:
        'Evaluate your mastery of ER constraints, SQL queries, normalization forms (1NF–BCNF), and ACID transactions.',
      durationMinutes: 15,
      passingPercentage: 60,
      questions: [
        {
          questionText:
            'Which normal form specifically eliminates partial functional dependencies of non-prime attributes on a composite candidate key?',
          options: [
            'First Normal Form (1NF)',
            'Second Normal Form (2NF)',
            'Third Normal Form (3NF)',
            'Boyce-Codd Normal Form (BCNF)',
          ],
          correctOptionIndex: 1,
          explanation:
            'Second Normal Form (2NF) requires the relation to be in 1NF and every non-prime attribute to be fully functionally dependent on the entire candidate key.',
        },
        {
          questionText:
            'In SQL, which clause is used to filter groups created by a GROUP BY clause based on an aggregate condition?',
          options: ['WHERE', 'HAVING', 'ORDER BY', 'DISTINCT'],
          correctOptionIndex: 1,
          explanation:
            'WHERE filters rows prior to grouping, whereas HAVING filters groups after the GROUP BY aggregation has been computed.',
        },
        {
          questionText:
            'Which ACID property ensures that once a transaction is committed, its changes persist even if a system crash occurs immediately afterward?',
          options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
          correctOptionIndex: 3,
          explanation:
            'Durability guarantees that committed changes are permanently recorded in non-volatile storage (using write-ahead redo logs).',
        },
        {
          questionText:
            'Why are B+ Trees preferred over Binary Search Trees for database disk indexing?',
          options: [
            'B+ Trees do not require sorting keys',
            'B+ Trees have a high fanout that minimizes disk I/O height and link leaf nodes for fast range scans',
            'B+ Trees use O(1) memory regardless of table size',
            'B+ Trees store all data in the root node only',
          ],
          correctOptionIndex: 1,
          explanation:
            'B+ Trees pack ratusan keys per disk block (high fanout), keeping tree height to 3–4 levels for millions of rows, and link leaf nodes for range queries.',
        },
        {
          questionText:
            'In a relation R, for every non-trivial functional dependency X -> Y, X is a superkey. Which normal form does R satisfy?',
          options: ['1NF only', '2NF only', '3NF only', 'Boyce-Codd Normal Form (BCNF)'],
          correctOptionIndex: 3,
          explanation:
            'By definition, a relation is in BCNF if and only if for every non-trivial functional dependency X -> Y, the determinant X is a superkey.',
        },
      ],
    },
  },
  {
    title: 'Computer Networks',
    code: 'CS-303',
    description:
      'Explore the OSI and TCP/IP protocol suites, IPv4/IPv6 subnetting, routing algorithms, reliable transport with TCP congestion control, DNS, and HTTP/HTTPS security.',
    instructor: 'Dr. Vikramaditya Rao',
    instructorTitle: 'Professor, Distributed Systems & Networking',
    thumbnail:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
    category: 'Systems & Networking',
    level: 'Intermediate',
    duration: '7 Weeks',
    skills: ['OSI & TCP/IP Layers', 'IPv4 Subnetting & CIDR', 'TCP 3-Way Handshake', 'DNS & TLS/HTTPS'],
    lessons: [
      {
        title: 'OSI 7-Layer Model & TCP/IP Protocol Architecture',
        order: 1,
        duration: '35 mins',
        summary:
          'Understand protocol layering, encapsulation, Protocol Data Units (PDUs), and the responsibilities of each network layer.',
        content: `### Protocol Layering & Encapsulation
Networking divides complex communication into modular layers. As application data travels down the sender's stack, each layer prepends its own header (**Encapsulation**):
- **Application Layer (L7)**: Message (HTTP, DNS, SMTP, SSH)
- **Transport Layer (L4)**: Segment / Datagram (TCP, UDP – Port numbers)
- **Network Layer (L3)**: Packet (IP, ICMP – Logical IP addressing & routing)
- **Data Link Layer (L2)**: Frame (Ethernet, Wi-Fi – MAC addressing, CRC error detection)
- **Physical Layer (L1)**: Bits (Optical fiber, twisted pair, radio modulation)`,
        codeExample: `// Encapsulation Hierarchy from Application down to Wire
[ Ethernet Header (MAC) | IP Header (Src/Dst IP) | TCP Header (Ports/Seq) | HTTP Payload | FCS Trailer ]`,
        keyTakeaways: [
          'Switches operate at Layer 2 (MAC addresses); Routers operate at Layer 3 (IP addresses).',
          'Encapsulation wraps upper-layer payloads with lower-layer headers as data moves down the stack.',
          'The TCP/IP model consolidates OSI Layers 5, 6, and 7 into the Application layer.',
        ],
      },
      {
        title: 'IPv4 Addressing, CIDR Subnetting & Routing Protocols',
        order: 2,
        duration: '45 mins',
        summary:
          'Calculate subnet masks, network and broadcast addresses with CIDR, and compare Distance Vector (RIP) vs Link State (OSPF) routing.',
        content: `### IPv4 & CIDR Notation
An IPv4 address is a 32-bit number written in dotted-decimal notation (e.g., \`192.168.10.0/26\`).
- A \`/26\` prefix means **26 bits for the Network ID** and **32 - 26 = 6 bits for Host IDs**.
- Total addresses per \`/26\` subnet = \`2^6 = 64\`.
- Usable host addresses = \`2^6 - 2 = 62\` (subtracting Network address and Broadcast address).

### Routing Algorithms
- **Distance Vector (Bellman-Ford / RIP)**: Routers exchange distance vectors with immediate neighbors periodically. Simple, but susceptible to count-to-infinity loops.
- **Link State (Dijkstra / OSPF)**: Routers flood link-state advertisements across the area so every router builds a complete topological map and runs Dijkstra locally.`,
        codeExample: `// Subnet Calculator Helper for IPv4 CIDRPrefix
function usableHosts(prefixLength) {
  const hostBits = 32 - prefixLength;
  if (hostBits <= 1) return 0;
  return Math.pow(2, hostBits) - 2;
}
// usableHosts(24) => 254 hosts
// usableHosts(26) => 62 hosts`,
        keyTakeaways: [
          'Number of usable hosts in an IPv4 subnet with h host bits is 2^h - 2.',
          'ARP (Address Resolution Protocol) resolves a known IPv4 address to a Layer 2 MAC address.',
          'NAT (Network Address Translation) maps private IPv4 addresses to a public IP and port.',
        ],
      },
      {
        title: 'Transport Layer: TCP vs UDP, 3-Way Handshake & Congestion Control',
        order: 3,
        duration: '50 mins',
        summary:
          'Compare connectionless UDP datagrams with reliable byte-stream TCP connections, flow control, and congestion avoidance.',
        content: `### TCP vs UDP
- **TCP (Transmission Control Protocol)**: Connection-oriented, reliable, ordered byte stream with flow control (sliding window) and congestion control. Used for Web (HTTP), SSH, Email, Database connections.
- **UDP (User Datagram Protocol)**: Connectionless, minimal 8-byte header, no retransmission delay. Used for DNS queries, live video/VoIP streaming, and online gaming.

### TCP 3-Way Handshake
1. **SYN**: Client sends \`SYN (seq = x)\` to Server.
2. **SYN-ACK**: Server replies with \`SYN-ACK (seq = y, ack = x + 1)\`.
3. **ACK**: Client replies with \`ACK (ack = y + 1)\`. Connection is \`ESTABLISHED\`.`,
        codeExample: `Client                                  Server
  | ---- SYN (seq=100) -----------------> |
  | <--- SYN, ACK (seq=300, ack=101) ---- |
  | ---- ACK (seq=101, ack=301) --------> |
  | ======== CONNECTION ESTABLISHED ===== |`,
        keyTakeaways: [
          'TCP Flow Control prevents a fast sender from overwhelming a slow receiver buffer (using rwnd).',
          'TCP Congestion Control prevents overwhelming intermediate network routers (Slow Start, AIMD).',
          'UDP has an 8-byte header (Source Port, Dest Port, Length, Checksum).',
        ],
      },
      {
        title: 'Application Layer: DNS, HTTP/HTTPS & TLS Security',
        order: 4,
        duration: '40 mins',
        summary:
          'Trace what happens when you type a URL into a browser: DNS resolution, TCP/TLS handshake, and HTTP request/response lifecycles.',
        content: `### Domain Name System (DNS)
DNS translates human-friendly domain names (\`learnspace.edu\`) into IP addresses (\`93.184.216.34\`) via a hierarchical hierarchy of Recursive Resolvers, Root Servers, TLD Servers (\`.edu\`), and Authoritative Name Servers.
- **A Record**: Maps hostname to IPv4 address.
- **AAAA Record**: Maps hostname to IPv6 address.
- **CNAME Record**: Alias from one domain name to another canonical domain.

### HTTP & HTTPS (TLS)
HTTPS layers HTTP over **TLS (Transport Layer Security)** to provide:
1. **Confidentiality** via symmetric encryption (AES) negotiated during the handshake.
2. **Authentication** via X.509 digital certificates verified against trusted Certificate Authorities (CAs).
3. **Message Integrity** via cryptographic MACs.`,
        codeExample: `GET /api/courses HTTP/1.1
Host: api.learnspace.edu
Accept: application/json
Authorization: Bearer <jwt_token>`,
        keyTakeaways: [
          'DNS primarily uses UDP port 53 for fast single-packet queries and TCP port 53 for zone transfers.',
          'TLS combines asymmetric cryptography (for key exchange/authentication) with symmetric encryption (for fast bulk data transfer).',
          'HTTP status codes: 2xx Success, 3xx Redirection, 4xx Client Error, 5xx Server Error.',
        ],
      },
    ],
    quiz: {
      title: 'Computer Networks Comprehensive Quiz',
      description:
        'Test your knowledge of OSI layers, IPv4 CIDR subnetting, TCP 3-way handshake, and application-layer protocols.',
      durationMinutes: 15,
      passingPercentage: 60,
      questions: [
        {
          questionText:
            'How many usable host IPv4 addresses are available in a subnet with a /26 CIDR prefix (subnet mask 255.255.255.192)?',
          options: ['30', '62', '64', '126'],
          correctOptionIndex: 1,
          explanation:
            'A /26 subnet leaves 32 - 26 = 6 host bits. Total addresses = 2^6 = 64. Subtracting the network and broadcast addresses gives 64 - 2 = 62 usable hosts.',
        },
        {
          questionText:
            'At which layer of the OSI model do IP routers make packet forwarding decisions using logical IP addresses?',
          options: [
            'Layer 1 – Physical Layer',
            'Layer 2 – Data Link Layer',
            'Layer 3 – Network Layer',
            'Layer 4 – Transport Layer',
          ],
          correctOptionIndex: 2,
          explanation:
            'IP addressing and routing across networks are core functions of Layer 3 (the Network Layer).',
        },
        {
          questionText:
            'What is the correct sequence of segments exchanged during a standard TCP 3-way connection establishment handshake?',
          options: [
            'SYN -> ACK -> FIN',
            'SYN -> SYN-ACK -> ACK',
            'ACK -> SYN -> SYN-ACK',
            'SYN -> FIN-ACK -> ACK',
          ],
          correctOptionIndex: 1,
          explanation:
            'The client sends SYN, the server responds with SYN-ACK, and the client completes the handshake with ACK.',
        },
        {
          questionText:
            'Which protocol resolves a known IPv4 address to its corresponding Layer 2 hardware MAC address on a local area network?',
          options: ['DNS', 'DHCP', 'ARP', 'ICMP'],
          correctOptionIndex: 2,
          explanation:
            'ARP (Address Resolution Protocol) broadcasts an ARP request on the local subnet to discover the MAC address associated with an IPv4 address.',
        },
        {
          questionText:
            'Why do real-time applications like live voice/video calls and DNS lookups typically prefer UDP over TCP?',
          options: [
            'UDP automatically encrypts all packets with TLS',
            'UDP guarantees in-order delivery and automatic retransmission',
            'UDP avoids connection handshake overhead and head-of-line blocking delays',
            'UDP allows unlimited packet sizes up to 1 GB',
          ],
          correctOptionIndex: 2,
          explanation:
            'UDP has no handshake delay or retransmission stalling (head-of-line blocking), making it ideal for latency-sensitive traffic.',
        },
      ],
    },
  },
  {
    title: 'Artificial Intelligence',
    code: 'CS-401',
    description:
      'Build intelligent agents from foundational heuristic search (A*, Minimax) to machine learning, neural networks, backpropagation, and modern Large Language Models (Transformers).',
    instructor: 'Dr. Meera Krishnan',
    instructorTitle: 'Head of Artificial Intelligence & Machine Learning',
    thumbnail:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    category: 'Artificial Intelligence & ML',
    level: 'Advanced',
    duration: '8 Weeks',
    skills: ['Heuristic Search (A*)', 'Supervised & Unsupervised ML', 'Neural Networks & Backprop', 'Transformers & LLMs'],
    lessons: [
      {
        title: 'Intelligent Agents, Uninformed & Heuristic Search (A*)',
        order: 1,
        duration: '45 mins',
        summary:
          'Formulate state-space search problems and find optimal paths using A* search with admissible and consistent heuristics.',
        content: `### State-Space Search Formulation
An AI problem solver models the world as:
- **Initial State**: Where the agent starts.
- **Actions & Transition Model**: Legal moves between states.
- **Goal Test & Path Cost \`g(n)\`**: Cost accumulated from the start state to node \`n\`.

### Informed Search & A* Evaluation Function
While uninformed search (BFS, Uniform Cost Search) blindly expands states, **A* Search** uses a heuristic estimate \`h(n)\` of the cheapest cost from \`n\` to the goal:
\`\`\`
f(n) = g(n) + h(n)
\`\`\`
- **Admissible Heuristic**: \`0 <= h(n) <= h*(n)\`, where \`h*(n)\` is the true optimal cost to the goal. An admissible heuristic **never overestimates** the cost, guaranteeing A* is **optimal**!`,
        codeExample: `// Manhattan Distance Heuristic for 2D Grid Pathfinding (Admissible when moving 4-directionally)
function manhattanHeuristic(node, goal) {
  return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
}

function fScore(gCostFromStart, currentNode, goalNode) {
  return gCostFromStart + manhattanHeuristic(currentNode, goalNode);
}`,
        keyTakeaways: [
          'A* expands the frontier node with the lowest f(n) = g(n) + h(n).',
          'A heuristic h(n) is admissible if it never overestimates the true remaining cost to the goal.',
          'Minimax with Alpha-Beta Pruning solves adversarial two-player zero-sum games like Chess.',
        ],
      },
      {
        title: 'Machine Learning Fundamentals: Regression, Classification & Clustering',
        order: 2,
        duration: '50 mins',
        summary:
          'Distinguish supervised, unsupervised, and reinforcement learning, and evaluate models using Precision, Recall, F1-Score, and Cross-Validation.',
        content: `### Three Paradigms of Machine Learning
1. **Supervised Learning**: Learns a mapping \`f(X) -> y\` from labeled examples \`(X, y)\`.
   - **Regression** (continuous target): Linear Regression, Ridge/Lasso (predicting house prices).
   - **Classification** (discrete class label): Logistic Regression, Decision Trees, SVM (spam detection).
2. **Unsupervised Learning**: Discovers hidden structure in unlabeled data \`X\`.
   - **Clustering**: K-Means, Hierarchical Clustering.
   - **Dimensionality Reduction**: Principal Component Analysis (PCA).
3. **Reinforcement Learning**: An agent learns a policy \`π(s)\` by maximizing cumulative reward through trial and error.

### Overfitting vs Underfitting (Bias-Variance Tradeoff)
- **Underfitting (High Bias)**: Model is too simplistic to capture underlying patterns; poor accuracy on both training and test data.
- **Overfitting (High Variance)**: Model memorizes noise in the training set; near-100% training accuracy but poor generalization on unseen test data. Mitigated via **Regularization (L1/L2)**, **Dropout**, and **Cross-Validation**.`,
        codeExample: `// Compute Precision, Recall, and F1-Score from Confusion Matrix counts
function evaluateClassifier(tp, fp, fn) {
  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);
  const f1Score = (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1Score };
}`,
        keyTakeaways: [
          'Precision measures exactness (TP / (TP + FP)); Recall measures completeness (TP / (TP + FN)).',
          'F1-Score is the harmonic mean of Precision and Recall, ideal for imbalanced datasets.',
          'Always split data into Training, Validation, and held-out Test sets to prevent data leakage.',
        ],
      },
      {
        title: 'Neural Networks, Activation Functions & Backpropagation',
        order: 3,
        duration: '55 mins',
        summary:
          'Understand multi-layer perceptrons, non-linear activations (ReLU, Sigmoid, Softmax), gradient descent, and backpropagation.',
        content: `### Multi-Layer Perceptrons (MLPs)
A neuron computes a weighted sum of inputs plus a bias, then applies a **non-linear activation function**:
\`\`\`
z = w · x + b
a = σ(z)
\`\`\`
Without non-linear activation functions, stacking any number of linear layers collapses into a single linear transformation!

### Popular Activation Functions
- **ReLU (Rectified Linear Unit)**: \`f(z) = max(0, z)\`. Computationally fast and mitigates the vanishing gradient problem in hidden layers.
- **Sigmoid**: \`σ(z) = 1 / (1 + e^-z)\`. Squashes output into \`(0, 1)\` for binary probability prediction.
- **Softmax**: Converts a vector of logits into a normalized probability distribution summing to \`1.0\` for multi-class classification.

### Training via Gradient Descent & Backpropagation
1. **Forward Pass**: Compute predictions \`ŷ\` and Loss \`L(y, ŷ)\`.
2. **Backward Pass (Backpropagation)**: Apply the calculus **Chain Rule** from output layer back to input layer to compute gradients \`∂L/∂W\`.
3. **Optimizer Step**: Update weights \`W = W - η * (∂L/∂W)\`, where \`η\` is the learning rate.`,
        codeExample: `const relu = (x) => Math.max(0, x);
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((x) => Math.exp(x - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map((val) => val / sumExps);
}`,
        keyTakeaways: [
          'Non-linear activation functions enable neural networks to approximate complex non-linear boundaries.',
          'Backpropagation uses the chain rule of calculus to efficiently compute loss gradients.',
          'ReLU avoids gradient saturation for positive inputs, accelerating deep network training.',
        ],
      },
      {
        title: 'Natural Language Processing, Transformers & Large Language Models',
        order: 4,
        duration: '45 mins',
        summary:
          'Explore tokenization, word embeddings, the Self-Attention mechanism, and how modern Generative AI models like Gemini work.',
        content: `### From RNNs to the Transformer Architecture
Traditional Recurrent Neural Networks (RNNs/LSTMs) processed tokens sequentially one word at a time, suffering from slow training and forgetting long-range context.
In 2017, *"Attention Is All You Need"* introduced the **Transformer**, replacing recurrence with **Self-Attention**, enabling parallel processing of entire sequences.

### Scaled Dot-Product Self-Attention
Each token embedding is projected into three vectors: **Query (Q)**, **Key (K)**, and **Value (V)**:
\`\`\`
Attention(Q, K, V) = softmax((Q · K^T) / sqrt(d_k)) · V
\`\`\`
Self-attention allows every token in a sentence to dynamically attend to and weigh relevant context from any other token regardless of distance.`,
        codeExample: `// Effective Prompt Engineering Structure for Academic AI Tutors
const promptTemplate = {
  role: "Senior Computer Science Tutor",
  task: "Explain Scaled Dot-Product Attention step-by-step",
  constraints: [
    "Include an intuitive real-world analogy",
    "Provide the mathematical formula",
    "Give 3 exam revision bullet points"
  ]
};`,
        keyTakeaways: [
          'Self-Attention computes pairwise relevance between all tokens in parallel using Query, Key, and Value projections.',
          'Positional Encodings inject token order information into Transformer inputs.',
          'Retrieval-Augmented Generation (RAG) grounds LLM responses in verified course materials to reduce hallucinations.',
        ],
      },
    ],
    quiz: {
      title: 'Artificial Intelligence & Machine Learning Quiz',
      description:
        'Test your understanding of A* heuristic search, overfitting, neural network activations, and Transformer self-attention.',
      durationMinutes: 15,
      passingPercentage: 60,
      questions: [
        {
          questionText:
            'In A* search, the evaluation function is f(n) = g(n) + h(n). What condition must the heuristic function h(n) satisfy to guarantee that A* finds an optimal solution in tree search?',
          options: [
            'h(n) must always be strictly greater than the true cost h*(n)',
            'h(n) must be admissible (it never overestimates the true cost to reach the goal)',
            'h(n) must be a random number between 1 and 100',
            'g(n) must always be set to zero',
          ],
          correctOptionIndex: 1,
          explanation:
            'An admissible heuristic never overestimates the true remaining cost to the goal (h(n) <= h*(n)), ensuring A* never prunes an optimal path.',
        },
        {
          questionText:
            'A machine learning model achieves 99.8% accuracy on the training dataset but only 61% accuracy on unseen test data. What phenomenon is occurring?',
          options: [
            'Underfitting (High Bias)',
            'Overfitting (High Variance)',
            'Vanishing Gradient',
            'Admissible Convergence',
          ],
          correctOptionIndex: 1,
          explanation:
            'A large gap between high training performance and low test generalization indicates overfitting (high variance), where the model memorizes training noise.',
        },
        {
          questionText:
            'Why are non-linear activation functions (such as ReLU or Sigmoid) essential in multi-layer neural networks?',
          options: [
            'Without non-linearity, a composition of multiple linear layers collapses into a single linear transformation',
            'They guarantee that training finishes in a single epoch',
            'They eliminate the need for weights and biases',
            'They convert supervised learning into unsupervised learning',
          ],
          correctOptionIndex: 0,
          explanation:
            'A linear combination of linear functions is still linear; non-linear activations allow deep networks to learn complex non-linear decision boundaries.',
        },
        {
          questionText:
            'Which activation function converts a vector of raw class scores (logits) into a valid probability distribution whose elements sum to 1.0?',
          options: ['ReLU', 'Leaky ReLU', 'Softmax', 'Tanh'],
          correctOptionIndex: 2,
          explanation:
            'Softmax exponentiates and normalizes logits so each output lies in (0, 1) and the entire vector sums to 1.0 for multi-class classification.',
        },
        {
          questionText:
            'What key mechanism in the Transformer architecture replaced sequential recurrence (RNNs) and allowed parallel modeling of long-range token dependencies?',
          options: [
            'Max Pooling Layers',
            'Scaled Dot-Product Self-Attention',
            'K-Means Centroid Updates',
            'Minimax Alpha-Beta Pruning',
          ],
          correctOptionIndex: 1,
          explanation:
            'Self-Attention computes token-to-token dependencies across the whole sequence in parallel using Query, Key, and Value matrices.',
        },
      ],
    },
  },
];

export const seedDatabase = async ({ closeOnFinish = false } = {}) => {
  try {
    const existingCourseCount = await Course.countDocuments();
    if (existingCourseCount >= 4 && !closeOnFinish) {
      console.log(`[Seed] Database already contains ${existingCourseCount} courses. Skipping auto-seed.`);
      return;
    }

    console.log('[Seed] Initializing LearnSpace database with courses, lessons, quizzes, and demo student...');

    await Promise.all([
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Enrollment.deleteMany({}),
      QuizAttempt.deleteMany({}),
      Progress.deleteMany({}),
      User.deleteMany({ email: 'student@learnspace.edu' }),
    ]);

    // Create default demo student account
    const demoStudent = await User.create({
      name: 'Rohan Sharma',
      email: 'student@learnspace.edu',
      password: 'Password123!',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      studentId: 'LS-202601',
      bio: 'B.Tech CSE undergraduate passionate about Data Structures, Backend Engineering, and Generative AI.',
      preferences: {
        emailNotifications: true,
        quizReminders: true,
        aiExplanationStyle: 'step-by-step',
        weeklyStudyGoalHours: 15,
        compactSidebar: false,
      },
    });

    const createdCourses = [];
    const createdQuizzes = [];

    for (const courseItem of coursesCatalog) {
      const courseDoc = await Course.create({
        title: courseItem.title,
        code: courseItem.code,
        description: courseItem.description,
        instructor: courseItem.instructor,
        instructorTitle: courseItem.instructorTitle,
        thumbnail: courseItem.thumbnail,
        category: courseItem.category,
        level: courseItem.level,
        duration: courseItem.duration,
        totalLessons: courseItem.lessons.length,
        skills: courseItem.skills,
        lessons: [],
      });

      const lessonIds = [];
      for (const lessonItem of courseItem.lessons) {
        const lessonDoc = await Lesson.create({
          course: courseDoc._id,
          title: lessonItem.title,
          order: lessonItem.order,
          duration: lessonItem.duration,
          summary: lessonItem.summary,
          content: lessonItem.content,
          codeExample: lessonItem.codeExample,
          keyTakeaways: lessonItem.keyTakeaways,
          videos: lessonItem.videos || [],
        });
        lessonIds.push(lessonDoc._id);
      }

      courseDoc.lessons = lessonIds;
      await courseDoc.save();
      createdCourses.push({ courseDoc, lessonIds });

      const quizDoc = await Quiz.create({
        course: courseDoc._id,
        title: courseItem.quiz.title,
        description: courseItem.quiz.description,
        durationMinutes: courseItem.quiz.durationMinutes,
        passingPercentage: courseItem.quiz.passingPercentage,
        questions: courseItem.quiz.questions,
      });
      createdQuizzes.push({ quizDoc, courseDoc });
    }

    // Create realistic initial enrollments, completed lessons, quiz attempts, and progress records for the demo student
    const dsa = createdCourses[0]; // Data Structures (complete all 4 lessons = 100%)
    const dbms = createdCourses[1]; // DBMS (complete 2 of 4 lessons = 50%)
    const cn = createdCourses[2]; // Computer Networks (complete 1 of 4 lessons = 25%)

    await Enrollment.create([
      {
        user: demoStudent._id,
        course: dsa.courseDoc._id,
        completedLessons: dsa.lessonIds,
        progressPercentage: 100,
        completed: true,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastAccessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        user: demoStudent._id,
        course: dbms.courseDoc._id,
        completedLessons: dbms.lessonIds.slice(0, 2),
        progressPercentage: 50,
        completed: false,
        lastAccessedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        user: demoStudent._id,
        course: cn.courseDoc._id,
        completedLessons: cn.lessonIds.slice(0, 1),
        progressPercentage: 25,
        completed: false,
        lastAccessedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ]);

    // Seed two real quiz attempts for the demo student
    const dsaQuiz = createdQuizzes[0].quizDoc;
    const dsaAnswers = dsaQuiz.questions.map((q, idx) => ({
      questionId: q._id,
      selectedOptionIndex: q.correctOptionIndex,
      correctOptionIndex: q.correctOptionIndex,
      isCorrect: true,
    }));

    await QuizAttempt.create({
      user: demoStudent._id,
      quiz: dsaQuiz._id,
      course: dsa.courseDoc._id,
      answers: dsaAnswers,
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      passed: true,
      timeSpentSeconds: 410,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    const dbmsQuiz = createdQuizzes[1].quizDoc;
    const dbmsAnswers = dbmsQuiz.questions.map((q, idx) => {
      const isCorrect = idx !== 4; // 4/5 = 80%
      return {
        questionId: q._id,
        selectedOptionIndex: isCorrect ? q.correctOptionIndex : (q.correctOptionIndex + 1) % 4,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
      };
    });

    await QuizAttempt.create({
      user: demoStudent._id,
      quiz: dbmsQuiz._id,
      course: dbms.courseDoc._id,
      answers: dbmsAnswers,
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      passed: true,
      timeSpentSeconds: 495,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // Seed learning activity history
    await Progress.create([
      {
        user: demoStudent._id,
        course: dsa.courseDoc._id,
        actionType: 'course_enrolled',
        title: `Enrolled in ${dsa.courseDoc.title}`,
        details: 'Started learning core data structures and algorithmic analysis.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        user: demoStudent._id,
        course: dsa.courseDoc._id,
        actionType: 'course_completed',
        title: `Completed course: ${dsa.courseDoc.title}`,
        details: 'Finished all 4 lessons in Data Structures & Algorithms.',
        metadata: { percentage: 100 },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        user: demoStudent._id,
        course: dsa.courseDoc._id,
        actionType: 'quiz_completed',
        title: `Completed ${dsaQuiz.title}`,
        details: 'Scored 5/5 (100%) on the assessment.',
        metadata: { score: 5, percentage: 100, quizId: dsaQuiz._id },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        user: demoStudent._id,
        course: dbms.courseDoc._id,
        actionType: 'lesson_completed',
        title: 'Completed lesson: SQL Queries, Joins, Aggregation & Subqueries',
        details: 'Progress in Database Management Systems reached 50%.',
        metadata: { percentage: 50, lessonId: dbms.lessonIds[1] },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        user: demoStudent._id,
        course: dbms.courseDoc._id,
        actionType: 'quiz_completed',
        title: `Completed ${dbmsQuiz.title}`,
        details: 'Scored 4/5 (80%) on the assessment.',
        metadata: { score: 4, percentage: 80, quizId: dbmsQuiz._id },
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
      {
        user: demoStudent._id,
        course: cn.courseDoc._id,
        actionType: 'lesson_completed',
        title: 'Completed lesson: OSI 7-Layer Model & TCP/IP Protocol Architecture',
        details: 'Progress in Computer Networks reached 25%.',
        metadata: { percentage: 25, lessonId: cn.lessonIds[0] },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ]);

    console.log(
      `[Seed] Successfully seeded ${createdCourses.length} courses, 16 lessons, ${createdQuizzes.length} quizzes, and demo user (student@learnspace.edu / Password123!).`
    );
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  } finally {
    if (closeOnFinish) {
      await disconnectDB();
    }
  }
};

// Allow running directly via `npm run seed`
const isDirectRun =
  process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('seed/seedData.js');

if (isDirectRun) {
  connectDB()
    .then(() => seedDatabase({ closeOnFinish: true }))
    .then(() => {
      console.log('[Seed] Standalone seed script finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

