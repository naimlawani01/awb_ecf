import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Settings, User, Shield, Key, Bell, Database } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'
import clsx from 'clsx'

export default function SettingsPage() {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    ...(isAdmin ? [{ id: 'admin', label: 'Administration', icon: Database }] : []),
  ]
  
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    try {
      setIsSubmitting(true)
      await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      )
      toast.success('Mot de passe modifié avec succès')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Échec du changement de mot de passe')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gray-500/10">
          <Settings className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Paramètres
          </h1>
          <p className="text-gray-400 text-sm">
            Gérez votre compte et vos préférences
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="glass-card p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                    activeTab === tab.id
                      ? 'bg-elite-400/10 text-elite-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
        
        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-display font-semibold text-white mb-6">
                Informations du profil
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-elite-400 flex items-center justify-center">
                    <span className="text-3xl font-display font-bold text-white">
                      {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-display font-semibold text-white">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-gray-400">@{user?.username}</p>
                    <span className="badge badge-info mt-2 capitalize">{user?.role}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nom d'utilisateur</label>
                    <input
                      type="text"
                      value={user?.username || ''}
                      disabled
                      className="input-field bg-white/5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-field bg-white/5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={user?.first_name || ''}
                      disabled
                      className="input-field bg-white/5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nom</label>
                    <input
                      type="text"
                      value={user?.last_name || ''}
                      disabled
                      className="input-field bg-white/5"
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">
                  Contactez un administrateur pour modifier vos informations de profil.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-display font-semibold text-white mb-6 flex items-center gap-2">
                <Key className="w-5 h-5 text-elite-400" />
                Changer le mot de passe
              </h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="input-field"
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 caractères
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          )}
          
          {activeTab === 'admin' && isAdmin && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h2 className="text-lg font-display font-semibold text-white mb-6 flex items-center gap-2">
                  <Database className="w-5 h-5 text-elite-400" />
                  Connexion à la base de données
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-cargo-success/10 border border-cargo-success/20">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cargo-success animate-pulse" />
                      <span className="text-cargo-success font-medium">Connectée</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      La base de données AWB Editor est connectée et opérationnelle
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-sm text-gray-400">Type de base</p>
                      <p className="text-white font-medium">PostgreSQL</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-sm text-gray-400">Mode d'accès</p>
                      <p className="text-white font-medium">Lecture seule</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6">
                <h2 className="text-lg font-display font-semibold text-white mb-6">
                  Informations système
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-gray-400">Version de la plateforme</p>
                    <p className="text-white font-medium">1.0.0</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-gray-400">Version API</p>
                    <p className="text-white font-medium">v1</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

