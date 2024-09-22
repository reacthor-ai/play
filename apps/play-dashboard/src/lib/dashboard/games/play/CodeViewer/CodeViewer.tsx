import React, {memo} from 'react';
import {SandpackLayout, SandpackPreview, SandpackProvider} from "@codesandbox/sandpack-react";

export type CodeViewerProps = {
  isLoading?: boolean;
  code: string;
  explanation?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = memo((props) => {
  const {
    isLoading,
    code,
  } = props

  const files = {
    "/App.js": code,
  };

  return (
    <div className="relative">
      <SandpackProvider
        template="react"
        files={files}
        theme="dark"
        options={{
          externalResources: ["https://cdn.tailwindcss.com"]
        }}
      >
        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          <SandpackLayout>
            <SandpackPreview/>
          </SandpackLayout>
        </div>
      </SandpackProvider>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
});

CodeViewer.displayName = "CodeViewer"