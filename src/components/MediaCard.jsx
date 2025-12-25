import React, { useState } from 'react';
import { Trash2, Link, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MediaCard = ({ file, user, onDeleted }) => {
  const { githubService } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Construct raw URL
  const rawUrl = `https://raw.githubusercontent.com/${user.owner}/${user.repo}/${user.branch}/${file.path}`;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) return;
    
    setIsDeleting(true);
    try {
        await githubService.deleteFile(user.owner, user.repo, file.path, `Delete ${file.name}`, user.branch);
        onDeleted();
    } catch (error) {
        alert("Failed to delete file: " + error.message);
        setIsDeleting(false);
    }
  };

  const copyEmbed = () => {
    let code = rawUrl;
    if (file.mediaType === 'images') {
        code = `<img src="${rawUrl}" alt="${file.name}" />`;
    } else if (file.mediaType === 'videos') {
        code = `<video src="${rawUrl}" controls></video>`;
    } else if (file.mediaType === 'audio') {
        code = `<audio src="${rawUrl}" controls></audio>`;
    }

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-900/10">
      {/* Preview Area */}
      <div className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden relative">
          {file.mediaType === 'images' ? (
              <img src={rawUrl} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
          ) : file.mediaType === 'videos' ? (
             <video src={rawUrl} className="w-full h-full object-cover" />
          ) : (
             <div className="text-gray-500 flex flex-col items-center">
                 <span className="text-4xl mb-2">🎵</span>
                 <span className="text-xs px-2 text-center">{file.name}</span>
             </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={copyEmbed}
                className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-200 transition-colors"
                title="Copy Embed Code"
              >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Link className="w-5 h-5" />}
              </button>
              <button 
                onClick={handleDelete}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Delete"
                disabled={isDeleting}
              >
                  <Trash2 className="w-5 h-5" />
              </button>
          </div>
      </div>

      {/* Footer Details */}
      <div className="p-3">
          <h4 className="text-sm font-medium text-white truncate" title={file.name}>{file.name}</h4>
          <p className="text-xs text-gray-500 uppercase mt-0.5">{file.mediaType}</p>
      </div>
      
      {isDeleting && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
      )}
    </div>
  );
};

export default MediaCard;
