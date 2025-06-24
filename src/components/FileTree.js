import React, { useState } from 'react';

// ツリーデータを階層構造に変換
function buildTreeStructure(flatTree) {
  const root = { name: '/', path: '', type: 'tree', children: [] };
  const pathMap = { '': root };

  // パスでソート（親ディレクトリが先に来るように）
  const sortedTree = [...flatTree].sort((a, b) => a.path.localeCompare(b.path));

  sortedTree.forEach(item => {
    const pathParts = item.path.split('/');
    const parentPath = pathParts.slice(0, -1).join('/');
    const name = pathParts[pathParts.length - 1];

    const node = {
      ...item,
      name,
      children: item.type === 'tree' ? [] : undefined
    };

    // 親ノードを取得（なければ作成）
    let parent = pathMap[parentPath];
    if (!parent && parentPath) {
      // 親ディレクトリが存在しない場合は作成
      const parentParts = parentPath.split('/');
      parent = {
        name: parentParts[parentParts.length - 1],
        path: parentPath,
        type: 'tree',
        children: []
      };
      pathMap[parentPath] = parent;
    }

    if (parent) {
      parent.children.push(node);
    }
    
    if (item.type === 'tree') {
      pathMap[item.path] = node;
    }
  });

  return root.children;
}

// ファイル/フォルダアイコン
const FileIcon = () => (
  <span className="mr-1">📄</span>
);

const FolderIcon = ({ isOpen }) => (
  <span className="mr-1">{isOpen ? '📂' : '📁'}</span>
);

// ツリーノードコンポーネント
const TreeNode = ({ node, level = 0, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (node.type === 'tree') {
      setIsOpen(!isOpen);
    } else if (node.type === 'blob') {
      onFileSelect(node.path);
    }
  };

  const indent = level * 20;

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
          node.type === 'blob' ? 'text-gray-700' : 'text-gray-900 font-medium'
        }`}
        style={{ paddingLeft: `${indent}px` }}
        onClick={handleClick}
      >
        {node.type === 'tree' ? (
          <FolderIcon isOpen={isOpen} />
        ) : (
          <FileIcon />
        )}
        <span className="select-none">{node.name}</span>
      </div>
      {node.type === 'tree' && isOpen && node.children && (
        <div>
          {node.children.map((child, index) => (
            <TreeNode
              key={`${child.path}-${index}`}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ファイルツリーコンポーネント
const FileTree = ({ treeData, onFileSelect, truncated = false }) => {
  if (!treeData || treeData.length === 0) {
    return <div className="p-4 text-gray-500">No files found</div>;
  }

  const treeStructure = buildTreeStructure(treeData);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-2">Files</h3>
      {truncated && (
        <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
          ⚠️ Large repository: Some files may not be displayed
        </div>
      )}
      <div className="overflow-auto">
        {treeStructure.map((node, index) => (
          <TreeNode
            key={`${node.path}-${index}`}
            node={node}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default FileTree;