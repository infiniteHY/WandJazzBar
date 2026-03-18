'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function HomeContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SecondMe 应用
          </h1>
          <p className="text-gray-600 mb-8">
            使用 SecondMe 账号登录
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error === 'no_code' && '未收到授权码'}
              {error === 'auth_failed' && '登录失败，请重试'}
              {!['no_code', 'auth_failed'].includes(error) && '发生错误'}
            </div>
          )}

          <a
            href="/api/auth/login"
            className="inline-block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            使用 SecondMe 登录
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            功能介绍
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              查看个人资料
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              聊天功能
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              笔记管理
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <HomeContent />
    </Suspense>
  )
}
