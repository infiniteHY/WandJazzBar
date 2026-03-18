const API_BASE = process.env.SECONDME_API_BASE || 'https://api.mindverse.com/gate/lab'
const CLIENT_ID = process.env.SECONDME_CLIENT_ID!
const CLIENT_SECRET = process.env.SECONDME_CLIENT_SECRET!
const TOKEN_ENDPOINT = process.env.SECONDME_TOKEN_ENDPOINT || 'https://api.mindverse.com/gate/lab/api/oauth/token/code'
const TOKEN_REFRESH_ENDPOINT = `${API_BASE}/api/oauth/token/refresh`

export interface SecondMeToken {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType: string
}

export interface SecondMeUser {
  email?: string
  name: string
  avatarUrl?: string
  route?: string
}

interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// 交换授权码获取 Token
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<SecondMeToken> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  })

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  const result: ApiResponse<SecondMeToken> = await response.json()

  if (result.code !== 0 || !result.data) {
    throw new Error(`Token exchange failed: ${result.message || 'Unknown error'}`)
  }

  return result.data
}

// 刷新 Token
export async function refreshAccessToken(refreshToken: string): Promise<SecondMeToken> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
  })

  const response = await fetch(TOKEN_REFRESH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  const result: ApiResponse<SecondMeToken> = await response.json()

  if (result.code !== 0 || !result.data) {
    throw new Error(`Token refresh failed: ${result.message || 'Unknown error'}`)
  }

  return result.data
}

// 获取用户信息
export async function getSecondMeUser(accessToken: string): Promise<SecondMeUser> {
  const response = await fetch(`${API_BASE}/api/secondme/user/info`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: ApiResponse<SecondMeUser> = await response.json()

  if (result.code !== 0 || !result.data) {
    throw new Error(`Get user info failed: ${result.message || 'Unknown error'}`)
  }

  return result.data
}

// 获取聊天列表
export async function getChatList(accessToken: string) {
  const response = await fetch(`${API_BASE}/api/secondme/chat/session/list`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: ApiResponse<{ sessions: any[] }> = await response.json()

  if (result.code !== 0 || !result.data) {
    throw new Error(`Get chat list failed: ${result.message || 'Unknown error'}`)
  }

  return result.data.sessions
}

// 发送消息（注意：这里需要根据实际 API 调整）
export async function sendMessage(accessToken: string, sessionId: string, content: string) {
  const response = await fetch(`${API_BASE}/api/secondme/chat/stream`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      message: content,
    }),
  })

  return response
}

// 添加笔记
export async function createNote(accessToken: string, title: string, content: string) {
  const response = await fetch(`${API_BASE}/api/secondme/note/add`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      content,
    }),
  })

  const result: ApiResponse<{ noteId: number }> = await response.json()

  if (result.code !== 0 || !result.data) {
    throw new Error(`Create note failed: ${result.message || 'Unknown error'}`)
  }

  return result.data
}

// 注意：根据文档，SecondMe API 可能不直接提供笔记列表、更新、删除接口
// 这些功能可能需要通过其他方式实现，暂时保留占位函数

export async function getNoteList(accessToken: string) {
  // TODO: 根据实际 API 实现
  return []
}

export async function updateNote(accessToken: string, noteId: string, title: string, content: string) {
  // TODO: 根据实际 API 实现
  throw new Error('Update note not implemented yet')
}

export async function deleteNote(accessToken: string, noteId: string) {
  // TODO: 根据实际 API 实现
  throw new Error('Delete note not implemented yet')
}
