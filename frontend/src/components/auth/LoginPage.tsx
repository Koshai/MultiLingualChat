import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Globe, MessageCircle, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SUPPORTED_LANGUAGES } from '@/types'

interface LoginForm {
  username: string
  password: string
}

interface RegisterForm {
  username: string
  email: string
  displayName: string
  password: string
  confirmPassword: string
  preferredLanguage: string
}

export function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const { login, register, isLoading } = useAuthStore()

  const loginForm = useForm<LoginForm>({
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const registerForm = useForm<RegisterForm>({
    defaultValues: {
      username: '',
      email: '',
      displayName: '',
      password: '',
      confirmPassword: '',
      preferredLanguage: 'en'
    }
  })

  const handleLogin = async (data: LoginForm) => {
    await login(data)
  }

  const handleRegister = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      registerForm.setError('confirmPassword', {
        message: 'Passwords do not match'
      })
      return
    }

    await register({
      username: data.username,
      email: data.email,
      displayName: data.displayName,
      preferredLanguage: data.preferredLanguage
    })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="flex flex-col justify-center px-12">
          <div className="flex items-center space-x-3 mb-8">
            <Globe className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Multilingual Chat</h1>
          </div>

          <p className="text-xl text-primary-100 mb-12">
            Break down language barriers and connect with people around the world in real-time.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <MessageCircle className="w-8 h-8 text-primary-200" />
              <div>
                <h3 className="font-semibold text-lg">Real-time Translation</h3>
                <p className="text-primary-200">Chat in your native language, understood by everyone</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-primary-200" />
              <div>
                <h3 className="font-semibold text-lg">Global Communities</h3>
                <p className="text-primary-200">Join rooms with people from different countries</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Globe className="w-8 h-8 text-primary-200" />
              <div>
                <h3 className="font-semibold text-lg">10+ Languages</h3>
                <p className="text-primary-200">Support for major world languages</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Globe className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Multilingual Chat</h1>
            </div>
            <p className="text-gray-600">Connect across languages</p>
          </div>

          <div className="card p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isRegister
                  ? 'Join the global conversation'
                  : 'Sign in to your account'
                }
              </p>
            </div>

            {!isRegister ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    {...loginForm.register('username', { required: 'Username is required' })}
                    type="text"
                    id="username"
                    className="input w-full"
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    {...loginForm.register('password', { required: 'Password is required' })}
                    type="password"
                    id="password"
                    className="input w-full"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      {...registerForm.register('username', { required: 'Username is required' })}
                      type="text"
                      id="reg-username"
                      className="input w-full"
                      placeholder="Choose username"
                      disabled={isLoading}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      {...registerForm.register('displayName', { required: 'Display name is required' })}
                      type="text"
                      id="displayName"
                      className="input w-full"
                      placeholder="Your name"
                      disabled={isLoading}
                    />
                    {registerForm.formState.errors.displayName && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.displayName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    {...registerForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    id="email"
                    className="input w-full"
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Language
                  </label>
                  <select
                    {...registerForm.register('preferredLanguage')}
                    id="preferredLanguage"
                    className="input w-full"
                    disabled={isLoading}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      {...registerForm.register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      type="password"
                      id="reg-password"
                      className="input w-full"
                      placeholder="Password"
                      disabled={isLoading}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      {...registerForm.register('confirmPassword', { required: 'Please confirm password' })}
                      type="password"
                      id="confirmPassword"
                      className="input w-full"
                      placeholder="Confirm"
                      disabled={isLoading}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-primary-600 hover:text-primary-500 font-medium"
                disabled={isLoading}
              >
                {isRegister
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

            {/* Demo credentials */}
            {!isRegister && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center mb-2">
                  <strong>Demo credentials:</strong>
                </p>
                <p className="text-xs text-gray-600 text-center">
                  Username: <code>demo</code> | Password: <code>password</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}