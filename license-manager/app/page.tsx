'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './AuthContext'
import LicenseManager from './license-manager'
import Login from './login'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-screen"
          >
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-2xl font-bold text-primary"
            >
              Fortnite Fajita Administration
            </motion.h1>
          </motion.div>
        ) : (
          <motion.main
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-background"
          >
            {isAuthenticated ? <LicenseManager /> : <Login />}
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}