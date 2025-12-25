import React from 'react';
import MediaCard from './MediaCard';

const MediaGrid = ({ files, isLoading, onRefresh, user }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-20">
            <div className="bg-gray-800 p-6 rounded-full mb-4">
                <p className="text-4xl">📂</p>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No media files found</h3>
            <p className="max-w-sm text-center">Upload some images, videos, or audio files to get started.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {files.map((file) => (
        <MediaCard 
            key={file.sha} 
            file={file} 
            user={user}
            onDeleted={onRefresh} // Refresh grid after deletion
        />
      ))}
    </div>
  );
};

export default MediaGrid;
