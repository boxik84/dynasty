'use client'

import { motion, useScroll } from "framer-motion"
import { useState, useEffect } from "react"
import { Eye, Database, Share2, Lock, Bell, Cookie, Users, Clock, CheckCircle, Activity, User, Globe, Mail, MessageCircle, Shield, ArrowUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPage() {
    const { scrollYProgress } = useScroll();
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sections = [
        {
            icon: Database,
            title: "Shromažďování dat",
            description: "Jaké informace o vás sbíráme a proč",
            content: "Shromažďujeme pouze nezbytné informace pro fungování našich služeb, včetně Discord ID, uživatelského jména a herních dat. Vaše data používáme výhradně pro poskytování herních služeb a podporu komunity.",
            color: "from-blue-500 to-blue-600",
            iconColor: "text-blue-400",
            emoji: "📊"
        },
        {
            icon: Lock,
            title: "Zabezpečení dat",
            description: "Jak chráníme vaše osobní informace",
            content: "Používáme pokročilé šifrovací technologie a bezpečnostní protokoly. Všechna data jsou uložena na zabezpečených serverech s omezeným přístupem pouze pro autorizované členy týmu.",
            color: "from-green-500 to-green-600",
            iconColor: "text-green-400",
            emoji: "🔒"
        },
        {
            icon: Share2,
            title: "Sdílení dat",
            description: "S kým a proč sdílíme vaše informace",
            content: "Vaše data nesdílíme s třetími stranami pro komerční účely. Sdílení probíhá pouze v případě právních požadavků nebo pro zajištění bezpečnosti komunity.",
            color: "from-purple-500 to-purple-600",
            iconColor: "text-purple-400",
            emoji: "🤝"
        },
        {
            icon: Eye,
            title: "Vaše práva",
            description: "Máte kontrolu nad svými daty",
            content: "Máte právo na přístup, opravu nebo smazání svých osobních dat. Kontaktujte nás prostřednictvím Discordu pro jakékoli požadavky týkající se vašich dat.",
            color: "from-orange-500 to-orange-600",
            iconColor: "text-orange-400",
            emoji: "👁️"
        },
        {
            icon: Cookie,
            title: "Cookies a tracking",
            description: "Jak používáme cookies na našem webu",
            content: "Používáme pouze nezbytné cookies pro základní funkčnost webu a autentifikaci. Nepoužíváme žádné tracking cookies třetích stran pro reklamní účely.",
            color: "from-[#b90505] to-[#bd2727]",
            iconColor: "text-[#bd2727]",
            emoji: "🍪"
        },
        {
            icon: Bell,
            title: "Oznámení a komunikace",
            description: "Jak s vámi komunikujeme",
            content: "Kontaktujeme vás pouze prostřednictvím Discordu pro důležité oznámení týkající se serveru nebo vašeho účtu. Spam ani reklamní zprávy neposíláme.",
            color: "from-red-500 to-red-600",
            iconColor: "text-red-400",
            emoji: "🔔"
        }
    ]

    const additionalSections = [
        {
            icon: User,
            title: "Právní základy",
            description: "Plnění smlouvy, oprávněný zájem, souhlas a právní povinnosti podle GDPR a českých zákonů.",
            color: "from-blue-500 to-blue-600",
            iconColor: "text-blue-400"
        },
        {
            icon: Clock,
            title: "Doba uchovávání",
            description: "Údaje uchováváme po dobu nezbytnou k plnění účelu, obvykle minimálně 3 roky od poslední aktivity.",
            color: "from-green-500 to-green-600",
            iconColor: "text-green-400"
        },
        {
            icon: Globe,
            title: "Změny zásad",
            description: "Tyto zásady můžeme aktualizovat. O změnách vás informujeme na webu nebo prostřednictvím Discordu.",
            color: "from-purple-500 to-purple-600",
            iconColor: "text-purple-400"
        }
    ]

    const dataTypes = [
        { type: "Discord údaje", description: "ID, username, avatar", icon: "💬", priority: "essential" },
        { type: "Herní data", description: "Postavy, progress, statistiky", icon: "🎮", priority: "functional" },
        { type: "Technické údaje", description: "IP adresa, browser info", icon: "⚙️", priority: "functional" },
        { type: "Komunikace", description: "Zprávy na Discordu", icon: "📨", priority: "functional" }
    ]

    return (
        <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a] overflow-hidden">
            
            <motion.div 
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b90505] to-[#bd2727] z-50 origin-left"
                style={{ scaleX: scrollYProgress }}
            />

            
            <div className="absolute inset-0 pointer-events-none">
                
                <div className="absolute inset-0 bg-[linear-gradient(rgba(185,5,5,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(185,5,5,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
                
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#b90505]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-[#bd2727]/5 rounded-full blur-3xl" />
                
                
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#b90505]/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -120, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 12 + Math.random() * 6,
                            repeat: Infinity,
                            delay: Math.random() * 8,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto py-20 max-w-7xl">
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <div className="flex justify-center mb-8">
                            <Badge className="bg-[#b90505]/20 border-[#b90505]/40 text-[#bd2727] px-6 py-3 text-lg font-bold backdrop-blur-xl">
                                <Activity className="w-5 h-5 mr-2" />
                                Ochrana soukromí
                            </Badge>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black text-foreground dark:text-white mb-8 leading-tight">
                            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                                Zásady ochrany osobních údajů
                            </span>
                        </h1>
                        
                        <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                            Transparentnost a ochrana vašich dat je naší prioritou. Přečtěte si, jak nakládáme s vašimi informacemi a jak chráníme vaše soukromí na serveru{" "}
                            <span className="text-[#bd2727] font-bold">Retrovax FiveM</span>.
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/20 border border-green-500/40 backdrop-blur-xl">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-green-300 font-medium">GDPR kompatibilní</span>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-blue-500/20 border border-blue-500/40 backdrop-blur-xl">
                                <Clock className="w-5 h-5 text-blue-400" />
                                <span className="text-blue-300 font-medium">Aktualizováno 15. ledna 2025</span>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#b90505]/20 border border-[#b90505]/40 backdrop-blur-xl">
                                <Shield className="w-5 h-5 text-[#bd2727]" />
                                <span className="text-[#bd2727] font-medium">Bezpečné zpracování</span>
                            </div>
                        </div>
                    </motion.div>

                    
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mb-20"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {sections.map((section, index) => {
                                const Icon = section.icon
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 * index }}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        className="group"
                                    >
                                        <Card className="h-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 rounded-3xl overflow-hidden group-hover:bg-white/10">
                                            
                                            <div className={`h-1 bg-gradient-to-r ${section.color}`} />
                                            
                                            <CardHeader className="p-8">
                                                <div className="flex items-start gap-6">
                                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${section.color}/20 border border-white/20 backdrop-blur-sm relative`}>
                                                        <Icon className={`w-8 h-8 ${section.iconColor}`} />
                                                        <span className="absolute -top-2 -right-2 text-lg">{section.emoji}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-2xl font-bold text-foreground dark:text-white mb-3 group-hover:text-gray-100 transition-colors">
                                                            {section.title}
                                                        </CardTitle>
                                                        <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
                                                            {section.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            
                                            <CardContent className="px-8 pb-8">
                                                <p className="text-gray-300 leading-relaxed text-lg group-hover:text-gray-200 transition-colors">
                                                    {section.content}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.section>

                    
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mb-20"
                    >
                        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
                            
                            <CardHeader className="p-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30">
                                        <Database className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-foreground dark:text-white">
                                        Typy shromažďovaných dat
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-8 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {dataTypes.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + (index * 0.1) }}
                                            whileHover={{ scale: 1.02 }}
                                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                                        >
                                            <div className="flex items-start gap-4">
                                                <span className="text-3xl">{item.icon}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-bold text-foreground dark:text-white text-lg">
                                                            {item.type}
                                                        </h4>
                                                        <Badge className={`text-xs ${
                                                            item.priority === 'essential' 
                                                                ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                                                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                                        }`}>
                                                            {item.priority === 'essential' ? 'Nezbytné' : 'Funkční'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-gray-300 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.section>

                    
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mb-20"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {additionalSections.map((section, index) => {
                                const Icon = section.icon
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
                                        whileHover={{ scale: 1.03, y: -10 }}
                                    >
                                        <Card className="h-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 rounded-3xl overflow-hidden group">
                                            <div className={`h-1 bg-gradient-to-r ${section.color}`} />
                                            
                                            <CardHeader className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color}/20 border border-white/20`}>
                                                        <Icon className={`w-6 h-6 ${section.iconColor}`} />
                                                    </div>
                                                    <CardTitle className="text-xl font-bold text-foreground dark:text-white group-hover:text-gray-100 transition-colors">
                                                        {section.title}
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            
                                            <CardContent className="p-6 pt-0">
                                                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                                                    {section.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.section>

                    
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mb-20"
                    >
                        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-[#b90505] to-[#bd2727]" />
                            
                            <CardHeader className="p-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-[#b90505]/20 border border-[#b90505]/30">
                                        <Mail className="w-8 h-8 text-[#bd2727]" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-foreground dark:text-white">
                                        Kontakt pro otázky ohledně soukromí
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-8 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xl font-bold text-foreground dark:text-white">Vaše práva podle GDPR</h4>
                                        <ul className="space-y-3 text-gray-300">
                                            <li className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                Právo na přístup k vašim datům
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                Právo na opravu nesprávných údajů
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                Právo na výmaz dat
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                Právo na přenositelnost dat
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xl font-bold text-foreground dark:text-white">Jak nás kontaktovat</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                                                <MessageCircle className="w-6 h-6 text-blue-400" />
                                                <div>
                                                    <p className="font-medium text-foreground dark:text-white">Discord Server</p>
                                                    <p className="text-sm text-gray-400">Nejrychlejší způsob kontaktu</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                                                <Mail className="w-6 h-6 text-green-400" />
                                                <div>
                                                    <p className="font-medium text-foreground dark:text-white">Email</p>
                                                    <p className="text-sm text-gray-400">tobiasvolny@icloud.com</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.section>

                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="text-center"
                    >
                        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                            <div className="space-y-4">
                                <p className="text-xl text-gray-300 font-medium">
                                    Poslední aktualizace: 15. ledna 2025
                                </p>
                                <p className="text-gray-400">
                                    Tyto zásady ochrany osobních údajů jsou platné pro server{" "}
                                    <span className="text-[#bd2727] font-semibold">Retrovax FiveM</span>
                                </p>
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <Shield className="w-5 h-5 text-green-400" />
                                    <span className="text-green-400 font-medium">Certifikováno pro GDPR compliance</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>

            
            <motion.div
                className="fixed bottom-8 right-8 z-50"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                    opacity: showBackToTop ? 1 : 0, 
                    scale: showBackToTop ? 1 : 0 
                }}
                transition={{ duration: 0.3 }}
            >
                <Button
                    onClick={scrollToTop}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-[#b90505]/20 hover:bg-[#b90505]/30 border-2 border-[#b90505]/40 hover:border-[#b90505]/60 backdrop-blur-xl shadow-xl transition-all duration-300"
                >
                    <ArrowUp className="w-6 h-6 text-[#bd2727]" />
                </Button>
            </motion.div>
        </div>
    )
}
