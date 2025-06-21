import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Moon, Sun, Palette, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function Navigation({ isDarkMode = false, onToggleDarkMode }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Documentation', href: '#' },
    { label: 'Examples', href: '#' },
    { label: 'Gallery', href: '#' },
    { label: 'Support', href: '#' },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl">
                <Palette className="inline-block w-5 h-5 mr-2" />
                <span className="text-xl font-bold">SyncSketch</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  {item.label}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleDarkMode}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Github className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="py-4 space-y-2 border-t border-slate-200 dark:border-slate-700">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                {item.label}
              </Button>
            ))}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Github className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
