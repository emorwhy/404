'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Trash2, Loader2, LogOut } from 'lucide-react'

type License = {
  key: string
  host: string
  expires: number
}

export default function LicenseManager() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [newHost, setNewHost] = useState('')
  const [newExpires, setNewExpires] = useState('')
  const [validateLicense, setValidateLicense] = useState('')
  const [validateHost, setValidateHost] = useState('')
  const [validationResult, setValidationResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { logout } = useAuth()

  const apiUrl = 'https://8004-emorwhy-fortnitefajita-7brs3n97sqt.ws-us116.gitpod.io' // Replace with your actual API URL

  useEffect(() => {
    fetchLicenses()
  }, [])

  const fetchLicenses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${apiUrl}/licenses`)
      if (response.ok) {
        const data = await response.json()
        setLicenses(data)
      } else {
        console.error('Failed to fetch licenses')
      }
    } catch (error) {
      console.error('Error fetching licenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createLicense = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${apiUrl}/licenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ host: newHost, expires: newExpires ? new Date(newExpires).getTime() : undefined }),
      })
      if (response.ok) {
        await fetchLicenses()
        setNewHost('')
        setNewExpires('')
      } else {
        console.error('Failed to create license')
      }
    } catch (error) {
      console.error('Error creating license:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteLicense = async (key: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${apiUrl}/licenses/${key}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchLicenses()
      } else {
        console.error('Failed to delete license')
      }
    } catch (error) {
      console.error('Error deleting license:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateLicenseKey = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${apiUrl}/validate?license=${validateLicense}&host=${validateHost}`)
      const data = await response.json()
      setValidationResult(data.status || data.error)
    } catch (error) {
      console.error('Error validating license:', error)
      setValidationResult('Error validating license')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 space-y-8"
    >
      <Card className="bg-card text-card-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>License Manager</CardTitle>
            <CardDescription>Manage and validate software licenses</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-2"
            >
              <h2 className="text-lg font-semibold">Create New License</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="new-host">Host</Label>
                  <Input
                    id="new-host"
                    placeholder="Host"
                    value={newHost}
                    onChange={(e) => setNewHost(e.target.value)}
                    className="bg-input text-input-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="new-expires">Expires</Label>
                  <Input
                    id="new-expires"
                    type="datetime-local"
                    value={newExpires}
                    onChange={(e) => setNewExpires(e.target.value)}
                    className="bg-input text-input-foreground"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={createLicense} className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create License
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-2"
            >
              <h2 className="text-lg font-semibold">Validate License</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="validate-license">License Key</Label>
                  <Input
                    id="validate-license"
                    placeholder="License Key"
                    value={validateLicense}
                    onChange={(e) => setValidateLicense(e.target.value)}
                    className="bg-input text-input-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="validate-host">Host</Label>
                  <Input
                    id="validate-host"
                    placeholder="Host"
                    value={validateHost}
                    onChange={(e) => setValidateHost(e.target.value)}
                    className="bg-input text-input-foreground"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={validateLicenseKey} className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Validate
                  </Button>
                </div>
              </div>
              {validationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 flex items-center ${validationResult === 'License valid' ? 'text-green-500' : 'text-red-500'}`}
                >
                  {validationResult === 'License valid' ? <CheckCircle2 className="mr-2" /> : <AlertCircle className="mr-2" />}
                  {validationResult}
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-2"
            >
              <h2 className="text-lg font-semibold">Active Licenses</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground">License Key</TableHead>
                    <TableHead className="text-muted-foreground">Host</TableHead>
                    <TableHead className="text-muted-foreground">Expires</TableHead>
                    <TableHead className="text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) => (
                    <TableRow key={license.key}>
                      <TableCell>{license.key}</TableCell>
                      <TableCell>{license.host}</TableCell>
                      <TableCell>{new Date(license.expires).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => deleteLicense(license.key)} disabled={isLoading}>
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}