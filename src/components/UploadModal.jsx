import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Upload, File as FileIcon, Image, Video, Music, Check, AlertCircle } from 'lucide-react';

const UploadModal = ({ onClose, onSuccess }) => {
  const { user, githubService } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [errors, setErrors] = useState({});

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    // Filter out files that are already added
    const uniqueNewFiles = newFiles.filter(nf => !files.some(f => f.name === nf.name));
    setFiles(prev => [...prev, ...uniqueNewFiles]);
  };

  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    // Also clear errors for this file
    const newErrors = { ...errors };
    delete newErrors[fileName];
    setErrors(newErrors);
  };

  const getMediaType = (file) => {
      if (file.type.startsWith('image/')) return 'images';
      if (file.type.startsWith('video/')) return 'videos';
      if (file.type.startsWith('audio/')) return 'audio';
      return null;
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          // Remove data:image/png;base64, prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    setUploading(true);
    
    for (const file of files) {
        if (completed.includes(file.name)) continue;

        const mediaType = getMediaType(file);
        if (!mediaType) {
            setErrors(prev => ({ ...prev, [file.name]: "Unsupported file type" }));
            continue;
        }

        try {
            const content = await convertToBase64(file);
            const path = `${mediaType}/${file.name}`;
            const message = `Upload ${file.name} via MediaManager`;

            await githubService.uploadFile(user.owner, user.repo, path, content, message, user.branch);
            setCompleted(prev => [...prev, file.name]);
        } catch (error) {
            console.error(error);
            setErrors(prev => ({ ...prev, [file.name]: "Upload failed" }));
        }
    }

    setUploading(false);
    // If all successful (or handled), we could close or just stay open.
    // Let's check if all pending files are completed
    // Ideally we wait a bit then close if all success
    
    // Check if any errors exist
    // If no errors and all files in completed list, call onSuccess
};
  
  // Close if all files are uploaded successfully
  React.useEffect(() => {
      if (files.length > 0 && files.length === completed.length) {
          const timer = setTimeout(() => {
              onSuccess();
          }, 1000);
          return () => clearTimeout(timer);
      }
  }, [files, completed, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-gray-700">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Upload Media</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {/* Drag Drop Zone */}
            <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input 
                    type="file" 
                    multiple 
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-white">Click or drag files to upload</p>
                        <p className="text-sm text-gray-400 mt-1">Images, Videos, and Audio files up to 100MB</p>
                    </div>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Queue ({files.length})</h3>
                    {files.map((file, idx) => {
                        const isCompleted = completed.includes(file.name);
                        const error = errors[file.name];
                        const mediaType = getMediaType(file);

                        return (
                            <div key={idx} className="bg-gray-900 rounded-lg p-3 flex items-center gap-3 border border-gray-700">
                                <div className="p-2 bg-gray-800 rounded-lg">
                                    {mediaType === 'images' ? <Image className="w-5 h-5 text-purple-400" /> :
                                     mediaType === 'videos' ? <Video className="w-5 h-5 text-blue-400" /> :
                                     mediaType === 'audio' ? <Music className="w-5 h-5 text-green-400" /> :
                                     <FileIcon className="w-5 h-5 text-gray-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-white truncate">{file.name}</p>
                                        <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{mediaType || 'Unknown type'}</p>
                                </div>
                                
                                {isCompleted ? (
                                    <div className="p-1 bg-green-500/20 rounded-full">
                                        <Check className="w-4 h-4 text-green-500" />
                                    </div>
                                ) : error ? (
                                    <div className="group relative">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <div className="absolute right-0 top-full mt-2 w-max bg-red-500 text-white text-xs px-2 py-1 rounded hidden group-hover:block z-10">
                                            {error}
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => removeFile(file.name)} 
                                        disabled={uploading}
                                        className="p-1 hover:bg-red-500/20 rounded-full hover:text-red-400 text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
            <button 
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
                Cancel
            </button>
            <button 
                onClick={handleUpload}
                disabled={files.length === 0 || uploading || files.length === completed.length}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {uploading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                    </>
                ) : (
                    'Upload Files'
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
