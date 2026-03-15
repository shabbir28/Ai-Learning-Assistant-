import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';

export default function DocumentListPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  
  const fileRef = useRef(null);

  const fetchDocuments = () => {
    setLoading(true);
    documentService.getAll()
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      return setUploadError('Please select a valid PDF file.');
    }
    setUploadError('');
    setSelectedFile(file);
    // Auto-fill title with filename (without extension) if title is empty
    if (!documentTitle) {
      setDocumentTitle(file.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      return setUploadError('Please select a PDF file first.');
    }
    setUploadError('');
    setUploading(true);
    
    const formData = new FormData();
    formData.append('pdf', selectedFile);
    // We send title, but it depends on if backend handles it or ignores it. 
    formData.append('title', documentTitle);
    
    try {
      await documentService.upload(formData);
      fetchDocuments();
      closeModal();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    if (uploading) return;
    setIsModalOpen(false);
    setSelectedFile(null);
    setDocumentTitle('');
    setUploadError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentService.delete(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Documents</h1>
          <p className="text-slate-500 mt-1">Manage and interace with your uploaded PDFs</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Upload Document
        </button>
      </div>

      {/* Document list grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 card animate-pulse bg-slate-50 border-slate-200" />)}
        </div>
      ) : documents.length === 0 ? (
        <div className="card text-center py-16 flex flex-col items-center justify-center border-dashed border-2">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
             <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-700">No documents yet</p>
          <p className="text-slate-500 mt-2 max-w-sm">Upload a PDF to start extracting text, generating flashcards, and taking quizzes.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} className="card bg-white hover:shadow-lg transition-all duration-300 border border-slate-200 flex flex-col relative group">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(doc._id); }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50 absolute right-4 top-4"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 line-clamp-2 pr-8 mb-1" title={doc.originalName}>
                  {doc.originalName}
                </h3>
                {doc.fileSize && <p className="text-sm text-slate-500 mb-4">{formatSize(doc.fileSize)}</p>}
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {doc.hasFlashcards && <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-md">Flashcards</span>}
                  {doc.hasQuiz && <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md">Quiz</span>}
                  {doc.summary && <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md">Summary</span>}
                </div>
              </div>
              
              <Link to={`/documents/${doc._id}`} className="mt-5 w-full bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 font-semibold py-2.5 rounded-xl border border-slate-200 text-center transition-colors">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="fixed inset-0 bg-slate-800/60 backdrop-blur-sm transition-opacity" 
            onClick={closeModal}
          ></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-slide-up flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Upload New Document</h2>
                <p className="text-sm text-slate-500 mt-1">Add a PDF document to your library</p>
              </div>
              <button 
                onClick={closeModal}
                disabled={uploading}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5">
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="React JS Concept Guide"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700 disabled:opacity-50 disabled:bg-slate-50"
                />
              </div>

              {/* PDF File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  PDF File
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                    dragOver 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : selectedFile 
                        ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50' 
                        : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/30'
                  } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input 
                    ref={fileRef} 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    onChange={(e) => handleFileSelect(e.target.files[0])} 
                    disabled={uploading}
                  />
                  
                  {uploading ? (
                    <div className="py-4">
                      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm font-semibold text-emerald-600">Uploading...</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${selectedFile ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                         <svg className={`w-6 h-6 ${selectedFile ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                         </svg>
                      </div>
                      
                      {selectedFile ? (
                        <>
                          <p className="text-emerald-700 font-bold text-sm truncate px-2">{selectedFile.name}</p>
                          <p className="text-slate-500 text-xs mt-1">{formatSize(selectedFile.size)} - Click to change</p>
                        </>
                      ) : (
                        <>
                          <p className="text-slate-700 font-bold text-sm">Select PDF to upload</p>
                          <p className="text-slate-500 text-xs mt-1">PDF up to 10MB</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={uploading || !selectedFile}
                className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-sm flex items-center gap-2 ${
                  uploading || !selectedFile 
                    ? 'bg-emerald-300 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-md active:scale-95'
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
