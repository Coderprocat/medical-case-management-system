import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types.ts';
import { 
  Activity, 
  CheckCircle2, 
  LogOut, 
  RotateCcw, 
  Layers,
  ChevronDown,
  Menu,
  X,
  Check,
  Palette
} from 'lucide-react';
import { SEED_USERS } from '../data/initialData.ts';
import { ApiClient } from '../services/api.ts';

export type NavbarTheme = 'midnight' | 'teal' | 'light';

interface NavbarProps {
  user: User;
  activeTab: 'dashboard' | 'cases' | 'tests';
  setActiveTab: (tab: 'dashboard' | 'cases' | 'tests') => void;
  onLogout: () => void;
  onSwitchUser: (newUser: User) => void;
  onResetDatabase: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchUser,
  onResetDatabase,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Theme state persisted in localStorage
  const [navbarTheme, setNavbarTheme] = useState<NavbarTheme>(() => {
    return (localStorage.getItem('jajal_navbar_theme') as NavbarTheme) || 'midnight';
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('jajal_navbar_theme', navbarTheme);
  }, [navbarTheme]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setPaletteMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickSwitch = (seedUser: typeof SEED_USERS[0]) => {
    const { passwordHash, ...safeUser } = seedUser;
    ApiClient.setSession(`sanctum_${seedUser.role}_switch`, safeUser);
    onSwitchUser(safeUser);
    setRoleMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleReset = async () => {
    if (confirm('Reset the database back to the original 24 seed cases?')) {
      setIsResetting(true);
      await onResetDatabase();
      setIsResetting(false);
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { 
      id: 'dashboard' as const, 
      label: 'Dashboard', 
      icon: Activity,
      color: 'blue'
    },
    { 
      id: 'cases' as const, 
      label: 'Cases Directory', 
      icon: Layers,
      color: 'teal'
    },
    { 
      id: 'tests' as const, 
      label: 'Automated Tests', 
      icon: CheckCircle2,
      color: 'emerald'
    },
  ];

  // Theme-specific styles
  const isDark = navbarTheme === 'midnight';
  const isTealTheme = navbarTheme === 'teal';

  const headerBgClass = isDark
    ? 'bg-slate-900 border-slate-800 text-white shadow-md'
    : isTealTheme
    ? 'bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 border-teal-800/80 text-white shadow-md'
    : 'bg-white border-zinc-200/90 text-zinc-900 shadow-2xs';

  const getRoleColors = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          badge: isDark || isTealTheme ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' : 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
          avatar: 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white',
        };
      case 'engineer':
        return {
          badge: isDark || isTealTheme ? 'bg-teal-500/20 text-teal-300 border-teal-400/30' : 'bg-teal-50 text-teal-700 border-teal-200',
          dot: 'bg-teal-500',
          avatar: 'bg-gradient-to-tr from-teal-600 to-cyan-500 text-white',
        };
      default:
        return {
          badge: isDark || isTealTheme ? 'bg-sky-500/20 text-sky-300 border-sky-400/30' : 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
          avatar: 'bg-gradient-to-tr from-sky-600 to-blue-500 text-white',
        };
    }
  };

  const roleStyle = getRoleColors(user.role);

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-200 ${headerBgClass}`}>
      {/* Sleek top multi-color spectrum ribbon */}
      <div className="h-0.5 w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Zone 1: Brand & Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-95"
            >
              {/* Vibrant Medical Gradient Logo */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs ring-1 ring-white/20">
                JM
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`font-bold text-sm sm:text-base tracking-tight whitespace-nowrap ${isDark || isTealTheme ? 'text-white' : 'text-zinc-900'}`}>
                  Jajal Medical
                </span>
                <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded font-semibold hidden sm:inline bg-teal-500/15 text-teal-400 border border-teal-500/30">
                  IMPLANT OS
                </span>
              </div>
            </button>

            {/* Live Status Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Live</span>
            </div>
          </div>

          {/* Zone 2: Navigation Links with Distinct Tab Color Highlights */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              let activeClass = '';
              let inactiveClass = '';

              if (isDark || isTealTheme) {
                activeClass = item.id === 'dashboard'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-400/40 shadow-xs'
                  : item.id === 'cases'
                  ? 'bg-teal-500/20 text-teal-300 border-teal-400/40 shadow-xs'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-xs';
                inactiveClass = 'text-slate-300 hover:text-white hover:bg-slate-800/70 border-transparent';
              } else {
                activeClass = item.id === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs font-semibold'
                  : item.id === 'cases'
                  ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-2xs font-semibold'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs font-semibold';
                inactiveClass = 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border-transparent';
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                    isActive ? activeClass : inactiveClass
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${
                    isActive 
                      ? (isDark || isTealTheme ? 'text-teal-300' : 'text-teal-600') 
                      : (isDark || isTealTheme ? 'text-slate-400' : 'text-zinc-400')
                  }`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Palette Switcher, Quick Reset & Role Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Navbar Theme / Color Palette Switcher */}
            <div className="relative" ref={paletteRef}>
              <button
                onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
                title="Change navbar color style"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isDark || isTealTheme
                    ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline capitalize">{navbarTheme}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {paletteMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 animate-in fade-in text-zinc-800">
                  <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                    Navbar Color Theme
                  </div>
                  <button
                    onClick={() => {
                      setNavbarTheme('midnight');
                      setPaletteMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                      navbarTheme === 'midnight' ? 'font-semibold text-blue-600 bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
                      <span>Midnight Navy</span>
                    </div>
                    {navbarTheme === 'midnight' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setNavbarTheme('teal');
                      setPaletteMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                      navbarTheme === 'teal' ? 'font-semibold text-teal-600 bg-teal-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-700 to-cyan-800 border border-teal-600" />
                      <span>Surgical Teal</span>
                    </div>
                    {navbarTheme === 'teal' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setNavbarTheme('light');
                      setPaletteMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                      navbarTheme === 'light' ? 'font-semibold text-cyan-600 bg-cyan-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-white border-2 border-teal-500" />
                      <span>Clean White</span>
                    </div>
                    {navbarTheme === 'light' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Data Reset button */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              title="Reset data back to original 24 seed cases"
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
                isDark || isTealTheme
                  ? 'border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="whitespace-nowrap">Reset Data</span>
            </button>

            {/* Role Switcher & User Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border text-xs transition-colors shadow-2xs ${
                  isDark || isTealTheme
                    ? 'border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 text-white'
                    : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800'
                }`}
                title="Switch active user or view permissions"
              >
                <div className={`w-6 h-6 rounded-md ${roleStyle.avatar} flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs`}>
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className={`text-[11px] font-semibold leading-tight truncate max-w-[110px] ${isDark || isTealTheme ? 'text-white' : 'text-zinc-900'}`}>
                    {user.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.dot}`} />
                    <span className="text-[9px] font-mono uppercase tracking-wider font-semibold opacity-80">
                      {user.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 animate-in fade-in text-zinc-900">
                  <div className="px-3.5 py-2 border-b border-zinc-100 bg-zinc-50/50 rounded-t-xl">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Signed in as
                    </p>
                    <p className="text-xs font-bold text-zinc-900 truncate mt-0.5">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate font-mono">
                      {user.email}
                    </p>
                    <div className="mt-1.5">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : user.role === 'engineer'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {user.role} Permissions
                      </span>
                    </div>
                  </div>

                  <div className="px-3 py-1.5">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Quick Role Switch:
                    </span>
                    <div className="space-y-1">
                      {SEED_USERS.map((seed) => {
                        const isCurrent = seed.email === user.email;
                        const roleColors = getRoleColors(seed.role);
                        return (
                          <button
                            key={seed.id}
                            type="button"
                            onClick={() => handleQuickSwitch(seed)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              isCurrent
                                ? 'bg-zinc-100 text-zinc-900 font-medium'
                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-md ${roleColors.avatar} flex items-center justify-center text-[10px] font-bold`}>
                                {seed.name.charAt(0)}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs">{seed.name}</span>
                                <span className="text-[10px] text-zinc-400 capitalize">
                                  {seed.role} • {seed.role === 'admin' ? 'Full CRUD' : seed.role === 'engineer' ? 'Create/Edit' : 'Read Only'}
                                </span>
                              </div>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-zinc-900" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-zinc-100 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRoleMenuOpen(false);
                        handleReset();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-md text-xs text-zinc-600 hover:bg-zinc-50 flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                      <span>Reset Seed Database</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-md text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-1.5 rounded-lg transition-colors ${
                isDark || isTealTheme
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-3 border-t space-y-1 animate-in fade-in ${
            isDark || isTealTheme ? 'border-slate-800 text-white' : 'border-zinc-100 text-zinc-900'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-xs'
                      : isDark || isTealTheme
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className={`pt-2 mt-2 border-t flex items-center justify-between px-3 ${
              isDark || isTealTheme ? 'border-slate-800 text-slate-400' : 'border-zinc-100 text-zinc-500'
            }`}>
              <span className="text-[11px]">
                Logged in as <strong>{user.name}</strong> ({user.role})
              </span>
              <button
                onClick={onLogout}
                className="text-xs text-rose-500 font-medium hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
