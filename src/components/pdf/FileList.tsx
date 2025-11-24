
import React from 'react';

type FileListProps = {
  uploadedFiles: Set<string>;
  removeFile: (fileName: string) => void;
};

const FileList: React.FC<FileListProps> = ({ uploadedFiles, removeFile }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-base-content/70 mb-2 uppercase tracking-wider">Uploaded Files:</h3>
      <div className="flex flex-wrap gap-2">
        {Array.from(uploadedFiles).map(fileName => (
          <div key={fileName} className="badge badge-neutral gap-2 p-3">
            <span>{fileName}</span>
            <button 
              className="btn btn-xs btn-circle btn-ghost" 
              onClick={() => removeFile(fileName)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
