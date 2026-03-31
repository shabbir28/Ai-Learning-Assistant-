import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';

/* ─── tiny helpers ────────────────────────────────────────────── */
const fmtSize = (b) =>
  !b ? '' : b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;

const Chip = ({ label, color, bg }) => (
  <span style={{
    background: bg, color, fontSize: 11, fontWeight: 700,
    padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '.4px'
  }}>{label}</span>
);

/* ─── UPLOAD MODAL (portaled to document.body) ─────────────────── */
function UploadModal({ onClose, onUploadDone }) {
  const [uploading, setUploading]       = useState(false);
  const [error, setError]               = useState('');
  const [dragOver, setDragOver]         = useState(false);
  const [file, setFile]                 = useState(null);
  const [title, setTitle]               = useState('');
  const [progress, setProgress]         = useState(0);
  const fileRef = useRef(null);

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') return setError('Please choose a valid PDF file.');
    setError(''); setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ''));
  };

  const submit = async () => {
    if (!file) return setError('Please select a PDF file first.');
    setError(''); setUploading(true); setProgress(0);
    const iv = setInterval(() => setProgress(p => Math.min(p + Math.random()*12, 87)), 350);
    const fd = new FormData();
    fd.append('pdf', file); fd.append('title', title);
    try {
      await documentService.upload(fd);
      setProgress(100);
      await new Promise(r => setTimeout(r, 700));
      onUploadDone();
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed. Please try again.');
    } finally { clearInterval(iv); setUploading(false); }
  };

  const handleClose = () => { if (!uploading) onClose(); };

  /* ── ESC key ── */
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [uploading]);

  const modal = (
    <>
      <style>{`
        @keyframes __ovFade { from{opacity:0} to{opacity:1} }
        @keyframes __mdSlide { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:none} }
        .__overlay {
          position:fixed; inset:0; z-index:99999;
          background:rgba(2,6,23,.7); backdrop-filter:blur(18px);
          display:flex; align-items:center; justify-content:center; padding:24px;
          animation:__ovFade .22s ease-out;
        }
        .__modal {
          background:#fff; border-radius:26px; width:100%; max-width:480px;
          box-shadow:0 32px 80px -8px rgba(0,0,0,.38), 0 0 0 1px rgba(0,0,0,.06);
          overflow:hidden; animation:__mdSlide .35s cubic-bezier(.16,1,.3,1);
          display:flex; flex-direction:column; max-height:90vh;
        }
        .__mhead {
          flex-shrink:0;
          background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);
          padding:24px 28px; display:flex; align-items:center; gap:14px;
        }
        .__mhead-ico { width:44px; height:44px; border-radius:13px; background:rgba(34,197,94,.18); border:1px solid rgba(34,197,94,.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .__mhead-text h3 { margin:0 0 3px; font-size:18px; font-weight:900; color:#fff; }
        .__mhead-text p  { margin:0; font-size:13px; color:rgba(255,255,255,.5); font-weight:500; }
        .__mclose { margin-left:auto; width:30px; height:30px; border-radius:9px; background:rgba(255,255,255,.08); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.55); transition:.15s; flex-shrink:0; }
        .__mclose:hover { background:rgba(255,255,255,.16); color:#fff; }
        .__mbody { padding:24px 28px; overflow-y:auto; flex:1; }
        .__mfoot { flex-shrink:0; padding:16px 28px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px; }
        .__label { display:block; font-size:11.5px; font-weight:800; color:#374151; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
        .__input {
          width:100%; padding:12px 16px; box-sizing:border-box;
          border-radius:12px; border:1.5px solid #e5e7eb; background:#fafafa;
          font-size:14px; font-weight:600; color:#111827; outline:none;
          transition:.18s; margin-bottom:20px; font-family:inherit;
        }
        .__input:focus { border-color:#00c896; background:#fff; box-shadow:0 0 0 3px rgba(34,197,94,.1); }
        .__input::placeholder { color:#9ca3af; font-weight:500; }
        .__drop {
          border:2px dashed #d1d5db; border-radius:18px; background:#fafafa;
          padding:28px 20px; text-align:center; cursor:pointer; transition:.22s; user-select:none;
        }
        .__drop:hover           { border-color:#00c896; background:rgba(0,200,150,.07); }
        .__drop.__over          { border-color:#009e75; background:rgba(0,200,150,.12); transform:scale(1.01); }
        .__drop.__has           { border-color:#00c896; border-style:solid; background:rgba(0,200,150,.07); }
        .__drop-ico { width:62px; height:62px; margin:0 auto 12px; border-radius:16px; background:#fff; border:1.5px solid #e5e7eb; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,.05); transition:.2s; }
        .__drop:hover .__drop-ico { transform:translateY(-3px); }
        .__drop.__has .__drop-ico { background:rgba(0,200,150,.12); border-color:rgba(0,200,150,.3); }
        .__drop-t { font-size:15px; font-weight:800; color:#111827; margin-bottom:5px; }
        .__drop-s { font-size:13px; color:#6b7280; }
        .__browse { display:inline-block; margin-top:12px; padding:8px 18px; border-radius:10px; background:#fff; border:1.5px solid #d1d5db; font-size:13px; font-weight:700; color:#374151; transition:.15s; }
        .__drop:hover .__browse { border-color:#00c896; color:#007a5e; }
        .__prog-track { height:5px; border-radius:99px; background:#e5e7eb; overflow:hidden; margin-top:14px; }
        .__prog-fill  { height:100%; border-radius:99px; background:linear-gradient(90deg,#00c896,#009e75); transition:width .35s; }
        .__prog-txt   { font-size:12px; font-weight:800; color:#009e75; margin-top:5px; text-align:center; }
        .__err { background:#fef2f2; border:1.5px solid #fecaca; border-radius:12px; padding:10px 14px; font-size:13px; font-weight:700; color:#dc2626; margin-bottom:16px; display:flex; align-items:center; gap:7px; }
        .__btn-cancel { padding:11px 22px; border-radius:12px; font-size:14px; font-weight:700; color:#6b7280; background:#fff; border:1.5px solid #e5e7eb; cursor:pointer; transition:.15s; font-family:inherit; }
        .__btn-cancel:hover:not(:disabled) { background:#f9fafb; color:#111827; }
        .__btn-submit { padding:11px 26px; border-radius:12px; font-size:14px; font-weight:800; color:#fff; background:linear-gradient(135deg,#00c896,#009e75); border:none; cursor:pointer; transition:.22s; display:flex; align-items:center; gap:8px; box-shadow:0 5px 14px rgba(34,197,94,.28); font-family:inherit; }
        .__btn-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 9px 22px rgba(34,197,94,.36); }
        .__btn-submit:disabled { opacity:.45; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
        @keyframes __spin { to{transform:rotate(360deg)} }
        .__spin { width:15px; height:15px; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:__spin .7s linear infinite; }
      `}</style>
      <div className="__overlay" onClick={handleClose}>
        <div className="__modal" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="__mhead">
            <div className="__mhead-ico">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#00c896">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div className="__mhead-text">
              <h3>Upload Document</h3>
              <p>Add a PDF for AI-powered analysis</p>
            </div>
            <button className="__mclose" onClick={handleClose} disabled={uploading}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="__mbody">
            {error && (
              <div className="__err">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <label className="__label">Document Title</label>
            <input
              className="__input"
              type="text" placeholder="e.g. Chapter 4: React Basics"
              value={title} onChange={e => setTitle(e.target.value)} disabled={uploading}
            />

            <label className="__label">PDF File</label>
            <div
              className={`__drop${dragOver ? ' __over' : ''}${file ? ' __has' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0]); }}
              onClick={() => !uploading && fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                onChange={e => pickFile(e.target.files[0])} disabled={uploading} />

              {uploading ? (
                <>
                  <div className="__drop-ico" style={{ background: 'rgba(0,200,150,.12)', borderColor: 'rgba(0,200,150,.3)' }}>
                    <div style={{ width: 24, height: 24, border: '3px solid rgba(0,200,150,.2)', borderTopColor: '#009e75', borderRadius: '50%', animation: '__spin .8s linear infinite' }} />
                  </div>
                  <div className="__drop-t">Processing your document…</div>
                  <div className="__drop-s">AI is extracting text from your PDF</div>
                  <div className="__prog-track"><div className="__prog-fill" style={{ width: `${progress}%` }} /></div>
                  <div className="__prog-txt">{Math.round(progress)}%</div>
                </>
              ) : file ? (
                <>
                  <div className="__drop-ico">
                    <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#009e75"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="__drop-t" style={{ color: '#009e75' }}>File selected ✓</div>
                  <div className="__drop-s">{file.name}</div>
                  <div className="__drop-s">{fmtSize(file.size)}</div>
                  <div className="__browse">Click to change file</div>
                </>
              ) : (
                <>
                  <div className="__drop-ico">
                    <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#9ca3af"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <div className="__drop-t">Drag & drop your PDF here</div>
                  <div className="__drop-s">Supports PDF files up to 50 MB</div>
                  <div className="__browse">Browse Files</div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="__mfoot">
            <button className="__btn-cancel" onClick={handleClose} disabled={uploading}>Cancel</button>
            <button className="__btn-submit" onClick={submit} disabled={uploading || !file}>
              {uploading
                ? <><div className="__spin" /> Processing…</>
                : <><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> Upload & Process</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}

/* ─── MAIN PAGE ────────────────────────────────────────────────── */
export default function DocumentListPage() {
  const [documents, setDocuments]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);

  const fetchDocuments = () => {
    setLoading(true);
    documentService.getAll()
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchDocuments(); }, []);

  const handleUploadDone = () => { setShowModal(false); fetchDocuments(); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try { await documentService.delete(id); setDocuments(p => p.filter(d => d._id !== id)); }
    catch (e) { console.error(e); }
  };

  const processed = documents.filter(d => d.hasFlashcards || d.hasQuiz || d.summary).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .dl-page { max-width: 1060px; margin: 0 auto; font-family: 'Inter', sans-serif; }
        @keyframes dlFade { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .dl-page { animation: dlFade .4s ease-out; }

        /* Banner */
        .dl-banner {
          border-radius: 28px;
          background: #fff;
          border: 1px solid rgba(226,232,240,0.8);
          box-shadow: 0 12px 36px -4px rgba(15,23,42,.04), inset 0 0 0 1px rgba(255,255,255,1);
          padding: 36px 48px; margin-bottom: 28px;
          display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
          position: relative; overflow: hidden;
        }
        /* Subtle premium background pattern */
        .dl-banner::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle at 1.5px 1.5px, rgba(148,163,184,.12) 1.5px, transparent 0);
          background-size: 20px 20px;
          mask-image: linear-gradient(135deg, black 30%, transparent 100%);
          -webkit-mask-image: linear-gradient(135deg, black 30%, transparent 100%);
          pointer-events: none;
        }
        /* Soft blurred accent glow */
        .dl-banner::after {
          content: ''; position: absolute; right: -40px; top: -60px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(0,200,150,.08) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .dl-kicker { position:relative; z-index:1; display:inline-flex; align-items:center; gap:8px; background:#fff; border:1px solid #e2e8f0; border-radius:99px; padding:6px 16px; font-size:11px; font-weight:800; color:#475569; letter-spacing:.6px; text-transform:uppercase; margin-bottom:16px; box-shadow:0 2px 8px rgba(15,23,42,.03); }
        .dl-kicker::before { content:''; width:6px; height:6px; border-radius:50%; background:#00c896; display:inline-block; animation:dlPulse 2s infinite; }
        @keyframes dlPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.5); box-shadow:0 0 8px rgba(0,200,150,.4)} }
        .dl-banner h1 { position:relative; z-index:1; font-size:32px; font-weight:900; color:#0f172a; letter-spacing:-1px; margin:0 0 8px; line-height:1.1; }
        .dl-banner p  { position:relative; z-index:1; font-size:15px; color:#64748b; font-weight:500; line-height:1.6; max-width:420px; margin:0; }
        
        .dl-upload-btn {
          position:relative; z-index:1;
          padding:15px 32px; border-radius:16px; font-size:14px; font-weight:800;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff;
          border: 1px solid rgba(255,255,255,.1); cursor:pointer; 
          display:flex; align-items:center; gap:10px; white-space:nowrap;
          box-shadow: 0 10px 24px -4px rgba(15,23,42,.2), inset 0 1px 1px rgba(255,255,255,.1); 
          transition: all .25s cubic-bezier(.4,0,.2,1); font-family:'Inter',sans-serif;
        }
        .dl-upload-btn:hover { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); transform:translateY(-3px); box-shadow: 0 14px 32px -4px rgba(15,23,42,.3), inset 0 1px 1px rgba(255,255,255,.15); }

        /* Stats */
        .dl-stats { display:flex; gap:16px; margin-bottom:32px; flex-wrap:wrap; }
        .dl-stat { position:relative; overflow:hidden; flex:1; min-width:160px; background:#fff; border-radius:20px; border:1px solid rgba(226,232,240,0.8); padding:20px 24px; box-shadow:0 8px 24px -4px rgba(15,23,42,.03), inset 0 0 0 1px rgba(255,255,255,1); display:flex; align-items:center; gap:16px; transition:transform .25s, box-shadow .25s; }
        .dl-stat:hover { transform:translateY(-2px); box-shadow:0 12px 32px -4px rgba(15,23,42,.05), inset 0 0 0 1px rgba(255,255,255,1); }
        .dl-stat-ico { position:relative; z-index:1; width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:20px; box-shadow:inset 0 1px 1px rgba(255,255,255,.5); }
        .dl-stat-val { position:relative; z-index:1; font-size:26px; font-weight:900; color:#0f172a; line-height:1; letter-spacing:-.5px; }
        .dl-stat-lbl { position:relative; z-index:1; font-size:13px; font-weight:600; color:#64748b; margin-top:4px; }

        /* Skeleton */
        @keyframes dlShim { 0%{background-position:-500px 0} 100%{background-position:500px 0} }
        .dl-skel { height:200px; border-radius:18px; background:linear-gradient(90deg,#f8fafc 25%,#f0f4f8 50%,#f8fafc 75%); background-size:500px 100%; animation:dlShim 1.5s infinite; }

        /* Grid */
        .dl-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:18px; }

        /* Card */
        .dl-card {
          background:#fff; border-radius:18px; border:1.5px solid #f0f4f8; padding:20px;
          display:flex; flex-direction:column; position:relative; overflow:hidden;
          box-shadow:0 2px 8px rgba(15,23,42,.04); transition:all .28s cubic-bezier(.4,0,.2,1);
        }
        .dl-card-bar { position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#00c896,#009e75); transform:scaleX(0); transform-origin:left; transition:transform .3s; border-radius:18px 18px 0 0; }
        .dl-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(15,23,42,.1); border-color:rgba(0,200,150,.1); }
        .dl-card:hover .dl-card-bar { transform:scaleX(1); }
        .dl-card-top { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .dl-card-ico { width:44px; height:44px; border-radius:12px; background:rgba(0,200,150,.07); border:1px solid rgba(0,200,150,.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .dl-card-name { font-size:15px; font-weight:800; color:#0f172a; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .dl-card-meta { font-size:12px; font-weight:600; color:#94a3b8; margin-top:2px; }
        .dl-tags { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px; }
        .dl-actions { display:flex; gap:8px; margin-top:auto; }
        .dl-btn-open { flex:1; text-align:center; padding:10px; border-radius:11px; background:#f8fafc; color:#0f172a; font-size:13px; font-weight:800; text-decoration:none; border:1.5px solid #f0f4f8; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:6px; }
        .dl-card:hover .dl-btn-open { background:#003d2e; color:#fff; border-color:#003d2e; }
        .dl-btn-del { width:42px; height:42px; border-radius:11px; background:#f8fafc; border:1.5px solid #f0f4f8; color:#94a3b8; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
        .dl-btn-del:hover { background:#fef2f2; color:#ef4444; border-color:#fecaca; }
        .dl-empty { background:#fff; border-radius:22px; border:2px dashed #e2e8f0; padding:64px 40px; text-align:center; }
      `}</style>

      <div className="dl-page">
        {/* Banner */}
        <div className="dl-banner">
          <div style={{ zIndex: 1 }}>
            <div className="dl-kicker">Knowledge Library</div>
            <h1>Your Documents</h1>
            <p>Upload PDFs and let AI generate quizzes, flashcards &amp; summaries instantly.</p>
          </div>
          <button className="dl-upload-btn" onClick={() => setShowModal(true)}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload PDF
          </button>
        </div>

        {/* Stats */}
        <div className="dl-stats">
          {[
            { icon: '📄', label: 'Total Docs',    val: documents.length,                 bg: 'rgba(0,200,150,.07)', border: 'rgba(0,200,150,.2)' },
            { icon: '⚡', label: 'Processed',      val: processed,                        bg: '#fefce8', border: '#fde68a' },
            { icon: '🕐', label: 'Unprocessed',    val: documents.length - processed,     bg: '#f8fafc', border: '#e2e8f0' },
          ].map(s => (
            <div key={s.label} className="dl-stat">
              <div className="dl-stat-ico" style={{ background: s.bg, border: `1px solid ${s.border}` }}>{s.icon}</div>
              <div><div className="dl-stat-val">{s.val}</div><div className="dl-stat-lbl">{s.label}</div></div>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="dl-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="dl-skel" />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="dl-empty">
            <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>No documents yet</h3>
            <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.65 }}>
              Upload your first PDF to start building an AI-powered study library.
            </p>
            <button onClick={() => setShowModal(true)}
              style={{ background: '#1a1a2e', color: '#fff', padding: '12px 28px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', border: 'none', fontFamily: 'Inter,sans-serif' }}>
              Upload your first PDF
            </button>
          </div>
        ) : (
          <div className="dl-grid">
            {documents.map(doc => (
              <div key={doc._id} className="dl-card">
                <div className="dl-card-bar" />
                <div className="dl-card-top">
                  <div className="dl-card-ico">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#009e75">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dl-card-name">{doc.originalName}</div>
                    <div className="dl-card-meta">{fmtSize(doc.fileSize)}</div>
                  </div>
                </div>
                <div className="dl-tags">
                  {doc.hasFlashcards && <Chip label="Flashcards" color="#7e22ce" bg="#f3e8ff" />}
                  {doc.hasQuiz       && <Chip label="Quiz"        color="#1d4ed8" bg="#dbeafe" />}
                  {doc.summary       && <Chip label="Summary"     color="#00654a" bg="rgba(0,200,150,.1)" />}
                  {!doc.hasFlashcards && !doc.hasQuiz && !doc.summary && <Chip label="Unprocessed" color="#64748b" bg="#f1f5f9" />}
                </div>
                <div className="dl-actions">
                  <Link to={`/documents/${doc._id}`} className="dl-btn-open">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    Open Document
                  </Link>
                  <button className="dl-btn-del" onClick={() => handleDelete(doc._id)}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Portaled Modal — renders in document.body, bypasses ALL CSS containment */}
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onUploadDone={handleUploadDone}
        />
      )}
    </>
  );
}
