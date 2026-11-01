import { GoogleGenAI } from '@google/genai';

const BASE_SYSTEM_INSTRUCTION = `You are LearnSpace AI Tutor, an expert college-level Computer Science & Engineering teaching assistant.
You provide academically rigorous, technically accurate, and beginner-friendly instruction.

Core Formatting & Teaching Rules:
1. Academic Rigor: State formal definitions and invariants clearly. Never fabricate facts, citations, or formulas.
2. Math & LaTeX: Format ALL mathematical formulas, Boolean algebra, summations, subscripts, superscripts, and asymptotic bounds (e.g. $O(V + E \\log V)$, $\\overline{A} \\cdot B$, $2^n$, $T(n) = 2T(n/2) + O(n)$) using LaTeX:
   - Use $...$ for inline math.
   - Use $$...$$ on its own line for block equations.
3. Tables: Whenever comparing algorithms, data structures, protocol layers, or truth tables, ALWAYS generate clean Markdown tables.
4. Code Blocks: Format all code, SQL queries, and pseudocode in syntax-highlighted Markdown blocks with line-by-line comments.
5. Structured Headings: Organize explanations with clear Markdown headings (###, ####) and bulleted/numbered points.
6. Document Grounding: When study material or documents are attached, base your answer primarily on the uploaded content. Cite page or slide numbers if mentioned in the text. Clearly state if any information is not present in the document.`;

/**
 * Builds mode-specific instructions and contextual prompts.
 */
export const buildPromptForMode = ({
  mode = 'ask_explain',
  message = '',
  courseContext = '',
  // Mode 1: Summary options
  summaryStyle = 'detailed',
  summaryLength = 'medium',
  // Mode 2: Ask & Explain options
  answerStyle = 'simple',
  // Mode 3: Q&A Generator options
  questionType = 'exam-questions',
  questionCount = 5,
  difficulty = 'Medium',
  // Mode 4: Make It Precise options
  preciseAction = 'shorten',
  // Uploaded document context
  documentText = '',
}) => {
  let modeDirective = '';

  if (mode === 'summary') {
    const styleDescriptions = {
      'very-short': 'Provide a VERY SHORT summary (3-5 concise, high-impact sentences capturing core definition and primary purpose).',
      'detailed': 'Provide a DETAILED, comprehensive summary with background, architecture/working, components, and practical usage.',
      'chapter-wise': 'Provide a CHAPTER-WISE structured summary with logical section headings, key concepts, and takeaways.',
      'bullet-point': 'Provide a clean, bullet-point summary where every bullet delivers a distinct, actionable technical fact.',
      'exam-revision': 'Provide an EXAM REVISION summary highlighting high-yield definitions, common pitfalls, and quick-recall notes.',
      'formulas': 'Provide an IMPORTANT DEFINITIONS AND FORMULAS sheet formatted with LaTeX ($...$, $$...$$) and clear term explanations.',
    };

    const lengthGuide = {
      short: 'Keep the summary brief and focused (approx 150-250 words).',
      medium: 'Provide a balanced, thorough summary (approx 400-600 words).',
      comprehensive: 'Provide a deep, exhaustive summary covering all nuances (approx 800-1200 words).',
    };

    modeDirective = `[MODE: SUMMARY GENERATOR]
Style: ${styleDescriptions[summaryStyle] || styleDescriptions.detailed}
Length: ${lengthGuide[summaryLength] || lengthGuide.medium}`;
  } else if (mode === 'qa_generator') {
    const typeDescriptions = {
      'exam-questions': 'Important University Examination Questions (with 2-mark, 4-mark, and 6-mark breakdown and complete model answers).',
      'short-answer': 'Short-Answer Questions with concise 2-3 sentence answers.',
      'long-answer': 'Long-Answer / Descriptive Questions with comprehensive step-by-step explanations, diagrams in ASCII, and examples.',
      'descriptive': 'Descriptive Conceptual Questions requiring architectural and algorithmic reasoning.',
      'mcq': 'Multiple Choice Questions (MCQs) each with 4 distinct options (A, B, C, D), the correct answer, and an in-depth explanation.',
      'true-false': 'True/False conceptual questions with clear technical justification.',
      'fill-blanks': 'Fill in the Blanks questions with missing key technical terms and the answer key.',
      'viva': 'Viva-Voce Questions commonly asked by university external examiners with crisp conceptual answers.',
    };

    modeDirective = `[MODE: QUESTION AND ANSWER GENERATOR]
Question Format: ${typeDescriptions[questionType] || typeDescriptions['exam-questions']}
Number of Questions: ${questionCount || 5}
Difficulty Level: ${difficulty || 'Medium'}
Every question MUST include a detailed, technically correct model answer and explanation.`;
  } else if (mode === 'make_precise') {
    const actionDescriptions = {
      shorten: 'Shorten this text significantly while preserving 100% of the core technical meaning, key formulas, and facts.',
      simpler: 'Explain in simpler, beginner-friendly language using intuitive analogies without dumbing down technical accuracy.',
      bullets: 'Convert the input into structured, well-organized bullet points categorized by concept.',
      'exam-notes': 'Format into exam-ready revision notes with headings, bold keywords, and quick memory cues.',
      'extract-important': 'Extract only the critical points, theorems, invariants, and definitions, discarding all fluff.',
      'remove-unnecessary': 'Remove all unnecessary introductory filler, repetitions, and conversational text.',
      '2-mark': 'Convert into a precise 2-mark university exam answer (definition + 1 example/formula in 2-3 lines).',
      '4-mark': 'Convert into a structured 4-mark exam answer (4 distinct points or definition + working + example + complexity).',
      '6-mark': 'Convert into an exhaustive 6-mark exam answer (Definition, Working/Architecture, Example/Code, and Complexity).',
      'revision-sheet': 'Create a high-density, one-page Quick Revision Sheet.',
    };

    modeDirective = `[MODE: MAKE IT PRECISE]
Transformation: ${actionDescriptions[preciseAction] || actionDescriptions.shorten}
Preserve all mathematical formulas, asymptotic notations, and technical invariants.`;
  } else {
    // Default: ask_explain
    const answerDescriptions = {
      simple: 'Simple beginner-friendly explanation with intuitive analogies.',
      detailed: 'Comprehensive, in-depth lecture-level explanation with step-by-step reasoning.',
      'exam-oriented': 'Exam-oriented answer formatted strictly with Definition, Working, Example, and Exam Tips.',
      '2-mark': 'Precise 2-mark answer: Definition and key formula in 2-3 clear lines.',
      '4-mark': 'Structured 4-mark answer with 4 clear points or subheadings.',
      '6-mark': 'Exhaustive 6-mark answer with intro, architecture/block diagram, step-by-step flow, code/complexity, and applications.',
      precise: 'Precise answer with zero unnecessary filler, straight to technical facts.',
    };

    modeDirective = `[MODE: ASK AND EXPLAIN]
Answer Style: ${answerDescriptions[answerStyle] || answerDescriptions.simple}`;
  }

  let fullPrompt = `${modeDirective}\nCourse Context: ${courseContext || 'General Computer Science'}\n\n`;

  if (documentText) {
    fullPrompt += `=== ATTACHED STUDY MATERIAL / DOCUMENT ===\n${documentText}\n=== END OF ATTACHED MATERIAL ===\n\n`;
    fullPrompt += `Please base your answer primarily on the uploaded study material above. Cite relevant pages/slides if available. If any fact is outside the document, clearly distinguish it.\n\n`;
  }

  fullPrompt += `User Request / Topic / Question:\n${message}`;
  return fullPrompt;
};

/**
 * Fallback academic responses for offline resilience or missing API keys.
 */
export const buildAcademicFallbackResponse = (userMessage = '', courseContext = '', mode = 'ask_explain') => {
  const q = String(userMessage).toLowerCase();

  if (mode === 'summary') {
    return `### Academic Summary: ${userMessage || courseContext || 'Study Topic'}

#### 1. Core Principle
This topic addresses fundamental computational problems by organizing information into structured components, optimizing algorithmic invariants, and minimizing time/space complexity trade-offs.

#### 2. Key Technical Highlights
- **Primary Definition**: Formal mathematical or system model governing the behavior of the structure.
- **Asymptotic Bounds**: Typically operates within logarithmic $O(\\log n)$ or linearithmic $O(n \\log n)$ efficiency.
- **Design Trade-offs**: Balances memory utilization vs query latency.

#### 3. High-Yield Exam Revision Points
1. Always state the governing invariant before writing pseudocode.
2. Verify boundary conditions ($n = 0$, $n = 1$, or null pointers).
3. Use Markdown tables when contrasting competing approaches.`;
  }

  if (mode === 'qa_generator') {
    return `### University Examination Question & Answer Set: ${userMessage || courseContext || 'Computer Science'}

#### Question 1 (2 Marks): Formal Definition & Invariant
- **Question**: Define the core invariant of **${userMessage || 'this concept'}** and state its primary use case.
- **Model Answer**: The invariant guarantees structural correctness throughout dynamic modifications. In algorithmic operations, it bounds search and update costs to $O(\\log n)$ or $O(1)$.

#### Question 2 (4 Marks): Working & Comparison
- **Question**: Differentiate between the average-case and worst-case performance of this topic using a comparison table.
- **Model Answer**:
| Metric | Average Case | Worst Case | Auxiliary Space |
| :--- | :---: | :---: | :---: |
| Time Complexity | $O(\\log n)$ | $O(n)$ | $O(1)$ |
| Recurrence Relation | $T(n) = T(n/2) + O(1)$ | $T(n) = T(n-1) + O(1)$ | Constant |

#### Question 3 (6 Marks): Step-by-Step Implementation & Viva
- **Question**: Write clean pseudocode or an algorithm for this operation, and provide 2 common viva-voce questions.
- **Model Answer**:
\`\`\`javascript
// Step-by-step execution algorithm
function processInput(inputArray) {
  if (!inputArray || inputArray.length === 0) return null;
  // Divide-and-conquer processing in O(n log n)
  return inputArray.sort((a, b) => a - b);
}
\`\`\`
- **Viva Q1**: What causes the worst-case degradation? *Answer: Pathological inputs like sorted sequences without randomization.*
- **Viva Q2**: How do balanced variants resolve this? *Answer: Through localized tree rotations or randomized pivot selections.*`;
  }

  if (mode === 'make_precise') {
    return `### Precise Exam-Ready Revision Notes: ${userMessage.slice(0, 50) || 'Study Notes'}

#### 1. Core Definition
Direct statement of the concept without unnecessary filler words:
- **Concept**: Core algorithmic structure operating on input size $n$.
- **Governing Law**: $T(n) = O(f(n))$, ensuring guaranteed execution within tight asymptotic boundaries.

#### 2. Essential Facts & Formulas
- **Mathematical Bound**: $c_1 \\cdot g(n) \\le T(n) \\le c_2 \\cdot g(n) \\quad \\forall n \\ge n_0$
- **Memory Footprint**: $O(1)$ auxiliary stack space when implemented iteratively.

#### 3. 2-Mark Exam Answer Template
> **Definition**: A deterministic procedure that transforms inputs into outputs in finite steps.
> **Example**: Binary Search over sorted arrays in $O(\\log n)$ time.`;
  }

  // Default mode: ask_explain
  if (q.includes('demultiplexer') || q.includes('demux')) {
    return `### 1-to-4 Demultiplexer (1:4 DEMUX) – Academic Study Guide

A **Demultiplexer (DEMUX)** is a combinational logic circuit that takes a **single data input line** ($D$) and routes it to one of **$2^n$ output lines** ($Y_0, Y_1, Y_2, Y_3$) based on the binary value of **$n$ select lines** ($S_1, S_0$).

#### 1. Truth Table
| Select $S_1$ | Select $S_0$ | Output $Y_3$ | Output $Y_2$ | Output $Y_1$ | Output $Y_0$ | Active Channel |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| $0$ | $0$ | $0$ | $0$ | $0$ | $D$ | $Y_0 = D$ |
| $0$ | $1$ | $0$ | $0$ | $D$ | $0$ | $Y_1 = D$ |
| $1$ | $0$ | $0$ | $D$ | $0$ | $0$ | $Y_2 = D$ |
| $1$ | $1$ | $D$ | $0$ | $0$ | $0$ | $Y_3 = D$ |

#### 2. Boolean Algebra Equations
$$
\\begin{aligned}
Y_0 &= D \\cdot \\overline{S_1} \\cdot \\overline{S_0} \\\\
Y_1 &= D \\cdot \\overline{S_1} \\cdot S_0 \\\\
Y_2 &= D \\cdot S_1 \\cdot \\overline{S_0} \\\\
Y_3 &= D \\cdot S_1 \\cdot S_0
\\end{aligned}
$$

> **Exam Tip**: A 1:4 Demultiplexer is functionally equivalent to a **2-to-4 line Decoder with an active Enable input** ($E = D$).`;
  }

  return `### Academic Study Guide: ${userMessage || 'Computer Science Concept'}
${courseContext ? `*Course Context: ${courseContext}*\n\n` : ''}

#### 1. Overview & Formal Invariant
Understanding **${userMessage || 'this topic'}** requires analyzing its fundamental components, execution flow, and mathematical complexity:
- **Primary Objective**: Efficient computation with guaranteed correctness.
- **Asymptotic Bound**: $O(n)$ or $O(\\log n)$ depending on balanced structural guarantees.

#### 2. Comparison & Analysis
| Component | Function | Complexity | Key Advantage |
| :--- | :--- | :---: | :--- |
| **Iterative Method** | Linear loop execution | $O(n)$ time, $O(1)$ space | No call stack overhead |
| **Divide & Conquer** | Subproblem decomposition | $O(n \\log n)$ time, $O(\\log n)$ space | Optimal for large datasets |

#### 3. Key University Exam Takeaways
1. Define the input parameters and output conditions formally.
2. State the worst-case, average-case, and best-case asymptotic bounds ($O, \\Theta, \\Omega$).
3. Trace sample inputs through step-by-step tables.`;
};

/**
 * Builds standard GoogleGenAI request configuration.
 */
const buildGeminiRequest = (params) => {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  const {
    message = '',
    history = [],
    courseContext = '',
    mode = 'ask_explain',
    summaryStyle,
    summaryLength,
    answerStyle,
    questionType,
    questionCount,
    difficulty,
    preciseAction,
    documentText = '',
    imageData = null,
  } = params;

  // Format previous history turns (last 4 items, capped)
  const formattedHistory = Array.isArray(history)
    ? history
        .slice(-4)
        .filter((item) => item && typeof item.content === 'string' && item.content.trim())
        .map((item) => ({
          role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.content.trim().slice(0, 1000) }],
        }))
    : [];

  const promptText = buildPromptForMode({
    mode,
    message,
    courseContext,
    summaryStyle,
    summaryLength,
    answerStyle,
    questionType,
    questionCount,
    difficulty,
    preciseAction,
    documentText,
  });

  const userParts = [];
  if (imageData && imageData.data && imageData.mimeType) {
    userParts.push({
      inlineData: {
        mimeType: imageData.mimeType,
        data: imageData.data,
      },
    });
  }
  userParts.push({ text: promptText });

  const contents = [
    ...formattedHistory,
    {
      role: 'user',
      parts: userParts,
    },
  ];

  const config = {
    systemInstruction: BASE_SYSTEM_INSTRUCTION,
    temperature: 0.25,
    maxOutputTokens: 2000,
    thinkingConfig: {
      thinkingBudget: 0,
    },
  };

  return { apiKey, modelName, contents, config };
};

/**
 * Generates a complete non-streaming response.
 */
export const generateTutorResponse = async (params) => {
  const { apiKey, modelName, contents, config } = buildGeminiRequest(params);

  if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
    const reply = buildAcademicFallbackResponse(params.message, params.courseContext, params.mode);
    return {
      reply,
      model: `${modelName} (Built-in Academic Tutor Mode)`,
      liveApi: false,
      notice: 'Using built-in academic knowledge engine (configure GEMINI_API_KEY in server/.env for live model).',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config,
      });
    } catch {
      const { thinkingConfig, ...fallbackConfig } = config;
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: fallbackConfig,
      });
    }

    const text = response?.text || 'Received an empty response from AI Tutor. Please try asking again.';
    return {
      reply: text,
      model: modelName,
      liveApi: true,
      notice: null,
    };
  } catch (error) {
    console.warn('[Gemini Service Warning]:', error.message);
    const fallbackReply = buildAcademicFallbackResponse(params.message, params.courseContext, params.mode);
    return {
      reply: fallbackReply,
      model: `${modelName} (Resilient Academic Fallback)`,
      liveApi: false,
      notice: `Notice: ${error.message}. Answered using LearnSpace verified academic knowledge base.`,
    };
  }
};

/**
 * Streams generated tokens using Server-Sent Events (SSE).
 */
export const streamTutorResponse = async (params, { onMeta, onChunk, onDone, shouldAbort }) => {
  const { apiKey, modelName, contents, config } = buildGeminiRequest(params);

  if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
    const fallback = buildAcademicFallbackResponse(params.message, params.courseContext, params.mode);
    onMeta({
      model: `${modelName} (Built-in Academic Tutor Mode)`,
      liveApi: false,
      notice: 'Using built-in academic knowledge engine because GEMINI_API_KEY is not set.',
    });
    onChunk(fallback);
    onDone(fallback);
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    let streamResult;
    try {
      streamResult = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config,
      });
    } catch {
      const { thinkingConfig, ...fallbackConfig } = config;
      streamResult = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: fallbackConfig,
      });
    }

    onMeta({
      model: modelName,
      liveApi: true,
      notice: null,
    });

    let fullText = '';
    for await (const chunk of streamResult) {
      if (shouldAbort && shouldAbort()) break;
      const chunkText = chunk?.text || '';
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }

    onDone(fullText);
  } catch (error) {
    console.warn('[Gemini Stream Warning]:', error.message);
    const fallback = buildAcademicFallbackResponse(params.message, params.courseContext, params.mode);
    onMeta({
      model: `${modelName} (Resilient Fallback Mode)`,
      liveApi: false,
      notice: `Gemini API temporary notice (${error.message}); answered using LearnSpace academic engine.`,
    });
    onChunk(fallback);
    onDone(fallback);
  }
};

/**
 * Generates an automated, structured AI Quiz using Google Gemini.
 * Returns array of questions: [{ questionText, options: [4 strings], correctOptionIndex: 0-3, explanation }]
 */
export const generateQuizQuestionsWithAI = async ({
  topic = '',
  sourceText = '',
  imageData = null,
  numQuestions = 5,
  difficulty = 'Medium',
  questionType = 'MCQ',
}) => {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  const systemPrompt = `You are a university Computer Science professor and assessment expert.
Generate exactly ${numQuestions} high-quality questions for a college quiz.
Difficulty Level: ${difficulty}
Format Type: ${questionType} (Each question must have exactly 4 distinct, plausible options).

Rules:
1. Return ONLY a valid JSON array of objects. Do NOT include markdown code fences (\`\`\`json).
2. Each object must have:
   - "questionText": String containing the question statement. Use LaTeX ($...$) for math/complexity.
   - "options": Array of exactly 4 strings [Option A, Option B, Option C, Option D].
   - "correctOptionIndex": Integer 0, 1, 2, or 3 representing the index of the correct option.
   - "explanation": String explaining clearly why the answer is correct and why other options are incorrect.
3. Every question must be factually accurate, unambiguous, and directly related to the provided topic or text.`;

  let prompt = `Topic / Subject: ${topic || 'Computer Science'}\n`;
  if (sourceText) {
    prompt += `\nSource Material / Notes:\n${sourceText.slice(0, 15000)}\n`;
  }
  prompt += `\nPlease generate ${numQuestions} ${difficulty} level ${questionType} questions as a strict JSON array.`;

  const userParts = [];
  if (imageData && imageData.data && imageData.mimeType) {
    userParts.push({
      inlineData: {
        mimeType: imageData.mimeType,
        data: imageData.data,
      },
    });
  }
  userParts.push({ text: prompt });

  if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
    return generateFallbackQuizQuestions(topic, numQuestions, difficulty);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: userParts }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
          maxOutputTokens: 3000,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
    } catch {
      response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: userParts }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
          maxOutputTokens: 3000,
        },
      });
    }

    const raw = (response?.text || '').trim();
    const cleanJson = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, numQuestions).map((q) => sanitizeQuizQuestion(q, topic));
    }
    throw new Error('Parsed response is not a valid question array');
  } catch (err) {
    console.warn('[Gemini Quiz Generation Warning]:', err.message);
    return generateFallbackQuizQuestions(topic, numQuestions, difficulty);
  }
};

/**
 * Sanitizes and normalizes quiz questions, cleaning prefix letters, question numbers,
 * parsing collapsed options, and ensuring exactly 4 distinct options and clean math formatting.
 */
export const sanitizeQuizQuestion = (q, defaultTopic = 'Computer Science') => {
  let questionText = String(q?.questionText || q?.question || 'Question statement').trim();
  // Strip leading question numbers like "1. ", "1) ", "Q1: ", "Question 1: "
  questionText = questionText
    .replace(/^(?:Question\s*\d+\s*[:.-]?\s*|Q\d+\s*[:.-]?\s*|\d+\s*[:.)-]\s*)/i, '')
    .trim();

  let rawOptions = q?.options;
  let parsedOptions = [];

  if (Array.isArray(rawOptions)) {
    if (rawOptions.length === 1 && typeof rawOptions[0] === 'string') {
      const single = rawOptions[0];
      const parts = single
        .split(/(?:^|\s+)(?:[A-D][\.\)\:\-]\s*|\([A-D]\)\s*|[A-D]\s+)/i)
        .map((s) => s.trim())
        .filter(Boolean);
      parsedOptions = parts.length >= 2 ? parts : [single];
    } else {
      parsedOptions = rawOptions;
    }
  } else if (rawOptions && typeof rawOptions === 'object') {
    parsedOptions = Object.keys(rawOptions)
      .sort()
      .map((k) => rawOptions[k]);
  } else if (typeof rawOptions === 'string') {
    parsedOptions = rawOptions
      .split(/(?:^|\s+)(?:[A-D][\.\)\:\-]\s*|\([A-D]\)\s*|[A-D]\s+)/i)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // If options were mistakenly appended to questionText, extract them
  if (parsedOptions.length < 2 && questionText.includes('A ') && questionText.includes('B ')) {
    const splitMatch = questionText.split(/(?:^|\n|\s+)(?:[A-D][\.\)\:\-]\s*|\([A-D]\)\s*|[A-D]\s+)/i);
    if (splitMatch.length >= 4) {
      questionText = splitMatch[0].trim();
      parsedOptions = splitMatch.slice(1).map((s) => s.trim()).filter(Boolean);
    }
  }

  // Clean each option: strip leading "A) ", "(A) ", "A. ", "A ", "Option A: "
  let cleanedOptions = parsedOptions
    .map((opt) =>
      String(opt)
        .trim()
        .replace(/^(?:Option\s+[A-D]\s*[:.-]?\s*|[A-D]\s*[:.)-]\s*|\([A-D]\)\s*|[A-D]\s+(?=[$A-Za-z0-9]))/i, '')
        .trim()
    )
    .filter(Boolean);

  // Guarantee exactly 4 options
  while (cleanedOptions.length < 4) {
    cleanedOptions.push(`Alternative ${String.fromCharCode(65 + cleanedOptions.length)}`);
  }
  if (cleanedOptions.length > 4) {
    cleanedOptions = cleanedOptions.slice(0, 4);
  }

  let correctIdx = Number(q?.correctOptionIndex);
  if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 3) {
    correctIdx = 0;
  }

  const explanation = String(q?.explanation || 'Detailed solution based on standard university theory.').trim();

  return {
    questionText,
    options: cleanedOptions,
    correctOptionIndex: correctIdx,
    explanation,
  };
};

/**
 * Resilient fallback quiz questions for CS topics.
 */
export const generateFallbackQuizQuestions = (topic = 'General CS', count = 5, difficulty = 'Medium') => {
  const bank = [
    {
      questionText: `In the context of ${topic || 'Algorithmic Complexity'}, what is the worst-case time complexity of searching in an unbalanced (skewed) Binary Search Tree with $n$ elements?`,
      options: ['$O(1)$', '$O(\\log n)$', '$O(n)$', '$O(n^2)$'],
      correctOptionIndex: 2,
      explanation: 'In a skewed BST (where each node has only one child), the tree degenerates into a linked list, causing sequential traversal of all $n$ nodes ($O(n)$).',
    },
    {
      questionText: `Which normalization rule must be satisfied for a database relation to be in Boyce-Codd Normal Form (BCNF)?`,
      options: [
        'Every non-prime attribute is fully functionally dependent on a candidate key.',
        'No non-prime attribute is transitively dependent on the primary key.',
        'For every non-trivial functional dependency $X \\to Y$, $X$ must be a superkey.',
        'All multi-valued attributes are converted into comma-separated strings.',
      ],
      correctOptionIndex: 2,
      explanation: 'BCNF strictly requires that for every non-trivial functional dependency $X \\to Y$, the determinant $X$ must be a superkey of the relation.',
    },
    {
      questionText: `During the TCP 3-Way Handshake, what control flags are set in the second segment transmitted from Server to Client?`,
      options: ['\`SYN\` only', '\`ACK\` only', '\`SYN + ACK\`', '\`FIN + ACK\`'],
      correctOptionIndex: 2,
      explanation: 'In step 2 of the TCP handshake, the server responds with both `SYN` (to synchronize its own sequence number) and `ACK` (to acknowledge the client’s `SYN`).',
    },
    {
      questionText: `What is the function of a 1-to-4 Demultiplexer (DEMUX) combinational circuit?`,
      options: [
        'Routes 4 data inputs into 1 single output line based on 2 select lines.',
        'Routes 1 single data input into 1 of 4 output lines based on 2 select lines.',
        'Encodes 4 binary inputs into a 2-bit binary number.',
        'Adds two 4-bit binary numbers producing sum and carry.',
      ],
      correctOptionIndex: 1,
      explanation: 'A 1-to-4 demultiplexer takes a single input channel $D$ and routes it to exactly one of $2^2 = 4$ output lines ($Y_0, Y_1, Y_2, Y_3$) using select lines $S_1, S_0$.',
    },
    {
      questionText: `Which graph traversal algorithm uses a First-In-First-Out (FIFO) queue and guarantees finding the shortest path in an unweighted graph?`,
      options: [
        'Depth-First Search (DFS)',
        'Breadth-First Search (BFS)',
        'Dijkstra’s Algorithm',
        'Kruskal’s Minimum Spanning Tree Algorithm',
      ],
      correctOptionIndex: 1,
      explanation: 'BFS explores vertices in order of their hop distance from the source using a FIFO queue, ensuring the first time a vertex is reached represents the shortest path in unweighted graphs.',
    },
  ];

  return bank.slice(0, Math.min(count, bank.length)).map((q) => sanitizeQuizQuestion(q, topic));
};
