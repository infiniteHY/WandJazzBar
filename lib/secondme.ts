const API_BASE = 'https://api.mindverse.com/gate/lab'

export interface SecondMeToken {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  scope: string[]
}

export interface SecondMeUser {
  name: string
  email?: string
  avatarUrl?: string
  route?: string
}

interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

/**
 * 用授权码换取 access_token 和 refresh_token
 * 官方文档要求 Content-Type: application/x-www-form-urlencoded
 * https://develop-docs.second.me/zh/docs/api-reference/oauth
 */
export async function exchangeCodeForToken(code: string): Promise<SecondMeToken> {
  const response = await fetch(`${API_BASE}/api/oauth/token/code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SECONDME_REDIRECT_URI || 'https://wandjazzbar.vercel.app/api/auth/callback/secondme',
      client_id: process.env.SECONDME_CLIENT_ID || '',
      client_secret: process.env.SECONDME_CLIENT_SECRET || '',
    }),
  })

  const result: ApiResponse<SecondMeToken> = await response.json()

  if (result.code !== 0 || !result.data?.accessToken) {
    throw new Error(`Token exchange failed: ${result.message || 'Unknown error'}`)
  }

  return result.data
}

/**
 * 用 refresh_token 刷新 access_token
 */
export async function refreshAccessToken(refreshToken: string): Promise<SecondMeToken> {
  const response = await fetch(`${API_BASE}/api/oauth/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.SECONDME_CLIENT_ID || '',
      client_secret: process.env.SECONDME_CLIENT_SECRET || '',
    }),
  })

  const result: ApiResponse<SecondMeToken> = await response.json()

  if (result.code !== 0 || !result.data?.accessToken) {
    throw new Error(`Token refresh failed: ${result.message || 'Unknown error'}`)
  }

  return result.data
}

/**
 * 获取用户信息
 * https://develop-docs.second.me/zh/docs/api-reference/secondme
 */
export async function getSecondMeUser(accessToken: string): Promise<SecondMeUser> {
  const response = await fetch(`${API_BASE}/api/secondme/user/info`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const result: ApiResponse<SecondMeUser> = await response.json()

  if (result.code !== 0 || !result.data) {
    throw new Error(`Get user info failed: ${result.message || 'Unknown error'}`)
  }

  return result.data
}
