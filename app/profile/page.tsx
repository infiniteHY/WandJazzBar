'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface UserProfile {
  id: string
  nickname: string
  avatar?: string
  bio?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.status === 401) {
        router.push('/')
        return
      }
      if (!response.ok) {
        throw new Error('获取个人信息失败')
      }
      const data = await response.json()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">加载中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">个人资料</h1>

          {profile && (
            <div className="space-y-6">
              {profile.avatar && (
                <div className="flex justify-center">
                  <img
                    src={profile.avatar}
                    alt={profile.nickname}
                    className="w-24 h-24 rounded-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  昵称
                </label>
                <p className="text-lg text-gray-900">{profile.nickname}</p>
              </div>

              {profile.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    简介
                  </label>
                  <p className="text-gray-900">{profile.bio}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SecondMe ID
                </label>
                <p className="text-gray-600 font-mono text-sm">{profile.id}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
