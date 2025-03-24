
'use client'

import { Button } from '@progress/kendo-react-buttons'
import { Card, CardBody, CardHeader, CardTitle, CardActions } from '@progress/kendo-react-layout'
import { Input } from '@progress/kendo-react-inputs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, NotificationGroup } from '@progress/kendo-react-notification'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [showError, setShowError] = useState(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [name, setName] = useState<string>('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowError(true)
    setTimeout(() => {
      router.push('/sign-in')
    }, 3000)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-300">
      <NotificationGroup
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          zIndex: 10000
        }}
      >
        {showError && (
          <Notification
            type={{ style: 'error', icon: true }}
            closable={true}
            onClose={() => setShowError(false)}
          >
            <span>Server is busy with too many login attempts. Redirecting to alternative authentication...</span>
          </Notification>
        )}
      </NotificationGroup>
      <Card className="max-w-md w-full p-8 shadow-xl">
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold text-center text-orange-600">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.value)}
                  placeholder="John Doe"
                  className="w-full"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.value)}
                placeholder="you@example.com"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.value)}
                placeholder="••••••••"
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              themeColor={'primary'}
              className="w-full"
              rounded={'full'}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </CardBody>
        <CardActions>
          <div className="text-center w-full">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-600 hover:text-orange-700 text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </CardActions>
      </Card>
    </div>
  )
}
