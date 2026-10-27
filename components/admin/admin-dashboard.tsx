"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Users, Camera, CameraOff, UserPlus, Calendar } from "lucide-react"
import { AnimatedCounter } from "@/components/motion/animated-counter"
import { RegistrationsManager } from "./registrations-manager"
import { EmailDomainsManager } from "./email-domains-manager"
import { QuestionsManager } from "./questions-manager"
import { AdminSettings } from "./admin-settings"
import { SponsorsManager } from "./sponsors-manager"
import { EventTimingManager } from "./event-timing-manager"
import { TeamSignupsManager } from "./team-signups-manager"
import { ScheduleEventsManager } from "./schedule-events-manager"
import { SiteSettingsManager } from "./site-settings-manager"
import { FaqManager } from "./faq-manager"

interface AdminDashboardProps {
  onLogout: () => void | Promise<void>
}

interface DashboardStats {
  totalRegistrations: number
  onCameraCount: number
  offCameraCount: number
  pendingCount: number
  confirmedCount: number
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    onCameraCount: 0,
    offCameraCount: 0,
    pendingCount: 0,
    confirmedCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    onLogout()
  }

  const refreshStats = () => {
    fetchDashboardStats()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary">Beheeromgeving</h1>
              <Badge variant="outline">24 uur live</Badge>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal aanmeldingen</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats.totalRegistrations} duration={0.6} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voor de camera</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats.onCameraCount} duration={0.6} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achter de schermen</CardTitle>
              <CameraOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats.offCameraCount} duration={0.6} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bevestigd</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats.confirmedCount} duration={0.6} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In afwachting</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats.pendingCount} duration={0.6} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="deelnemers" className="space-y-6">
          <TabsList className="grid w-full h-auto grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="deelnemers">Deelnemers</TabsTrigger>
            <TabsTrigger value="programma">Programma</TabsTrigger>
            <TabsTrigger value="content">Inhoud</TabsTrigger>
            <TabsTrigger value="beheer">Beheer</TabsTrigger>
          </TabsList>

          <TabsContent value="deelnemers">
            <Tabs defaultValue="registrations" className="space-y-6">
              <TabsList className="grid w-full h-auto grid-cols-3">
                <TabsTrigger value="registrations">Aanmeldingen</TabsTrigger>
                <TabsTrigger value="team-signups">Team-aanmeldingen</TabsTrigger>
                <TabsTrigger value="questions">Vragen</TabsTrigger>
              </TabsList>

              <TabsContent value="registrations">
                <RegistrationsManager onStatsUpdate={refreshStats} />
              </TabsContent>

              <TabsContent value="team-signups">
                <TeamSignupsManager />
              </TabsContent>

              <TabsContent value="questions">
                <QuestionsManager />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="programma">
            <Tabs defaultValue="schedule" className="space-y-6">
              <TabsList className="grid w-full h-auto grid-cols-2">
                <TabsTrigger value="schedule">Programma</TabsTrigger>
                <TabsTrigger value="event-timing">Tijden</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule">
                <ScheduleEventsManager />
              </TabsContent>

              <TabsContent value="event-timing">
                <EventTimingManager />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="content">
            <Tabs defaultValue="site-settings" className="space-y-6">
              <TabsList className="grid w-full h-auto grid-cols-3">
                <TabsTrigger value="site-settings">Site-instellingen</TabsTrigger>
                <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="site-settings">
                <SiteSettingsManager />
              </TabsContent>

              <TabsContent value="sponsors">
                <SponsorsManager />
              </TabsContent>

              <TabsContent value="faq">
                <FaqManager />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="beheer">
            <Tabs defaultValue="email-domains" className="space-y-6">
              <TabsList className="grid w-full h-auto grid-cols-2">
                <TabsTrigger value="email-domains">E-maildomeinen</TabsTrigger>
                <TabsTrigger value="settings">Instellingen</TabsTrigger>
              </TabsList>

              <TabsContent value="email-domains">
                <EmailDomainsManager />
              </TabsContent>

              <TabsContent value="settings">
                <AdminSettings />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
