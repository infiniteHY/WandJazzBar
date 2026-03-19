const AGENT_API = 'https://app.mindos.com/gate/in/rest/third-party-agent/v1'

export interface SecondMeToken {
  accessToken: string
  tokenType: string
}

export interface SecondMeUser {
  name: string
  avatar?: string
  aboutMe?: string
  originRoute?: string
  homepage?: string
}

interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// 用 smc-xxx 授权码换取 sm-xxx token
export async function exchangeCodeForToken(code: string): Promise<SecondMeToken> {
  const response = await fetch(`${AGENT_API}/auth/token/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })

  const result: ApiResponse<SecondMeToken> = await response.json()

  if (result.code !== 0 || !result.data?.accessToken) {
    throw new Error(`Token exchange failed: ${result.message || 'Unknown error'}`)
  }

  return result.data
}

// 获取用户 profile
export async function getSecondMeUser(accessToken: string): Promise<SecondMeUser> {
  const response = await fetch(`${AGENT_API}/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const result: ApiResponse<SecondMeUser> = await response.json()

  if (result.code !== 0 || !result.data) {
    throw new Error(`Get user info failed: ${result.message || 'Unknown error'}`)
  }

  return result.data
}
