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