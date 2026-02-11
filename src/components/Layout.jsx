import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Home,
  Command,
  Keyboard,
} from 'lucide-react'
import clsx from 'clsx'

// Elite Cargo Logo Component
function EliteLogo({ className = "w-full h-full" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 1092.53 789.15" 
      fill="currentColor"
    >
      <path d="M709.37,469.66c-8.09,2.09-11.67,8.48-9.86,18.78,15.97,129.51,96.25,280.45,213.16,244.54,34.86-10.23,73.61-35.76,82.06-83.79.64-3.73.05-5.55-2.87-6.47-5.25-1.5-10.88-.92-16.16-2.15-3.61-1-5.89-3.93-6.58-8.8-2.46-14.19-5.51-38.39,11.18-38.22,33.09-.25,66.17.16,99.26-.07,6.91-.05,11.87,2.77,12.62,13.1.63,2.44.2,5.17.3,7.75,0,.14,0,.28-.02.42-.68,5.56-.75,11.17-.97,16.77,0,.1-.01.21-.02.31-2.11,17.38-23.79,9.81-33.47,11.86-4.52.44-7.68,3.55-9.71,8.95-59.99,162.09-235.21,168.09-325.6,44.74-41.66-58.09-63.34-140.36-74.63-216.51-1.55-13.8-20.68-19.98-23.75-4.58-.03.17-.05.34-.06.51-4.19,97.15.23,195.14-1.35,292.55-1,24.39-28.39,19.28-41.91,19.46-.06,0-.13,0-.19,0-7.91-.48-17.85-6.23-18.25-17.7,0-97.03,1.58-194.11-.24-291.13-.48-6.42-3.37-9.6-8.44-10.03-7.61-.65-27.39-5.91-26.76,12.11,1.41,97.4-.35,194.86.09,292.27,0,.1,0,.2.02.29.58,5.51.02,7.46-4.21,9.18-15.79,6.4-35.09,6.39-51.05.71-.07-.03-.15-.06-.22-.09-4.8-2.19-5.14-2.95-5.1-9.41.51-96.22.35-192.56-.11-288.73,0-.12,0-.24-.02-.36-1.19-10.46-4.97-17.44-15.92-15.33-4.39.85-5.44,14.61-6.4,19.83-8.29,41.16-13.52,76.51-28.28,115-76.8,200.3-291.48,253.28-370.14,48.45-2.83-8.25-7.56-12.11-14.4-12.04-5.84.09-11.68.79-17.53,1.03-8.81.46-12.23-5.52-13.33-14.58-1.5-14.8-.55-34.21,13.47-34.63,7.01-.21,14.3.73,21.33.47,15.1-.55,25.81-.73,41.24-.4,18.02.38,45.86-7.68,44.66,25.66-.27,7.37,1.87,20.19-5.28,22.29-6.57,2.07-10.9,1.2-17.61,2.08-2.94.56-3.45,2.07-2.43,5.63,23.79,77.12,103.34,102.87,161.32,79.83,85.05-33.99,145.42-198.14,138.98-259.58-1.15-10.95-17,8.11-113.11-15.34-99.46-24.27-221.39-76.46-238.37-223.21C13.91-76,462.29-137.5,452.99,424.65c-.2,12.83,14.1,12.58,13.67-.15-.03-106.95,1.33-213.93-.48-320.86-.12-8.29,2.59-14.07,9.03-14.18,10-.17,19.1-.51,28.62-.55,10.33-.03,24.03-3.94,24.1,14.79.37,106.47-1.87,212.93.03,319.39.1,5.44,2.05,9.06,6.32,10.15,6.76,1.58,13.76,1.09,20.61.81,4.35-.04,7.37-3.63,7.38-9.16.16-107.39.47-214.78,1.17-322.17,0-9.91,8.23-15.15,16.35-15.29,10.04-.17,20.17-.07,30.16,1.32,11.88,1.66,9.25,17.38,9.92,27.59,0,.06,0,.13,0,.19-.99,102.06-.13,205.55-.16,307.73-.03,5.01,4.06,5.91,7.94,6.77,7.25,2.42,16.13-1.48,15.68-12.86-.14-21.13-.24-42.28-.02-63.41,0-.06,0-.12,0-.18,5.73-88.97,24.32-181.05,66.87-253.48,130.73-221.54,448.32-40.16,306.42,225.1-.04.07-.08.15-.13.22-63.92,100.07-179.13,132.93-274.81,139.89M991.83,203.05c-.01-53.56-9.26-66.35-25.46-92.13-.06-.1-.13-.2-.2-.28-59.82-73.29-167.09-61.78-215.28,24.71-37.35,68.26-50.91,152.43-56.51,234.01-.83,14.87-2.8,29.7-3.21,44.57,0,.08,0,.16,0,.23.19,7.77,3.48,12.65,9.51,13.66.12.02.24.03.36.03,101.28,1.85,280.92-29.72,290.79-224.63,0-.06,0-.12,0-.18ZM399.51,396.47c0-.07,0-.13,0-.2-2.07-31.67-3.17-65.57-8.12-97.56-8.7-51.16-19.74-102.97-42.75-146.98-.04-.08-.08-.17-.12-.26C296.7,16.12,93.97,35.82,101.52,206.7c4.83,147.08,185.43,219.52,282.22,221.67.08,0,.16,0,.23,0,3.73-.25,7.56-1.04,11.06-2.59,4.01-1.78,4.7-4.22,4.55-8.64-.24-6.88-.06-13.77-.06-20.66Z"/>
    </svg>
  )
}

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, shortcut: '1' },
  { path: '/documents', label: 'Documents', icon: FileText, shortcut: '2' },
  { path: '/shipments', label: 'Expéditions', icon: Package, shortcut: '3' },
  { path: '/contacts', label: 'Contacts', icon: Users, shortcut: '4' },
  { path: '/reports', label: 'Rapports', icon: BarChart3, shortcut: '5' },
  { path: '/settings', label: 'Paramètres', icon: Settings, shortcut: '6' },
]

// Breadcrumb configuration
const breadcrumbLabels = {
  dashboard: 'Tableau de bord',
  documents: 'Documents',
  shipments: 'Expéditions',
  contacts: 'Contacts',
  reports: 'Rapports',
  settings: 'Paramètres',
}

function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)
  
  if (pathnames.length <= 1) return null
  
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <Link 
        to="/dashboard" 
        className="text-gray-500 hover:text-white transition-colors flex items-center gap-1"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const label = breadcrumbLabels[name] || (isNaN(name) ? name : `#${name}`)
        
        return (
          <span key={name} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-600" />
            {isLast ? (
              <span className="text-white font-medium">{label}</span>
            ) : (
              <Link
                to={routeTo}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

// Command palette modal
function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  
  const filteredItems = navItems.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase())
  )
  
  useEffect(() => {
    if (isOpen) {
      setSearch('')
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg glass-card p-0 animate-scale-in overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-elite-800/50">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tapez une commande ou recherchez..."
            className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none"
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs text-gray-500 bg-elite-900/50 rounded border border-elite-800/50">
            ESC
          </kbd>
        </div>
        
        <div className="py-2 max-h-[300px] overflow-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    onClose()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-elite-900/40 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span className="flex-1 text-left text-white">{item.label}</span>
                  <kbd className="px-2 py-0.5 text-xs text-gray-500 bg-elite-900/50 rounded">
                    ⌘{item.shortcut}
                  </kbd>
                </button>
              )
            })
          ) : (
            <p className="px-4 py-6 text-center text-gray-500">Aucun résultat trouvé</p>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-elite-800/50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-elite-900/50 rounded">↵</kbd> sélectionner
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-elite-900/50 rounded">↑↓</kbd> naviguer
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> + K ouvrir
          </span>
        </div>
      </div>
    </div>
  )
}

// Keyboard shortcuts help
function KeyboardShortcutsHelp({ isOpen, onClose }) {
  if (!isOpen) return null
  
  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Ouvrir la palette de commandes' },
    { keys: ['⌘', '1-6'], description: 'Naviguer vers une section' },
    { keys: ['⌘', '/'], description: 'Afficher les raccourcis clavier' },
    { keys: ['⌘', 'B'], description: 'Afficher/masquer la barre latérale' },
    { keys: ['Esc'], description: 'Fermer / Effacer la recherche' },
  ]
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md glass-card p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-elite-400" />
            Raccourcis clavier
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-gray-300">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="px-2 py-1 text-sm bg-elite-900/50 text-gray-300 rounded border border-elite-800/50">
                      {key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-gray-600">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      
      // Command/Ctrl + B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarCollapsed(prev => !prev)
      }
      
      // Command/Ctrl + / for shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShortcutsHelpOpen(true)
      }
      
      // Command/Ctrl + 1-6 for navigation
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '6') {
        e.preventDefault()
        const item = navItems[parseInt(e.key) - 1]
        if (item) navigate(item.path)
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
        setShortcutsHelpOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
  
  return (
    <div className="min-h-screen flex">
      {/* Command palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
      
      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp 
        isOpen={shortcutsHelpOpen} 
        onClose={() => setShortcutsHelpOpen(false)} 
      />
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Fixed position */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 bg-cargo-dark border-r border-elite-900/50',
          'transform transition-all duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-20' : 'w-72'
        )}
      >
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className={clsx(
            'flex items-center gap-3 px-6 py-5 border-b border-elite-900/50',
            sidebarCollapsed && 'lg:justify-center lg:px-4'
          )}>
            <div className={clsx(
              'text-elite-500 flex-shrink-0 transition-all',
              sidebarCollapsed ? 'w-10' : 'w-12'
            )}>
              <EliteLogo />
            </div>
            {!sidebarCollapsed && (
              <div className="lg:block">
                <h1 className="font-bold text-lg text-white">Elite Cargo</h1>
                <p className="text-xs text-gray-500">AWB Platform</p>
              </div>
            )}
          </div>
          
          {/* Navigation - with min-h-0 for proper flex shrinking */}
          <nav className={clsx(
            'flex-1 min-h-0 py-6 space-y-1 overflow-y-auto',
            sidebarCollapsed ? 'lg:px-2' : 'px-4'
          )}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'nav-link group',
                    isActive && 'active',
                    sidebarCollapsed && 'lg:justify-center lg:px-3'
                  )}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <kbd className="hidden group-hover:inline-flex px-1.5 py-0.5 text-[10px] text-gray-500 bg-elite-900/50 rounded">
                        ⌘{item.shortcut}
                      </kbd>
                    </>
                  )}
                </Link>
              )
            })}
          </nav>
          
          {/* User section - always visible at bottom */}
          <div className={clsx(
            'flex-shrink-0 p-4 border-t border-elite-900/50',
            sidebarCollapsed && 'lg:p-2'
          )}>
            <div className={clsx(
              'flex items-center gap-3',
              sidebarCollapsed && 'lg:justify-center'
            )}>
              {!sidebarCollapsed && (
                <>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-elite-500 to-elite-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">
                      {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.first_name || user?.username}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </>
              )}
              <button
                onClick={logout}
                className={clsx(
                  'flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors',
                  sidebarCollapsed ? 'p-2' : 'p-2'
                )}
                title="Se déconnecter"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content - with left margin for fixed sidebar */}
      <div className={clsx(
        'flex-1 flex flex-col min-w-0 transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-cargo-darker/80 backdrop-blur-xl border-b border-elite-900/50">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Toggle sidebar button (desktop) */}
            <button
              className="hidden lg:flex p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-elite-900/40"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Agrandir la barre latérale' : 'Réduire la barre latérale'}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search bar / Command palette trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center flex-1 max-w-xl mx-4"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <div className="input-field pl-10 pr-20 text-left text-gray-500 cursor-pointer hover:border-elite-700/50 transition-colors">
                  Rechercher ou taper une commande...
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-xs text-gray-500 bg-elite-900/50 rounded border border-elite-800/50">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 py-0.5 text-xs text-gray-500 bg-elite-900/50 rounded border border-elite-800/50">
                    K
                  </kbd>
                </div>
              </div>
            </button>
            
            {/* Header actions */}
            <div className="flex items-center gap-2">
              <button 
                className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-elite-900/40"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-elite-500 rounded-full" />
              </button>
              
              <button
                onClick={() => setShortcutsHelpOpen(true)}
                className="hidden lg:flex p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-elite-900/40"
                title="Raccourcis clavier"
              >
                <Keyboard className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Breadcrumbs />
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
