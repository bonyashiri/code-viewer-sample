import React, { useState } from 'react';
import { getRepository, getFileContent, parseGitHubUrl, getFileTree } from './api/githubApi';
import FileTree from './components/FileTree';

const CodeLine = ({ line, lineNumber }) => {
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
              <span key={index} className="text-green-600">
                {word}
              </span>
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
          <CodeLine key={index} line={line} lineNumber={index + 1} />
        ))}
      </div>
    </div>
  );
};

const GithubStyleCodeViewer = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [repoInfo, setRepoInfo] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [truncated, setTruncated] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // リポジトリ情報とファイルツリーを取得
  const loadRepository = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const parsed = parseGitHubUrl(repoUrl);
      if (!parsed) {
        throw new Error('Invalid GitHub URL');
      }

      const { owner, repo } = parsed;
      
      // リポジトリ情報を取得
      const repoData = await getRepository(owner, repo);
      setRepoInfo(repoData);
      
      // Git Trees APIでファイルツリーを取得
      const treeResult = await getFileTree(owner, repo);
      setTreeData(treeResult.tree);
      setTruncated(treeResult.truncated);
      
      // ツリーからファイルのみを抽出して最初のファイルを選択
      const firstFile = treeResult.tree.find(item => item.type === 'blob');
      if (firstFile) {
        await selectFile(firstFile.path);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ファイルを選択して内容を取得
  const selectFile = async (path) => {
    setLoading(true);
    try {
      const parsed = parseGitHubUrl(repoUrl);
      const { owner, repo } = parsed;
      
      const fileData = await getFileContent(owner, repo, path);
      setSelectedFile(path);
      setFileContent(fileData.decodedContent || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GitHub-style Source Code Viewer</h1>
      
      {/* URL入力フォーム */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="https://github.com/owner/repo"
          className="p-2 border rounded w-96 mr-2"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <button
          onClick={loadRepository}
          disabled={loading || !repoUrl}
          className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Load Repository
        </button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* リポジトリ情報 */}
      {repoInfo && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold">{repoInfo.full_name}</h2>
          <p className="text-gray-600">{repoInfo.description}</p>
          <p className="text-sm text-gray-500">⭐ {repoInfo.stargazers_count} stars</p>
        </div>
      )}

      {/* ファイルツリーとコンテンツ表示 */}
      {treeData.length > 0 && (
        <div className="flex gap-4">
          {/* ファイルツリー */}
          <div className="w-1/3">
            <FileTree 
              treeData={treeData} 
              onFileSelect={selectFile}
              truncated={truncated}
            />
          </div>
          
          {/* ファイル内容表示 */}
          <div className="w-2/3">
            {selectedFile && fileContent && !loading && (
              <FileViewer fileName={selectedFile} content={fileContent} />
            )}
          </div>
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div className="text-center py-4">
          <p>Loading...</p>
        </div>
      )}

    </div>
  );
};

export default GithubStyleCodeViewer;
