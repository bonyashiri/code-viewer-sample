// GitHub API クライアント
// 認証なしでパブリックリポジトリにアクセス

const GITHUB_API_BASE = 'https://api.github.com';

// リポジトリ情報を取得
export async function getRepository(owner, repo) {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch repository: ${response.status}`);
  }
  return response.json();
}

// リポジトリのコンテンツ（ファイル/ディレクトリ一覧）を取得
export async function getContents(owner, repo, path = '') {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch contents: ${response.status}`);
  }
  return response.json();
}

// ファイルの内容を取得（Base64でエンコードされているのでデコードする）
export async function getFileContent(owner, repo, path) {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.status}`);
  }
  const data = await response.json();
  
  // ファイルの場合、contentフィールドにBase64エンコードされた内容が含まれる
  if (data.type === 'file' && data.content) {
    // Base64デコード
    const decodedContent = atob(data.content);
    return {
      ...data,
      decodedContent
    };
  }
  
  return data;
}

// リポジトリのデフォルトブランチを取得
export async function getDefaultBranch(owner, repo) {
  const repoData = await getRepository(owner, repo);
  return repoData.default_branch;
}

// Git Trees APIを使用してファイルツリーを取得
export async function getFileTree(owner, repo, branch = null) {
  try {
    // ブランチが指定されていない場合はデフォルトブランチを取得
    if (!branch) {
      branch = await getDefaultBranch(owner, repo);
    }

    // ブランチの最新コミットSHAを取得
    const branchResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches/${branch}`);
    if (!branchResponse.ok) {
      throw new Error(`Failed to fetch branch: ${branchResponse.status}`);
    }
    const branchData = await branchResponse.json();
    const treeSha = branchData.commit.commit.tree.sha;

    // Git Trees APIで再帰的にツリーを取得
    const treeResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`);
    if (!treeResponse.ok) {
      throw new Error(`Failed to fetch tree: ${treeResponse.status}`);
    }
    const treeData = await treeResponse.json();

    return {
      tree: treeData.tree,
      truncated: treeData.truncated || false
    };
  } catch (error) {
    console.error('Error fetching file tree:', error);
    throw error;
  }
}

// GitHubのURLからowner/repoを抽出
export function parseGitHubUrl(url) {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);
  if (match) {
    return {
      owner: match[1],
      repo: match[2].replace('.git', '')
    };
  }
  return null;
}