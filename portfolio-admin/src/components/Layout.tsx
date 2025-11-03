import { Outlet, NavLink } from 'react-router-dom'
import { Briefcase, FileText, Bug } from 'lucide-react'

export function Layout() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-serif text-stone-900">作品集管理后台</h1>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`
              }
            >
              <Briefcase size={18} />
              作品管理
            </NavLink>
            <NavLink
              to="/resume"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`
              }
            >
              <FileText size={18} />
              简历管理
            </NavLink>
            <NavLink
              to="/debug"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-red-400 hover:text-red-600 hover:border-red-300'
                }`
              }
            >
              <Bug size={18} />
              调试工具
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
