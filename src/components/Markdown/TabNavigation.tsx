import React from 'react';
import { MarkdownFile } from '../../types/city';

interface TabNavigationProps {
  files: MarkdownFile[];
  activeFile: string;
  onFileChange: (fileName: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  files,
  activeFile,
  onFileChange,
}) => {
  if (files.length <= 1) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        {files.map((file) => (
          <button
            key={file.name}
            onClick={() => onFileChange(file.name)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeFile === file.name
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {file.title || file.name}
          </button>
        ))}
      </nav>
    </div>
  );
}; 