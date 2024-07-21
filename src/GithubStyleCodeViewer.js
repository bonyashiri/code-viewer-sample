import React, { useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

// Mock file system
const fileSystem = {
  'src/index.js': `import homu from "./homu";

document.getElementById('app').innerHTML = homu;`,
  'src/homu.js': `export default homu = 'homu.';`
};

const CodeLine = ({ line, lineNumber, onHover }) => {
  const words = line.split(/(\s+)/);
  return (
    <div className="flex">
      <span className="w-12 text-right pr-4 text-gray-500 select-none">{lineNumber}</span>
      <pre className="flex-1">
        {words.map((word, index) => {
          if (word.startsWith('import') || word.startsWith('from')) {
            return <span key={index} className="text-purple-600">{word}</span>;
          } else if (word.startsWith('"./')) {
            return (
              <Tippy
                key={index}
                content={<pre className="p-2 bg-gray-100 rounded">{fileSystem[`src/${word.slice(3, -1)}`]}</pre>}
                interactive={true}
              >
                <span className="text-green-600 cursor-pointer" onMouseEnter={() => onHover(word.slice(3, -1))}>
                  {word}
                </span>
              </Tippy>
            );
          } else if (word === 'export' || word === 'default') {
            return <span key={index} className="text-blue-600">{word}</span>;
          } else {
            return <span key={index}>{word}</span>;
          }
        })}
      </pre>
    </div>
  );
};

const FileViewer = ({ fileName, content }) => {
  const lines = content.split('\n');
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">{fileName}</h2>
      <div className="bg-gray-100 p-4 rounded">
        {lines.map((line, index) => (
          <CodeLine key={index} line={line} lineNumber={index + 1} onHover={() => {}} />
        ))}
      </div>
    </div>
  );
};

const GithubStyleCodeViewer = () => {
  const [selectedFile, setSelectedFile] = useState('src/index.js');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GitHub-style Source Code Viewer</h1>
      <div className="mb-4">
        <select
          className="p-2 border rounded"
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
        >
          {Object.keys(fileSystem).map((file) => (
            <option key={file} value={file}>
              {file}
            </option>
          ))}
        </select>
      </div>
      <FileViewer fileName={selectedFile} content={fileSystem[selectedFile]} />
    </div>
  );
};

export default GithubStyleCodeViewer;
