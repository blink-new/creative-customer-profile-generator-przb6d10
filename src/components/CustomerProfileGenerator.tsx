import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { blink } from '../blink/client'
import { Sparkles, Target, Users, Download, RefreshCw, BookOpen, Save, FileText, Edit3, Lightbulb } from 'lucide-react'

interface User {
  id: string
  email: string
  displayName?: string
}

interface CustomerProfile {
  demographics: {
    ageRange: string
    gender: string
    location: string
    income: string
    education: string
  }
  psychographics: {
    values: string[]
    interests: string[]
    lifestyle: string
    personality: string
  }
  painPoints: string[]
  motivations: string[]
  goals: string[]
  communicationChannels: string[]
  buyingBehavior: {
    decisionFactors: string[]
    purchaseProcess: string
    budget: string
  }
}

interface CustomerProfileGeneratorProps {
  user: User
}

interface ExampleTemplate {
  id: string
  title: string
  description: string
  vision: string
  mission: string
  business: string
  target: string
}

const EXAMPLE_TEMPLATES: ExampleTemplate[] = [
  {
    id: 'creative-agency',
    title: 'Creative Design Agency',
    description: 'A boutique design agency focusing on brand identity',
    vision: 'To become the go-to creative partner for innovative brands worldwide',
    mission: 'We help businesses tell their story through compelling visual design and strategic branding',
    business: 'We are a full-service creative agency specializing in brand identity, web design, and marketing materials. We work with startups and established businesses to create memorable brand experiences.',
    target: 'Small to medium businesses, startups, entrepreneurs who value good design and want to stand out in their market'
  },
  {
    id: 'wellness-coach',
    title: 'Wellness & Life Coach',
    description: 'Personal coaching for holistic wellness',
    vision: 'To empower individuals to live their most authentic and fulfilling lives',
    mission: 'We guide people through transformative wellness journeys using holistic approaches to mind, body, and spirit',
    business: 'I offer one-on-one coaching sessions, group workshops, and online courses focused on stress management, mindfulness, nutrition, and personal development.',
    target: 'Busy professionals, women in their 30s-50s, people going through life transitions, health-conscious individuals'
  },
  {
    id: 'tech-startup',
    title: 'SaaS Tech Startup',
    description: 'B2B software solution for productivity',
    vision: 'To revolutionize how teams collaborate and manage projects',
    mission: 'We build intuitive software tools that help teams work smarter, not harder',
    business: 'We develop cloud-based project management and collaboration software for remote and hybrid teams. Our platform integrates with popular tools and focuses on simplicity and user experience.',
    target: 'Remote teams, project managers, small to medium businesses, tech-savvy professionals, startups'
  }
]

export function CustomerProfileGenerator({ user }: CustomerProfileGeneratorProps) {
  const [step, setStep] = useState(1)
  const [visionStatement, setVisionStatement] = useState('')
  const [missionStatement, setMissionStatement] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [targetMarket, setTargetMarket] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null)
  const [savedProfiles, setSavedProfiles] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  // Load saved profiles on component mount
  useEffect(() => {
    loadSavedProfiles()
  }, [loadSavedProfiles])

  const loadSavedProfiles = useCallback(async () => {
    try {
      // For now, we'll use localStorage as fallback
      const saved = localStorage.getItem(`profiles_${user.id}`)
      if (saved) {
        setSavedProfiles(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading saved profiles:', error)
    }
  }, [user.id])

  const saveProfile = async () => {
    if (!customerProfile) return
    
    setIsSaving(true)
    try {
      const profileData = {
        id: Date.now().toString(),
        profileName: `Profile ${new Date().toLocaleDateString()}`,
        visionStatement,
        missionStatement,
        businessDescription,
        targetMarket,
        customerProfile,
        createdAt: new Date().toISOString()
      }

      const updated = [...savedProfiles, profileData]
      setSavedProfiles(updated)
      localStorage.setItem(`profiles_${user.id}`, JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const loadTemplate = (template: ExampleTemplate) => {
    setVisionStatement(template.vision)
    setMissionStatement(template.mission)
    setBusinessDescription(template.business)
    setTargetMarket(template.target)
    setShowTemplates(false)
    setStep(2) // Move to step 2 after loading template
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    try {
      const prompt = `
        Based on the following business information, create a detailed ideal customer profile:
        
        Vision Statement: ${visionStatement}
        Mission Statement: ${missionStatement}
        Business Description: ${businessDescription}
        Target Market: ${targetMarket}
        
        Please analyze these statements and create a comprehensive customer profile that includes demographics, psychographics, pain points, motivations, goals, communication channels, and buying behavior.
      `

      const { object } = await blink.ai.generateObject({
        prompt,
        schema: {
          type: 'object',
          properties: {
            demographics: {
              type: 'object',
              properties: {
                ageRange: { type: 'string' },
                gender: { type: 'string' },
                location: { type: 'string' },
                income: { type: 'string' },
                education: { type: 'string' }
              },
              required: ['ageRange', 'gender', 'location', 'income', 'education']
            },
            psychographics: {
              type: 'object',
              properties: {
                values: { type: 'array', items: { type: 'string' } },
                interests: { type: 'array', items: { type: 'string' } },
                lifestyle: { type: 'string' },
                personality: { type: 'string' }
              },
              required: ['values', 'interests', 'lifestyle', 'personality']
            },
            painPoints: { type: 'array', items: { type: 'string' } },
            motivations: { type: 'array', items: { type: 'string' } },
            goals: { type: 'array', items: { type: 'string' } },
            communicationChannels: { type: 'array', items: { type: 'string' } },
            buyingBehavior: {
              type: 'object',
              properties: {
                decisionFactors: { type: 'array', items: { type: 'string' } },
                purchaseProcess: { type: 'string' },
                budget: { type: 'string' }
              },
              required: ['decisionFactors', 'purchaseProcess', 'budget']
            }
          },
          required: ['demographics', 'psychographics', 'painPoints', 'motivations', 'goals', 'communicationChannels', 'buyingBehavior']
        }
      })

      setCustomerProfile(object as CustomerProfile)
      setStep(3)
    } catch (error) {
      console.error('Error generating customer profile:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportJSON = () => {
    if (!customerProfile) return
    
    const exportData = {
      generatedAt: new Date().toISOString(),
      businessInfo: {
        visionStatement,
        missionStatement,
        businessDescription,
        targetMarket
      },
      customerProfile
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customer-profile.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportText = () => {
    if (!customerProfile) return
    
    const textContent = `
CUSTOMER PROFILE REPORT
Generated: ${new Date().toLocaleDateString()}

BUSINESS INFORMATION
Vision Statement: ${visionStatement}
Mission Statement: ${missionStatement}
Business Description: ${businessDescription}
Target Market: ${targetMarket || 'Not specified'}

CUSTOMER PROFILE

DEMOGRAPHICS
Age Range: ${customerProfile.demographics.ageRange}
Gender: ${customerProfile.demographics.gender}
Location: ${customerProfile.demographics.location}
Income Level: ${customerProfile.demographics.income}
Education: ${customerProfile.demographics.education}

PSYCHOGRAPHICS
Values: ${customerProfile.psychographics.values.join(', ')}
Interests: ${customerProfile.psychographics.interests.join(', ')}
Lifestyle: ${customerProfile.psychographics.lifestyle}
Personality: ${customerProfile.psychographics.personality}

PAIN POINTS
${customerProfile.painPoints.map(point => `• ${point}`).join('\n')}

MOTIVATIONS
${customerProfile.motivations.map(motivation => `• ${motivation}`).join('\n')}

GOALS
${customerProfile.goals.map(goal => `• ${goal}`).join('\n')}

COMMUNICATION CHANNELS
${customerProfile.communicationChannels.join(', ')}

BUYING BEHAVIOR
Decision Factors: ${customerProfile.buyingBehavior.decisionFactors.join(', ')}
Purchase Process: ${customerProfile.buyingBehavior.purchaseProcess}
Budget Range: ${customerProfile.buyingBehavior.budget}
    `.trim()
    
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customer-profile.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setStep(1)
    setVisionStatement('')
    setMissionStatement('')
    setBusinessDescription('')
    setTargetMarket('')
    setCustomerProfile(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Creative Customer Profile Generator</h1>
              <p className="text-muted-foreground">Transform vague vision statements into clear customer profiles</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Progress value={progress} className="w-48" />
              <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Welcome,</span>
              <Badge variant="secondary">{user.displayName || user.email}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {step === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Business Vision & Mission
              </CardTitle>
              <CardDescription>
                Share your vision and mission statements. Don't worry if they're vague - we'll help clarify them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Templates Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Need inspiration?</h3>
                  <p className="text-xs text-muted-foreground">Try one of our example templates</p>
                </div>
                <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Templates
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Example Business Templates</DialogTitle>
                      <DialogDescription>
                        Choose a template to get started quickly. You can customize it after loading.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 mt-4">
                      {EXAMPLE_TEMPLATES.map((template) => (
                        <Card key={template.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => loadTemplate(template)}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{template.title}</CardTitle>
                              <Button size="sm" variant="ghost">
                                <Lightbulb className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardDescription>{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Vision:</span> {template.vision.substring(0, 100)}...
                              </div>
                              <div>
                                <span className="font-medium">Mission:</span> {template.mission.substring(0, 100)}...
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="vision">Vision Statement</Label>
                <Textarea
                  id="vision"
                  placeholder="What is your long-term vision for your business? (e.g., 'To inspire creativity in everyone')"
                  value={visionStatement}
                  onChange={(e) => setVisionStatement(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mission">Mission Statement</Label>
                <Textarea
                  id="mission"
                  placeholder="What is your mission or purpose? (e.g., 'We help people express themselves through art')"
                  value={missionStatement}
                  onChange={(e) => setMissionStatement(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full"
                disabled={!visionStatement.trim() || !missionStatement.trim()}
              >
                Continue to Business Details
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Business Details & Target Market
              </CardTitle>
              <CardDescription>
                Tell us more about your business and who you think your customers might be.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="business">Business Description</Label>
                <Textarea
                  id="business"
                  placeholder="Describe what your business does, your products/services, and what makes you unique..."
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target">Target Market (Optional)</Label>
                <Textarea
                  id="target"
                  placeholder="Who do you think your ideal customers are? Any demographics, interests, or characteristics you have in mind..."
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  className="flex-1"
                  disabled={!businessDescription.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Customer Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && customerProfile && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Your Ideal Customer Profile
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={saveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={handleExportJSON}>
                        <FileText className="h-4 w-4 mr-2" />
                        JSON
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportText}>
                        <Download className="h-4 w-4 mr-2" />
                        Text
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Start Over
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Based on your vision and mission, here's your detailed customer profile
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Demographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Age Range</Label>
                    <p className="text-sm text-muted-foreground">{customerProfile.demographics.ageRange}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <p className="text-sm text-muted-foreground">{customerProfile.demographics.gender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm text-muted-foreground">{customerProfile.demographics.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Income Level</Label>
                    <p className="text-sm text-muted-foreground">{customerProfile.demographics.income}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Education</Label>
                    <p className="text-sm text-muted-foreground">{customerProfile.demographics.education}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Psychographics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Psychographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Values</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {customerProfile.psychographics.values.map((value, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Interests</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {customerProfile.psychographics.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Lifestyle</Label>
                    <p className="text-sm text-muted-foreground">{customerProfile.psychographics.lifestyle}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Personality</Label>
                    <p className="text-sm text-muted-foreground">{customerProfile.psychographics.personality}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Pain Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pain Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {customerProfile.painPoints.map((pain, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive mt-1">•</span>
                        {pain}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Motivations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Motivations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {customerProfile.motivations.map((motivation, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {motivation}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {customerProfile.goals.map((goal, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Communication Channels */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Communication Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {customerProfile.communicationChannels.map((channel, index) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Buying Behavior */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buying Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Decision Factors</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customerProfile.buyingBehavior.decisionFactors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Purchase Process</Label>
                    <p className="text-sm text-muted-foreground mt-1">{customerProfile.buyingBehavior.purchaseProcess}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Budget Range</Label>
                    <p className="text-sm text-muted-foreground mt-1">{customerProfile.buyingBehavior.budget}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}