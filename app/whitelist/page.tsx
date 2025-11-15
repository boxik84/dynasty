"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertCircle, User, Clock, Ban, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface WhitelistQuestion {
  id: number
  question: string
  field_name: string
  field_type: 'text' | 'textarea' | 'number' | 'checkbox' | 'url' | 'select'
  placeholder?: string
  required: boolean
  category: string
  options?: string[]
  min_value?: number
  max_value?: number
  min_length?: number
  max_length?: number
  order_index: number
}

interface UserData {
  discordId: string;
  username: string;
  roles: string[];
  hasWhitelist: boolean;
}

const categoryLabels = {
  basic: 'Základní informace',
  motivation: 'Motivace',
  roleplay: 'Roleplay znalosti',
  rules_basic: 'Pravidla - základní pojmy',
  rules_advanced: 'Pravidla - pokročilé',
  specific_rules: 'Specifická pravidla',
  scenarios: 'Praktické scénáře',
  agreement: 'Souhlas s pravidly',
  general: 'Obecné otázky'
}

export default function WhitelistPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [questions, setQuestions] = useState<WhitelistQuestion[]>([]);
  const [categories, setCategories] = useState<Record<string, WhitelistQuestion[]>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState<{
    totalAttempts: number;
    remainingAttempts: number;
    maxAttempts: number;
  } | null>(null);

  useEffect(() => {
    const initializeForm = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("/api/user/me", { cache: "no-store" });
        const userData = await userRes.json();

        if (!userData?.discordId) {
          router.push("/sign-in");
          return;
        }

        setUser(userData);

        // Fetch whitelist questions
        const questionsRes = await fetch("/api/whitelist-questions");
        const questionsData = await questionsRes.json();

        if (questionsRes.ok) {
          setQuestions(questionsData.questions || []);
          setCategories(questionsData.categories || {});
          
          // Initialize form data with default values
          const initialFormData: Record<string, any> = {};
          questionsData.questions.forEach((question: WhitelistQuestion) => {
            if (question.field_type === 'checkbox') {
              initialFormData[question.field_name] = false;
            } else if (question.field_type === 'number') {
              initialFormData[question.field_name] = '';
        } else {
              initialFormData[question.field_name] = '';
            }
          });
          
          // Set username for discord field if available
          if (userData.username) {
            initialFormData['discordName'] = userData.username;
          }
          
          setFormData(initialFormData);
        }
        
        // Fetch attempts info
          const attemptsRes = await fetch("/api/user/whitelist-requests");
          const attemptsData = await attemptsRes.json();
          
          if (attemptsRes.ok) {
            setAttemptInfo({
              totalAttempts: attemptsData.totalAttempts,
              remainingAttempts: attemptsData.remainingAttempts,
              maxAttempts: attemptsData.maxAttempts
            });
            setHasActiveRequest(!!attemptsData.activeRequest);
        }
      } catch (error) {
        console.error("Chyba při načítání formuláře:", error);
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    initializeForm();
  }, [router]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setHasActiveRequest(true);
        
        if (data.totalAttempts && data.remainingAttempts !== undefined) {
          setAttemptInfo({
            totalAttempts: data.totalAttempts,
            remainingAttempts: data.remainingAttempts,
            maxAttempts: data.maxAttempts || 3
          });
        }
        
        toast.success('Žádost byla úspěšně odeslána!', {
          description: `Zbývá vám ${data.remainingAttempts || 'neznámý počet'} pokusů. Budete informováni o výsledku prostřednictvím Discordu.`,
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Došlo k chybě při odesílání žádosti');
        
        if (data.error?.includes('maximálního počtu pokusů')) {
          toast.error('Dosáhli jste limitu pokusů', {
            description: 'Vyčerpali jste všechny 3 pokusy na whitelist žádost.',
          });
        } else {
          toast.error('Chyba při odesílání žádosti', {
            description: data.error || 'Došlo k neočekávané chybě',
          });
        }
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Došlo k chybě při odesílání žádosti');
      toast.error('Chyba při odesílání žádosti', {
        description: 'Došlo k neočekávané chybě',
      });
      console.error('Error submitting whitelist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (question: WhitelistQuestion) => {
    const value = formData[question.field_name] || '';
    
    switch (question.field_type) {
      case 'text':
      case 'url':
        return (
          <Input
            id={question.field_name}
            name={question.field_name}
            type={question.field_type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => handleInputChange(question.field_name, e.target.value)}
            required={question.required}
            placeholder={question.placeholder}
            minLength={question.min_length}
            maxLength={question.max_length}
            className="bg-white/5 border-white/10 text-foreground dark:text-white"
          />
        );
      
      case 'number':
        return (
          <Input
            id={question.field_name}
            name={question.field_name}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(question.field_name, e.target.value)}
            required={question.required}
            placeholder={question.placeholder}
            min={question.min_value}
            max={question.max_value}
            className="bg-white/5 border-white/10 text-foreground dark:text-white"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            id={question.field_name}
            name={question.field_name}
            value={value}
            onChange={(e) => handleInputChange(question.field_name, e.target.value)}
            required={question.required}
            placeholder={question.placeholder}
            minLength={question.min_length}
            maxLength={question.max_length}
            rows={question.min_length && question.min_length > 50 ? 4 : 3}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-foreground dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b90505]/50 focus:border-transparent resize-none"
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={question.field_name}
              checked={!!value}
              onCheckedChange={(checked) => handleInputChange(question.field_name, !!checked)}
              required={question.required}
            />
            <Label htmlFor={question.field_name} className="text-foreground dark:text-white text-sm">
              {question.question}
            </Label>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="pointer-events-none absolute left-1/2 top-1/4 z-0 -translate-x-1/2">
          <div className="h-[400px] w-[600px] rounded-full bg-[#b90505]/10 blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-2xl mx-auto p-4 sm:p-6">
          <Skeleton className="h-8 w-48 mb-8 bg-white/5" />
          <Skeleton className="w-full h-96 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const WAITING_ROLE = process.env.DISCORD_WAITING_ROLE_ID!;
  const BLACKLISTED_ROLE = process.env.DISCORD_BLACKLISTED_ROLE_ID!;

  const isBlacklisted = user.roles.includes(BLACKLISTED_ROLE);
  const isWaiting = user.roles.includes(WAITING_ROLE);
  const hasWhitelist = user.hasWhitelist;

  if (isBlacklisted) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="pointer-events-none absolute left-1/2 top-1/4 z-0 -translate-x-1/2">
          <div className="h-[400px] w-[600px] rounded-full bg-red-500/10 blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-md mx-auto p-4">
          <Card className="bg-gradient-to-br from-red-950/50 via-red-900/50 to-red-950/50 border-red-500/30">
            <CardHeader className="text-center">
              <Ban className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-400">Přístup zamítnut</CardTitle>
              <CardDescription className="text-red-300">
                Váš účet je na blacklistu a nemůžete podat žádost o whitelist.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (hasWhitelist) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="pointer-events-none absolute left-1/2 top-1/4 z-0 -translate-x-1/2">
          <div className="h-[400px] w-[600px] rounded-full bg-green-500/10 blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-md mx-auto p-4">
          <Card className="bg-gradient-to-br from-green-950/50 via-green-900/50 to-green-950/50 border-green-500/30">
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-green-400">Whitelist aktivní</CardTitle>
              <CardDescription className="text-green-300">
                Již máte aktivní whitelist a můžete se připojit na server.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-green-600 hover:bg-green-700"
              >
                Přejít do dashboardu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isWaiting || hasActiveRequest) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="pointer-events-none absolute left-1/2 top-1/4 z-0 -translate-x-1/2">
          <div className="h-[400px] w-[600px] rounded-full bg-yellow-500/10 blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-md mx-auto p-4">
          <Card className="bg-gradient-to-br from-yellow-950/50 via-yellow-900/50 to-yellow-950/50 border-yellow-500/30">
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle className="text-yellow-400">Čeká na schválení</CardTitle>
              <CardDescription className="text-yellow-300">
                Vaše žádost o whitelist čeká na schválení administrátory.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a]">
      
      <div className="pointer-events-none absolute left-1/3 top-1/4 z-0">
        <div className="h-[600px] w-[800px] rounded-full bg-[#b90505]/8 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute right-1/4 bottom-1/3 z-0">
        <div className="h-[400px] w-[600px] rounded-full bg-[#b90505]/5 blur-3xl" />
      </div>

              <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-2xl">
        
          {attemptInfo && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-br from-blue-950/30 via-blue-900/30 to-blue-950/30 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informace o pokusech
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-300">
                        {attemptInfo.totalAttempts} / {attemptInfo.maxAttempts}
                      </div>
                      <p className="text-blue-200 text-sm">Využité pokusy</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-300">
                        {attemptInfo.remainingAttempts}
                      </div>
                      <p className="text-green-200 text-sm">Zbývající pokusy</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-300">
                        {hasActiveRequest ? 'Ano' : 'Ne'}
                      </div>
                      <p className="text-yellow-200 text-sm">Aktivní žádost</p>
                    </div>
                  </div>
                  {attemptInfo.remainingAttempts === 0 && (
                    <div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-lg">
                      <p className="text-red-300 text-sm">
                        ⚠️ Vyčerpali jste všechny pokusy na whitelist žádost. Nemůžete podat další žádost.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-white">Whitelist formulář</CardTitle>
                <CardDescription>
                Všechna pole jsou povinná. Odpovězte podle pravidel serveru dostupných na{' '}
                <Link href="https://retrovax-pravidla.gitbook.io/retrovax-fivem-pravidla" target="_blank" rel="noopener noreferrer" className="text-[#b90505] hover:text-[#d40606] underline">
                  retrovax-pravidla.gitbook.io
                </Link>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="space-y-8"
                >
                
                <div className="text-center mb-8">
                  <Badge
                    variant="outline"
                    className="border-[#b90505]/60 text-[#bd2727] bg-[#b90505]/10 px-4 py-1 font-semibold tracking-wide backdrop-blur flex gap-2 mx-auto w-fit mb-4"
                  >
                    <User className="h-4 w-4 text-[#bd2727] drop-shadow-[0_0_5px_#bd2727]" />
                    {user.username}
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white mb-4">Žádost o Whitelist</h1>
                  <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto">
                    Vyplňte formulář níže pro získání přístupu na náš roleplay server
                  </p>
                </div>

                
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-950/50 border border-green-500/30 rounded-lg p-4 text-center"
                  >
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-400 font-medium">Žádost byla úspěšně odeslána!</p>
                    <p className="text-green-300 text-sm mt-1">
                      Budete informováni o výsledku prostřednictvím Discordu.
                    </p>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-950/50 border border-red-500/30 rounded-lg p-4 text-center"
                  >
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-400 font-medium">Chyba při odesílání</p>
                    <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
                  </motion.div>
                )}

                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {Object.entries(categories).map(([categoryKey, categoryQuestions]) => (
                    <div key={categoryKey} className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground dark:text-white border-b border-white/10 pb-2">
                        {categoryLabels[categoryKey as keyof typeof categoryLabels] || categoryKey}
                      </h3>
                      
                      {categoryQuestions.map((question) => (
                        <div key={question.id} className="space-y-2">
                          {question.field_type !== 'checkbox' && (
                            <Label htmlFor={question.field_name} className="text-foreground dark:text-white">
                              {question.question}
                              {question.required && <span className="text-red-400 ml-1">*</span>}
                      </Label>
                          )}
                          {renderField(question)}
                    </div>
                      ))}
                    </div>
                  ))}

                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="pt-6"
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting || attemptInfo?.remainingAttempts === 0}
                      className="w-full bg-gradient-to-r from-[#b90505] to-[#d40606] hover:from-[#a00404] hover:to-[#b90505] text-foreground dark:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#b90505]/25 hover:shadow-[#b90505]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Odesílání...
                        </div>
                      ) : (
                        'Odeslat žádost'
                      )}
                  </Button>
                    
                    {attemptInfo?.remainingAttempts === 0 && (
                      <p className="text-red-400 text-sm text-center mt-2">
                        Vyčerpali jste všechny pokusy na whitelist žádost
                      </p>
                    )}
                  </motion.div>
                </form>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }