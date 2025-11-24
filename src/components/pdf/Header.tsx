
import React from 'react';

type HeaderProps = {
  onUploaderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
};

const Header: React.FC<HeaderProps> = ({ onUploaderChange, fileInputRef }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-base-content/10 gap-4">
      <div>
        <h2 className="card-title text-2xl text-base-content">PDF Content Filter</h2>
        <p className="text-base-content/60 text-sm mt-1">Analyze your statements securely.</p>
      </div>
      <div className="w-full md:w-auto">
        <label className="form-control w-full md:max-w-xs">
          <div className="label p-1">
            <span className="label-text-alt text-base-content/60">Upload PDF File(s)</span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onUploaderChange} 
            className="file-input file-input-bordered file-input-primary w-full file-input-sm" 
            accept="application/pdf" 
            multiple 
          />
        </label>
      </div>
    </div>
  );
};

export default Header;
