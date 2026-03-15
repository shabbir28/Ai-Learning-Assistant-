import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { flashcardService } from '../../services/flashcardService';
import { quizService } from '../../services/quizService';

// ── Tabs config ──────────────────────────────────────────────────────────────
const TABS = ['Content', 'Chat', 'AI Actions', 'Flashcards', 'Quizzes'];

// ── Small reusable action button ─────────────────────────────────────────────
const ActionBtn = ({ onClick, loading, disabled, children, variant = 'primary' }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
    } ${
      variant === 'primary' 
        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md' 
        : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
    }`}
  >
    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
    {children}
  </button>
);

// ── Chat message bubble ───────────────────────────────────────────────────────
const ChatBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
          isUser
            ? 'bg-emerald-500 text-white rounded-tr-[4px]'
            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-[4px]'
        }`}
      >
        {msg.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ml-3 flex-shrink-0 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
};

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex justify-start mb-5">
    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-[4px] shadow-sm flex items-center gap-1.5">
      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Content');
  const [message, setMessage] = useState({ type: '', text: '' });

  // AI Actions state
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch document
  useEffect(() => {
    documentService.getById(id)
      .then(setDoc)
      .catch(() => navigate('/documents'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Auto-focus input when switching to Chat tab
  useEffect(() => {
    if (activeTab === 'Chat') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  const showMsg = (type, text) => setMessage({ type, text });

  // ── AI Actions handlers ──
  const handleSummary = async () => {
    setSummaryLoading(true);
    try {
      const { summary } = await documentService.generateSummary(id);
      setDoc((prev) => ({ ...prev, summary }));
      showMsg('success', 'Summary generated successfully!');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleFlashcards = async () => {
    setFlashcardLoading(true);
    try {
      const result = await flashcardService.generate(id);
      setDoc((prev) => ({ ...prev, hasFlashcards: true }));
      showMsg('success', 'Flashcards generated!');
      navigate(`/flashcards/${result._id}`);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to generate flashcards.');
    } finally {
      setFlashcardLoading(false);
    }
  };

  const handleQuiz = async () => {
    setQuizLoading(true);
    try {
      const result = await quizService.generate(id);
      setDoc((prev) => ({ ...prev, hasQuiz: true }));
      showMsg('success', 'Quiz generated!');
      navigate(`/quiz/${result._id}`);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to generate quiz.');
    } finally {
      setQuizLoading(false);
    }
  };

  // ── Chat handler ──
  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      // Build history (exclude the latest message, it's the current userMessage)
      const history = updatedMessages.slice(0, -1);
      const { reply } = await documentService.chat(id, text, history);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.response?.data?.message || 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setChatLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    setChatInput('');
    inputRef.current?.focus();
  };

  // ── Loading / null states ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!doc) return null;

  const backendOrigin = 'http://localhost:5000';
  const pdfUrl = doc.filePath
    ? `${backendOrigin}/uploads/${doc.filename}`
    : null;

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in pb-10">
      {/* Back link */}
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium text-[15px] mb-6 transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Documents
      </Link>

      {/* Premium Document Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-[#daf7eb] flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-[#00c896]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[26px] font-extrabold text-slate-900 truncate mb-1">{doc.originalName}</h1>
          <p className="text-slate-500 text-[15px] font-medium mb-3">
            {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
            {doc.extractedText ? ` · ${Math.ceil(doc.extractedText.length / 1000)}k characters` : ''}
          </p>
          <div className="flex gap-3 mt-1 flex-wrap">
            {doc.hasFlashcards ? (
              <span className="bg-[#f0e6ff] text-[#9b51e0] px-4 py-1.5 rounded-full text-[13px] font-bold">Flashcards</span>
            ) : null}
            {doc.hasQuiz ? (
              <span className="bg-[#daf7ea] text-[#00c896] px-4 py-1.5 rounded-full text-[13px] font-bold">Quiz</span>
            ) : null}
            {doc.summary ? (
              <span className="bg-[#e0f2fe] text-[#0ea5e9] px-4 py-1.5 rounded-full text-[13px] font-bold">Summary</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Global alert */}
      {message.text && (
        <div
          className={`px-5 py-4 rounded-xl text-sm font-semibold mb-6 border flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ── Main View Area ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col" style={{ minHeight: '650px' }}>
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto px-6 pt-2 border-b border-slate-100">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-[15px] font-bold whitespace-nowrap transition-all border-b-[3px] flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-[#00c896] text-[#00c896]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab === 'Chat' && (
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-white relative">

          {/* ── CONTENT TAB ── */}
          {activeTab === 'Content' && (
            <div className="p-6 md:p-8 h-full flex flex-col">
              {pdfUrl ? (
                <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 flex flex-col">
                  <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-slate-200 hidden md:flex">
                    <span className="text-slate-500 text-sm font-semibold tracking-wide">Document Viewer</span>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00c896] hover:text-[#00a87d] font-bold text-[13px] flex items-center gap-1.5 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in new tab
                    </a>
                  </div>
                  <iframe
                    src={`${pdfUrl}#toolbar=1`}
                    title="PDF Viewer"
                    className="w-full h-full bg-[#f1f5f9]"
                    style={{ minHeight: '600px' }}
                  />
                </div>
              ) : doc.extractedText ? (
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-4">📄 Extracted Text</h2>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 h-[600px] overflow-y-auto">
                    <p className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-wrap font-serif">
                      {doc.extractedText.slice(0, 3000)}
                      {doc.extractedText.length > 3000 ? '\n\n...' : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">No content available for this document.</p>
                </div>
              )}
            </div>
          )}

          {/* ── CHAT TAB ── */}
          {activeTab === 'Chat' && (
            <div className="flex flex-col h-[650px] bg-slate-50/50">
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-[24px] bg-[#daf7ea] flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#00c896]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-slate-900 font-extrabold text-2xl mb-3">Chat with this Document</h3>
                    <p className="text-slate-500 text-[15px] font-medium max-w-md mx-auto mb-8">
                      Ask anything about <span className="text-[#00c896]">{doc.originalName}</span>.
                      The AI has read the entire document and will answer based on its content.
                    </p>
                    {doc.extractedText && (
                      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                        {['What is this document about?', 'Summarize the key points in 3 bullets', 'What are the main topics covered?'].map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setChatInput(q);
                              setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                            className="bg-white px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:border-[#00c896] hover:text-[#00c896] hover:shadow-sm transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto w-full">
                    {chatMessages.map((msg, i) => (
                      <ChatBubble key={i} msg={msg} />
                    ))}
                    {chatLoading && <TypingIndicator />}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Chat input area */}
              {doc.extractedText && (
                <div className="bg-white border-t border-slate-100 p-4 md:p-6">
                  <div className="max-w-4xl mx-auto relative flex items-end gap-3">
                    {chatMessages.length > 0 && (
                      <button
                        onClick={clearChat}
                        title="Clear chat"
                        className="p-3 mb-1 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                    <div className="flex-1 relative shadow-sm rounded-2xl bg-white border border-slate-200 focus-within:border-[#00c896] focus-within:ring-4 focus-within:ring-[#00c896]/10 transition-all">
                      <textarea
                        ref={inputRef}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about this document... "
                        rows={1}
                        disabled={chatLoading}
                        className="w-full bg-transparent border-none rounded-2xl px-5 py-4 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 resize-none disabled:opacity-50"
                        style={{ maxHeight: '160px', minHeight: '56px', overflowY: 'auto' }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || chatLoading}
                      className="p-4 mb-0.5 rounded-2xl bg-[#00c896] hover:bg-[#00a87d] disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed text-white shadow-md transition-all active:scale-95 flex-shrink-0"
                    >
                      {chatLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 translate-x-0.5 -translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AI ACTIONS TAB ── */}
          {activeTab === 'AI Actions' && (
            <div className="p-6 md:p-10 max-w-4xl space-y-6">
              {!doc.extractedText && (
                <div className="px-5 py-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 font-semibold text-[15px] flex items-center gap-3">
                  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  No text was extracted from this PDF. AI features are unavailable.
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Generate Summary */}
                <div className="rounded-3xl border border-slate-100 p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-5">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Generate Summary</h3>
                  <p className="text-slate-500 font-medium text-[15px] mb-6">Create an AI-powered summary with key concepts and bullet points from the text.</p>
                  <ActionBtn onClick={handleSummary} loading={summaryLoading} disabled={!doc.extractedText}>
                    {summaryLoading ? 'Generating...' : 'Generate Summary'}
                  </ActionBtn>
                  
                  {doc.summary && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <h4 className="font-bold text-slate-800 mb-2">Summary Result:</h4>
                      <p className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-wrap">{doc.summary}</p>
                    </div>
                  )}
                </div>

                {/* Generate Flashcards */}
                <div className="rounded-3xl border border-slate-100 p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-5">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Generate Flashcards</h3>
                  <p className="text-slate-500 font-medium text-[15px] mb-6">Generate interactive flashcards to test your knowledge on this document's concepts.</p>
                  <ActionBtn onClick={handleFlashcards} loading={flashcardLoading} disabled={!doc.extractedText}>
                    {flashcardLoading ? 'Generating...' : 'Create Flashcards'}
                  </ActionBtn>
                </div>

                {/* Generate Quiz */}
                <div className="rounded-3xl border border-slate-100 p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-5">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Generate Quiz</h3>
                  <p className="text-slate-500 font-medium text-[15px] mb-6">Create a multiple-choice quiz from the document content to evaluate comprehension.</p>
                  <ActionBtn onClick={handleQuiz} loading={quizLoading} disabled={!doc.extractedText}>
                    {quizLoading ? 'Generating...' : 'Create Quiz'}
                  </ActionBtn>
                </div>
              </div>
            </div>
          )}

          {/* ── FLASHCARDS TAB ── */}
          {activeTab === 'Flashcards' && (
            <div className="flex items-center justify-center h-[600px] text-center px-6">
              {doc.hasFlashcards ? (
                <div className="max-w-md">
                  <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
                     <span className="text-4xl">🃏</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Flashcards Ready</h2>
                  <p className="text-slate-500 text-[15px] font-medium mb-8">You have a flashcard deck ready to study for this document.</p>
                  <button
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-500/30 transition-all active:scale-95"
                    onClick={() => navigate('/flashcards')}
                  >
                    Study Flashcards Now
                  </button>
                </div>
              ) : (
                <div className="max-w-md">
                  <div className="w-24 h-24 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl opacity-50">🃏</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">No Flashcards Yet</h2>
                  <p className="text-slate-500 text-[15px] font-medium mb-8">Generate interactive flashcards from the text to start memorizing key concepts.</p>
                  <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md" onClick={() => setActiveTab('AI Actions')}>
                    Go to AI Actions
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── QUIZZES TAB ── */}
          {activeTab === 'Quizzes' && (
            <div className="flex items-center justify-center h-[600px] text-center px-6">
              {doc.hasQuiz ? (
                <div className="max-w-md">
                  <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                     <span className="text-4xl">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Quiz Ready</h2>
                  <p className="text-slate-500 text-[15px] font-medium mb-8">Test your comprehension with the multiple-choice quiz generated from this document.</p>
                  <button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                    onClick={() => navigate('/quizzes')}
                  >
                    Take Quiz Now
                  </button>
                </div>
              ) : (
                <div className="max-w-md">
                  <div className="w-24 h-24 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl opacity-50">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">No Quiz Yet</h2>
                  <p className="text-slate-500 text-[15px] font-medium mb-8">Generate an AI-powered quiz from the text to test your knowledge.</p>
                  <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md" onClick={() => setActiveTab('AI Actions')}>
                    Go to AI Actions
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
