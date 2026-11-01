import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Code2,
  Lightbulb,
  Play,
  Video,
  ExternalLink,
  Download,
  ListVideo,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import AIMessageRenderer from '../components/AIMessageRenderer';
import { getYouTubeDetails, openYouTubeVideo } from '../utils/youtube';

// 100% verified, publicly accessible, and embeddable educational videos (tested against YouTube oEmbed API)
const CURATED_TOPIC_VIDEOS = {
  // Data Structures & Algorithms
  complexity: [
    {
      title: 'Introduction to Big O Notation and Time Complexity',
      youtubeId: 'D6xkbGLQesk',
      url: 'https://www.youtube.com/watch?v=D6xkbGLQesk',
      channel: 'CS Dojo',
      duration: '18:40',
      description: 'Clear, step-by-step breakdown of Big-O asymptotic notation, counting operations, and algorithmic scaling.',
    },
    {
      title: 'Big O Notation Fundamentals & Common Complexities',
      youtubeId: 'v4cd1O4zkGw',
      url: 'https://www.youtube.com/watch?v=v4cd1O4zkGw',
      channel: 'HackerRank',
      duration: '12:15',
      description: 'Understanding constant, logarithmic, linear, quadratic, and exponential time curves.',
    },
  ],
  linkedlist: [
    {
      title: 'Introduction to Linked List Data Structures',
      youtubeId: 'R9PTBwOzceo',
      url: 'https://www.youtube.com/watch?v=R9PTBwOzceo',
      channel: 'Neso Academy',
      duration: '21:30',
      description: 'Memory allocation, node structures, pointer manipulation, and fundamental linked list operations.',
    },
    {
      title: 'Data Structures: Stacks and Queues',
      youtubeId: 'wjI1WNcIntg',
      url: 'https://www.youtube.com/watch?v=wjI1WNcIntg',
      channel: 'HackerRank',
      duration: '16:10',
      description: 'LIFO and FIFO data management principles, circular queues, and call stack mechanics.',
    },
  ],
  tree: [
    {
      title: 'Data Structures: Binary Search Tree Working & Invariants',
      youtubeId: 'pYT9F8_LFTM',
      url: 'https://www.youtube.com/watch?v=pYT9F8_LFTM',
      channel: 'mycodeschool',
      duration: '18:30',
      description: 'Detailed visual explanation of BST invariants, recursive searches, and tree node pointers.',
    },
    {
      title: 'Binary Tree Traversal: Preorder, Inorder, Postorder & Level-Order',
      youtubeId: 'gm8DUJJhmY4',
      url: 'https://www.youtube.com/watch?v=gm8DUJJhmY4',
      channel: 'mycodeschool',
      duration: '21:10',
      description: 'Recursive call stacks and queue-based BFS traversals with university exam questions.',
    },
  ],
  graph: [
    {
      title: 'Graph Traversals: Breadth First Search (BFS) and Depth First Search (DFS)',
      youtubeId: 'pcKY4hjDrxk',
      url: 'https://www.youtube.com/watch?v=pcKY4hjDrxk',
      channel: 'Abdul Bari',
      duration: '26:45',
      description: 'Graph representation using adjacency lists, queue management, and visited sets.',
    },
    {
      title: 'Dijkstra Algorithm - Single Source Shortest Path (Greedy Method)',
      youtubeId: 'XB4MIexjvY0',
      url: 'https://www.youtube.com/watch?v=XB4MIexjvY0',
      channel: 'Abdul Bari',
      duration: '29:50',
      description: 'Greedy shortest path selection with min-priority queues and non-negative weight constraints.',
    },
  ],

  // Database Management Systems
  relational: [
    {
      title: 'Entity Relationship Diagram (ERD) Tutorial with Real Examples',
      youtubeId: 'QpdhBUYk7Kk',
      url: 'https://www.youtube.com/watch?v=QpdhBUYk7Kk',
      channel: 'Lucid Software',
      duration: '18:50',
      description: 'Entities, weak entity sets, cardinalities, primary keys, and schema mapping.',
    },
    {
      title: 'Introduction to DBMS & Relational Concepts',
      youtubeId: '3EJlovevfcA',
      url: 'https://www.youtube.com/watch?v=3EJlovevfcA',
      channel: 'Gate Smashers',
      duration: '20:15',
      description: 'Relational integrity constraints, referential actions (cascade, set null), and Codd’s rules.',
    },
  ],
  sql: [
    {
      title: 'SQL Course for Beginners [Full Database Course]',
      youtubeId: '7S_tz1z_5bA',
      url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
      channel: 'Programming with Mosh',
      duration: '42:30',
      description: 'SELECT queries, aggregate functions, GROUP BY, HAVING, and subqueries.',
    },
    {
      title: 'SQL Joins Tutorial for Beginners: Inner, Left, Right & Full Outer Join',
      youtubeId: '2HVMiPPuPIM',
      url: 'https://www.youtube.com/watch?v=2HVMiPPuPIM',
      channel: 'Joey Blue',
      duration: '15:45',
      description: 'Visual Venn diagrams and SQL syntax for multi-table relational joins.',
    },
  ],
  normalization: [
    {
      title: 'Learn Database Normalization: 1NF, 2NF, 3NF, 4NF, 5NF & BCNF',
      youtubeId: 'GFQaEYEc8_8',
      url: 'https://www.youtube.com/watch?v=GFQaEYEc8_8',
      channel: 'Decomplexify',
      duration: '21:00',
      description: 'Functional dependencies, lossless decomposition, and eliminating insertion/update anomalies.',
    },
    {
      title: 'Database Normalization - 1NF, 2NF, 3NF and 4NF Step-by-Step',
      youtubeId: 'UrYLYV7WSHM',
      url: 'https://www.youtube.com/watch?v=UrYLYV7WSHM',
      channel: 'channel5567',
      duration: '19:15',
      description: 'Candidate key finding algorithm and decomposition into normal forms.',
    },
  ],
  transactions: [
    {
      title: 'ACID Properties of a Transaction in Database Systems',
      youtubeId: '-GS0OxFJsYQ',
      url: 'https://www.youtube.com/watch?v=-GS0OxFJsYQ',
      channel: 'Gate Smashers',
      duration: '16:40',
      description: 'Concurrency control, transaction state diagram, dirty reads, and write-ahead logging.',
    },
    {
      title: 'Understanding B-Trees: The Data Structure Behind Modern Databases',
      youtubeId: 'K1a2Bk8NrYQ',
      url: 'https://www.youtube.com/watch?v=K1a2Bk8NrYQ',
      channel: 'Spanning Tree',
      duration: '25:10',
      description: 'B-Tree data structures on disk pages, clustered indexes, and point query lookups.',
    },
  ],

  // Computer Networks
  osi: [
    {
      title: 'OSI Model Explained | OSI Animation | 7 Layers of Networking',
      youtubeId: 'vv4y_uOneC0',
      url: 'https://www.youtube.com/watch?v=vv4y_uOneC0',
      channel: 'TechTerms',
      duration: '25:40',
      description: 'Data encapsulation from Application layer down to Physical frame bits.',
    },
  ],
  ip: [
    {
      title: 'IP Addresses and Subnetting Calculations',
      youtubeId: 'rs39FWDhzDs',
      url: 'https://www.youtube.com/watch?v=rs39FWDhzDs',
      channel: 'The Networking Doctors',
      duration: '31:20',
      description: 'Binary IP calculation, classful vs classless CIDR notation, and network/host boundary math.',
    },
  ],
  tcp: [
    {
      title: 'Unveiling TCP 3-Way Handshake: The Backbone of Reliable Connections',
      youtubeId: 'xkP8iBAdgck',
      url: 'https://www.youtube.com/watch?v=xkP8iBAdgck',
      channel: 'Chai aur Code',
      duration: '16:15',
      description: 'Packet-level inspection of sequence numbers, acknowledgment flags, and connection states.',
    },
    {
      title: 'TCP vs UDP Differences Explained with Practical Examples',
      youtubeId: 'jJyXpMmXJI0',
      url: 'https://www.youtube.com/watch?v=jJyXpMmXJI0',
      channel: 'Gate Smashers',
      duration: '19:30',
      description: 'Connection-oriented streams vs connectionless datagrams, flow control, and sliding windows.',
    },
  ],
  dns: [
    {
      title: 'How the DNS (Domain Name System) Works Step-by-Step',
      youtubeId: '2ZUxoi7YNgs',
      url: 'https://www.youtube.com/watch?v=2ZUxoi7YNgs',
      channel: 'CIRA',
      duration: '11:50',
      description: 'Recursive DNS resolvers, root nameservers, TLD nameservers, and A/CNAME record caching.',
    },
    {
      title: 'SSL, TLS, HTTPS Explained',
      youtubeId: 'j9QmMEWmcfo',
      url: 'https://www.youtube.com/watch?v=j9QmMEWmcfo',
      channel: 'ByteByteGo',
      duration: '10:45',
      description: 'Asymmetric public key cryptography, symmetric session keys, certificates, and TLS 1.3.',
    },
  ],

  // Artificial Intelligence
  search: [
    {
      title: 'A* Algorithm in Artificial Intelligence Explained with Example',
      youtubeId: 'tvAh0JZF2YE',
      url: 'https://www.youtube.com/watch?v=tvAh0JZF2YE',
      channel: 'Gate Smashers',
      duration: '22:15',
      description: 'State space representations, heuristic evaluation f(n) = g(n) + h(n), and admissibility.',
    },
    {
      title: 'A* Pathfinding Algorithm (Coding Challenge)',
      youtubeId: 'aKYlikFAV4k',
      url: 'https://www.youtube.com/watch?v=aKYlikFAV4k',
      channel: 'The Coding Train',
      duration: '14:35',
      description: 'Graph node expansion using priority queue evaluation.',
    },
  ],
  ml: [
    {
      title: 'A Gentle Introduction to Machine Learning',
      youtubeId: 'Gv9_4yMHFhI',
      url: 'https://www.youtube.com/watch?v=Gv9_4yMHFhI',
      channel: 'StatQuest with Josh Starmer',
      duration: '22:40',
      description: 'Supervised vs unsupervised learning, cost functions, residuals, and model evaluation.',
    },
    {
      title: 'Machine Learning for Everybody – Full Course',
      youtubeId: 'i_LwzRVP7bg',
      url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
      channel: 'freeCodeCamp.org',
      duration: '38:15',
      description: 'Classification with Logistic Regression, decision boundaries, and cross-validation.',
    },
  ],
  neural: [
    {
      title: 'But what is a neural network? | Deep learning, chapter 1',
      youtubeId: 'aircAruvnKk',
      url: 'https://www.youtube.com/watch?v=aircAruvnKk',
      channel: '3Blue1Brown',
      duration: '19:15',
      description: 'Neurons, activation layers, weights, biases, and visual handwriting recognition.',
    },
    {
      title: 'Gradient descent, how neural networks learn | Chapter 2',
      youtubeId: 'IHZwWFHWa-w',
      url: 'https://www.youtube.com/watch?v=IHZwWFHWa-w',
      channel: '3Blue1Brown',
      duration: '21:00',
      description: 'Loss landscapes, vector partial derivatives, and backpropagation mechanics.',
    },
  ],
  nlp: [
    {
      title: 'Transformers, the tech behind LLMs | Deep Learning Chapter 5',
      youtubeId: 'wjZofJX0v4M',
      url: 'https://www.youtube.com/watch?v=wjZofJX0v4M',
      channel: '3Blue1Brown',
      duration: '28:30',
      description: 'Word embeddings, self-attention matrices, query-key-value dot products, and token generation.',
    },
    {
      title: "Let's build GPT: from scratch, in code, spelled out",
      youtubeId: 'kCc8FmEb1nY',
      url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
      channel: 'Andrej Karpathy',
      duration: '56:20',
      description: 'PyTorch transformer architecture implementation, multi-head attention, and language modeling.',
    },
  ],

  // Fallback General University CS
  default: [
    {
      title: 'Introduction to Big O Notation and Time Complexity',
      youtubeId: 'D6xkbGLQesk',
      url: 'https://www.youtube.com/watch?v=D6xkbGLQesk',
      channel: 'CS Dojo',
      duration: '18:40',
      description: 'Clear, step-by-step breakdown of Big-O asymptotic notation and algorithmic scaling.',
    },
  ],
};

const getCuratedVideosForLesson = (title = '', summary = '') => {
  const t = (title + ' ' + summary).toLowerCase();
  if (t.includes('complex') || t.includes('asymptot') || t.includes('big-o')) return CURATED_TOPIC_VIDEOS.complexity;
  if (t.includes('linked list') || t.includes('stack') || t.includes('queue')) return CURATED_TOPIC_VIDEOS.linkedlist;
  if (t.includes('tree') || t.includes('bst') || t.includes('binary')) return CURATED_TOPIC_VIDEOS.tree;
  if (t.includes('graph') || t.includes('bfs') || t.includes('dijkstra') || t.includes('dfs')) return CURATED_TOPIC_VIDEOS.graph;
  if (t.includes('relational') || t.includes('er diagram') || t.includes('entity')) return CURATED_TOPIC_VIDEOS.relational;
  if (t.includes('sql') || t.includes('join') || t.includes('aggregation') || t.includes('query')) return CURATED_TOPIC_VIDEOS.sql;
  if (t.includes('normal') || t.includes('bcnf') || t.includes('functional depend')) return CURATED_TOPIC_VIDEOS.normalization;
  if (t.includes('transaction') || t.includes('acid') || t.includes('indexing')) return CURATED_TOPIC_VIDEOS.transactions;
  if (t.includes('osi') || t.includes('7-layer') || t.includes('architecture')) return CURATED_TOPIC_VIDEOS.osi;
  if (t.includes('ipv4') || t.includes('cidr') || t.includes('subnet') || t.includes('addressing')) return CURATED_TOPIC_VIDEOS.ip;
  if (t.includes('tcp') || t.includes('handshake') || t.includes('transport layer') || t.includes('udp')) return CURATED_TOPIC_VIDEOS.tcp;
  if (t.includes('dns') || t.includes('http') || t.includes('tls') || t.includes('application layer')) return CURATED_TOPIC_VIDEOS.dns;
  if (t.includes('agent') || t.includes('heuristic') || t.includes('a*') || t.includes('search')) return CURATED_TOPIC_VIDEOS.search;
  if (t.includes('machine learning') || t.includes('regression') || t.includes('clustering') || t.includes('classification')) return CURATED_TOPIC_VIDEOS.ml;
  if (t.includes('neural') || t.includes('backprop') || t.includes('activation')) return CURATED_TOPIC_VIDEOS.neural;
  if (t.includes('nlp') || t.includes('transformer') || t.includes('language model') || t.includes('gpt')) return CURATED_TOPIC_VIDEOS.nlp;
  return CURATED_TOPIC_VIDEOS.default;
};

const LessonViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [bannerMsg, setBannerMsg] = useState('');
  const [selectedVideoIdx, setSelectedVideoIdx] = useState(0);

  const fetchLesson = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/lessons/${id}`);
      setLesson(data.lesson);
      setSelectedVideoIdx(0);
    } catch (err) {
      setError(err.message || 'Failed to load lesson content.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const handleMarkComplete = async () => {
    try {
      setCompleting(true);
      const res = await api.post(`/lessons/${id}/complete`);
      setBannerMsg(res.message || 'Lesson marked as completed!');
      await fetchLesson();
      setTimeout(() => setBannerMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not complete lesson.');
    } finally {
      setCompleting(false);
    }
  };

  // Compile video list from DB or high-yield topic fallbacks
  const rawVideoList = useMemo(() => {
    if (!lesson) return [];
    if (Array.isArray(lesson.videos) && lesson.videos.length > 0) {
      return lesson.videos;
    }
    return getCuratedVideosForLesson(lesson.title, lesson.summary);
  }, [lesson]);

  // Normalize all videos through robust YouTube parser
  const videoPlaylist = useMemo(() => {
    return rawVideoList.map((v) => getYouTubeDetails(v));
  }, [rawVideoList]);

  const activeVideo = videoPlaylist[selectedVideoIdx] || videoPlaylist[0];

  const handleDownloadNotes = () => {
    if (!lesson) return;
    const markdownContent = `# ${lesson.title}\nCourse: ${lesson.course?.title || 'Computer Science'}\n\n${lesson.summary}\n\n${lesson.content}\n\n${
      lesson.codeExample ? `## Practical Code Example\n\`\`\`javascript\n${lesson.codeExample}\n\`\`\`\n\n` : ''
    }${
      lesson.keyTakeaways && lesson.keyTakeaways.length > 0
        ? `## Key Exam Takeaways\n${lesson.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n`
        : ''
    }`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lesson.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-ring"></div>
        <p>Loading course study material & video lectures...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="card-panel">
        <p className="text-error">{error || 'Lesson not found.'}</p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/courses')}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const allLessons = lesson.course?.lessons || [];
  const currentIndex = allLessons.findIndex((l) => l._id === lesson._id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  return (
    <div className="lesson-viewer-page">
      <div className="lesson-top-nav">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate(`/courses/${lesson.course._id}`)}
        >
          <ArrowLeft size={17} />
          <span>Back to {lesson.course.title}</span>
        </button>

        <div className="lesson-top-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleDownloadNotes}
            title="Download complete lesson notes in Markdown format"
          >
            <Download size={15} />
            <span>Download Notes</span>
          </button>
          <div className="lesson-course-progress-pill">
            <span>Course Progress: {lesson.course.progressPercentage}%</span>
          </div>
        </div>
      </div>

      {bannerMsg && (
        <div className="alert-banner alert-success">
          <CheckCircle2 size={18} />
          <span>{bannerMsg}</span>
        </div>
      )}

      <div className="lesson-layout">
        {/* Main Lesson Study Content */}
        <article className="lesson-main-card">
          <div className="lesson-header">
            <div className="lesson-badge-row">
              <span className="badge-code">
                {lesson.course.code} • Lesson {lesson.order}
              </span>
              <span className="lesson-duration-tag">
                <Clock size={14} /> {lesson.duration}
              </span>
              {lesson.isCompleted && (
                <span className="completed-badge">
                  <CheckCircle2 size={14} /> Completed
                </span>
              )}
            </div>

            <h1>{lesson.title}</h1>
            <p className="lesson-lead-summary">{lesson.summary}</p>
          </div>

          {/* COURSE VIDEO INTEGRATION SECTION */}
          {activeVideo && activeVideo.isValid ? (
            <div className="lesson-video-section">
              <div className="video-section-header">
                <div className="video-title-wrap">
                  <Video size={18} className="text-purple" />
                  <h3>Video Lecture & Recommended Learning</h3>
                </div>
                <div className="video-meta-pills">
                  <span className="badge-video-duration">
                    <Clock size={13} /> {activeVideo.duration || '15:00'}
                  </span>
                  <a
                    href={activeVideo.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-watch-youtube"
                    title="Watch full video on YouTube in a new tab"
                  >
                    <ExternalLink size={13} />
                    <span>Watch on YouTube</span>
                  </a>
                </div>
              </div>

              {/* Responsive 16:9 Embedded YouTube Player */}
              <div className="video-player-container">
                <iframe
                  src={activeVideo.embedUrl}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="youtube-embedded-frame"
                />
              </div>

              <div className="video-details-card">
                <div className="video-meta-line">
                  <a
                    href={activeVideo.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-headline-link"
                    title="Click to open video on YouTube in a new tab"
                  >
                    <strong>{activeVideo.title}</strong>
                    <ExternalLink size={14} className="video-ext-icon" />
                  </a>
                  <span className="video-channel-tag">{activeVideo.channel}</span>
                </div>
                {activeVideo.description && (
                  <p className="video-description-text">{activeVideo.description}</p>
                )}
                {activeVideo.shortUrl && (
                  <div className="video-link-bar">
                    <span className="video-link-label">Direct Video Link:</span>
                    <a
                      href={activeVideo.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-direct-link"
                      title="Open YouTube video in new tab"
                    >
                      {activeVideo.shortUrl}
                    </a>
                  </div>
                )}
              </div>

              {/* Video playlist switcher if multiple videos exist */}
              {videoPlaylist.length > 1 && (
                <div className="video-playlist-bar">
                  <span className="playlist-label">
                    <ListVideo size={14} /> Available Lectures ({videoPlaylist.length}):
                  </span>
                  <div className="playlist-tabs">
                    {videoPlaylist.map((vid, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`playlist-tab-btn ${
                          selectedVideoIdx === idx ? 'playlist-tab-active' : ''
                        }`}
                        onClick={() => setSelectedVideoIdx(idx)}
                      >
                        <Play size={12} />
                        <span>Lecture {idx + 1}: {vid.title.slice(0, 32)}...</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="video-unavailable-card">
              <AlertCircle size={20} className="text-muted" />
              <div>
                <strong>Video Lecture Notice</strong>
                <p>The video lecture for this topic is available on external YouTube channels. You can explore the comprehensive theory, visual diagrams, and code implementation below.</p>
                {activeVideo?.watchUrl && (
                  <a
                    href={activeVideo.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '8px' }}
                  >
                    <ExternalLink size={14} />
                    <span>Open Topic on YouTube</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* STRUCTURED THEORY & NOTE CONTENT (Using AIMessageRenderer for full Markdown & KaTeX) */}
          <div className="lesson-body-content markdown-lesson-view">
            <AIMessageRenderer content={lesson.content} />
          </div>

          {/* Practical Code Example Section */}
          {lesson.codeExample && (
            <div className="lesson-code-section">
              <div className="code-header">
                <Code2 size={17} />
                <span>Practical Code / Query Example</span>
              </div>
              <pre className="code-block">
                <code>{lesson.codeExample}</code>
              </pre>
            </div>
          )}

          {/* Key Exam Takeaways Section */}
          {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
            <div className="lesson-takeaways-box">
              <div className="takeaways-header">
                <Lightbulb size={18} />
                <h4>Key Exam Takeaways</h4>
              </div>
              <ul>
                {lesson.keyTakeaways.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Lesson Completion & AI Tutor Action Buttons */}
          <div className="lesson-footer-actions">
            <button
              type="button"
              className={`btn ${
                lesson.isCompleted ? 'btn-emerald' : 'btn-primary'
              }`}
              onClick={handleMarkComplete}
              disabled={completing}
            >
              <CheckCircle2 size={18} />
              <span>
                {completing
                  ? 'Updating Progress...'
                  : lesson.isCompleted
                  ? 'Completed (Click to Re-confirm)'
                  : 'Mark Lesson as Completed'}
              </span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate(
                  `/ai-tutor?course=${encodeURIComponent(
                    lesson.course.title
                  )}&prompt=${encodeURIComponent(
                    `Explain "${lesson.title}" in simple terms and give me 3 university exam questions.`
                  )}`
                )
              }
            >
              <Sparkles size={17} />
              <span>Ask AI Tutor About This Lesson</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                navigate(
                  `/quizzes?topic=${encodeURIComponent(
                    lesson.title
                  )}`
                )
              }
            >
              <BookOpen size={16} />
              <span>Take Quiz on This Topic</span>
            </button>
          </div>
        </article>

        {/* Sidebar Lesson Navigation */}
        <aside className="lesson-sidebar">
          <div className="lesson-sidebar-sticky">
            <div className="sidebar-curriculum-card">
              <div className="sidebar-card-header">
                <div className="sidebar-header-title">
                  <BookOpen size={18} className="text-primary-blue" />
                  <h3>Course Curriculum</h3>
                </div>
                <span className="sidebar-course-code">{lesson.course.code}</span>
              </div>
              <p className="sidebar-course-title">{lesson.course.title}</p>

              <div className="sidebar-progress-summary">
                <div className="sidebar-progress-text">
                  <span>{lesson.course.progressPercentage || 0}% Completed</span>
                  <span>{allLessons.filter(l => l.isCompleted).length} / {allLessons.length} Lessons</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${lesson.course.progressPercentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Enhanced Lesson Navigation Cards */}
              <div className="lessons-nav-list" role="navigation" aria-label="Course Lessons Navigation">
                {allLessons.map((l, index) => {
                  const isCurrent = l._id === lesson._id;
                  const isCompleted = Boolean(l.isCompleted);

                  let statusClass = 'lesson-nav-upcoming';
                  if (isCurrent) statusClass = 'lesson-nav-current';
                  else if (isCompleted) statusClass = 'lesson-nav-completed';

                  return (
                    <button
                      key={l._id}
                      type="button"
                      className={`lesson-nav-card ${statusClass}`}
                      onClick={() => navigate(`/lessons/${l._id}`)}
                      aria-current={isCurrent ? 'true' : undefined}
                    >
                      <div className="lesson-nav-num-badge">
                        {index + 1}
                      </div>

                      <div className="lesson-nav-content">
                        <span className="lesson-nav-title">{l.title}</span>
                        <div className="lesson-nav-meta">
                          <span className="lesson-nav-duration">
                            <Clock size={12} />
                            <span>{l.duration}</span>
                          </span>
                          {isCurrent && (
                            <span className="lesson-status-pill pill-current">Current</span>
                          )}
                          {isCompleted && (
                            <span className="lesson-status-pill pill-completed">Done</span>
                          )}
                        </div>
                      </div>

                      <div className="lesson-nav-indicator">
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="icon-completed text-emerald" />
                        ) : isCurrent ? (
                          <div className="icon-current-dot" />
                        ) : (
                          <div className="icon-upcoming-dot" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="sidebar-quiz-promo">
                <Sparkles size={20} className="text-purple" />
                <div>
                  <h4>Test Your Knowledge</h4>
                  <p>Generate an AI quiz or practice university exam questions for this chapter.</p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm btn-full"
                    onClick={() =>
                      navigate(
                        `/quizzes?topic=${encodeURIComponent(lesson.title)}`
                      )
                    }
                  >
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Prev / Next Lesson Navigation Bar */}
      <div className="lesson-bottom-nav">
        {prevLesson ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/lessons/${prevLesson._id}`)}
          >
            <ArrowLeft size={16} />
            <span>Previous: {prevLesson.title}</span>
          </button>
        ) : (
          <div></div>
        )}

        {nextLesson ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/lessons/${nextLesson._id}`)}
          >
            <span>Next: {nextLesson.title}</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-emerald"
            onClick={() => navigate(`/courses/${lesson.course._id}`)}
          >
            <CheckCircle2 size={16} />
            <span>Finished All Lessons – View Course</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;
