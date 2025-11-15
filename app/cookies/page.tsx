"use client";

import { motion, useScroll } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Cookie, Globe, SlidersHorizontal, User, CheckCircle, ArrowUp, Settings, Eye, Clock, Mail, Info } from "lucide-react";
import Link from "next/link";

export default function CookiesInfoPage() {
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

    const cookieTypes = [
        {
            icon: Shield,
            title: "Nezbytné cookies",
            description: "Základní funkce webu",
            content: "Tyto cookies jsou nutné pro správné fungování webu a nelze je vypnout v našich systémech. Zajišťují například bezpečnost, správné zobrazení stránek a ukládání vašeho souhlasu.",
            color: "from-red-500 to-red-600",
            iconColor: "text-red-400",
            emoji: "🔒",
            essential: true
        },
        {
            icon: Globe,
            title: "Analytické cookies",
            description: "Měření návštěvnosti",
            content: "Pomáhají nám rozumět, jak návštěvníci používají náš web. Díky nim můžeme stránky neustále vylepšovat. Údaje jsou zpracovány anonymně a neidentifikují konkrétní uživatele.",
            color: "from-blue-500 to-blue-600",
            iconColor: "text-blue-400",
            emoji: "📊",
            essential: false
        },
        {
            icon: User,
            title: "Personalizační cookies",
            description: "Přizpůsobení uživatelské zkušenosti",
            content: "Umožňují si zapamatovat vaše volby na stránce (např. jazyk, téma, přihlášení) a zajišťují pohodlnější a rychlejší uživatelskou zkušenost při opakovaných návštěvách.",
            color: "from-green-500 to-green-600",
            iconColor: "text-green-400",
            emoji: "👤",
            essential: false
        },
        {
            icon: SlidersHorizontal,
            title: "Marketingové cookies",
            description: "Personalizovaná reklama",
            content: "Tyto cookies mohou být nastaveny reklamními partnery k zobrazení relevantní reklamy na základě vašich zájmů. Nesou osobní údaje pouze tehdy, pokud je sami sdělíte.",
            color: "from-purple-500 to-purple-600",
            iconColor: "text-purple-400",
            emoji: "🎯",
            essential: false
        }
    ];

    const userRights = [
        { right: "Změna nebo odvolání souhlasu kdykoliv v nastavení prohlížeče", icon: "⚙️" },
        { right: "Právo na informace o zpracovávaných osobních údajích", icon: "ℹ️" },
        { right: "Právo na opravu nesprávných nebo neúplných údajů", icon: "✏️" },
        { right: "Právo na výmaz osobních údajů (právo být zapomenut)", icon: "🗑️" },
        { right: "Právo na omezení zpracování osobních údajů", icon: "⏸️" },
        { right: "Právo na přenositelnost údajů", icon: "📦" }
    ];

    const cookieCategories = [
        { category: "Autentifikace", description: "Udržení přihlášení uživatele", duration: "Relace", type: "Nezbytné" },
        { category: "Bezpečnost", description: "Ochrana před CSRF útoky", duration: "24 hodin", type: "Nezbytné" },
        { category: "Preference", description: "Uložení jazykových a UI preferencí", duration: "30 dní", type: "Funkční" },
        { category: "Analytika", description: "Google Analytics měření návštěvnosti", duration: "2 roky", type: "Analytické" }
    ];

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
            
            <motion.div 
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b90505] to-[#bd2727] z-50 origin-left"
                style={{ scaleX: scrollYProgress }}
            />

            
            <div className="absolute inset-0 pointer-events-none">
                
                <div className="absolute inset-0 bg-[linear-gradient(rgba(185,5,5,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(185,5,5,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
                
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#b90505]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-[#bd2727]/5 rounded-full blur-3xl" />
                
                
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#b90505]/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 8 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 6,
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
                                <Cookie className="w-5 h-5 mr-2" />
                                Informace o cookies
                            </Badge>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
                            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                                Cookies & soukromí
                            </span>
                        </h1>
                        
                        <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                            Používáme cookies pro zajištění správného fungování webu a zlepšení vaší uživatelské zkušenosti na serveru{" "}
                            <span className="text-[#bd2727] font-bold">Retrovax FiveM</span>. 
                            Zde najdete veškeré informace o tom, jak s nimi nakládáme.
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/20 border border-green-500/40 backdrop-blur-xl">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-green-300 font-medium">GDPR kompatibilní</span>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-blue-500/20 border border-blue-500/40 backdrop-blur-xl">
                                <Eye className="w-5 h-5 text-blue-400" />
                                <span className="text-blue-300 font-medium">Transparentní zpracování</span>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#b90505]/20 border border-[#b90505]/40 backdrop-blur-xl">
                                <Settings className="w-5 h-5 text-[#bd2727]" />
                                <span className="text-[#bd2727] font-medium">Kontrola nad daty</span>
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
                            {cookieTypes.map((cookie, index) => {
                                const Icon = cookie.icon;
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
                                            
                                            <div className={`h-1 bg-gradient-to-r ${cookie.color}`} />
                                            
                                            <CardHeader className="p-8">
                                                <div className="flex items-start gap-6">
                                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${cookie.color}/20 border border-white/20 backdrop-blur-sm relative`}>
                                                        <Icon className={`w-8 h-8 ${cookie.iconColor}`} />
                                                        <span className="absolute -top-2 -right-2 text-lg">{cookie.emoji}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <CardTitle className="text-2xl font-bold text-white group-hover:text-gray-100 transition-colors">
                                                                {cookie.title}
                                                            </CardTitle>
                                                            {cookie.essential && (
                                                                <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs">
                                                                    Povinné
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
                                                            {cookie.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            
                                            <CardContent className="px-8 pb-8">
                                                <p className="text-gray-300 leading-relaxed text-lg group-hover:text-gray-200 transition-colors">
                                                    {cookie.content}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
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
                            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-600" />
                            
                            <CardHeader className="p-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-orange-500/20 border border-orange-500/30">
                                        <Info className="w-8 h-8 text-orange-400" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-white">
                                        Detailní přehled cookies
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-8 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {cookieCategories.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + (index * 0.1) }}
                                            whileHover={{ scale: 1.02 }}
                                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-white text-lg">
                                                        {item.category}
                                                    </h4>
                                                    <Badge className={`text-xs ${
                                                        item.type === 'Nezbytné' 
                                                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                                            : item.type === 'Funkční'
                                                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                                            : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                                    }`}>
                                                        {item.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-300 leading-relaxed">
                                                    {item.description}
                                                </p>
                                                <div className="flex items-center justify-between text-sm text-gray-400">
                                                    <span>Doba platnosti:</span>
                                                    <span className="font-medium text-gray-300">{item.duration}</span>
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
                        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-green-500 to-green-600" />
                            
                            <CardHeader className="p-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-green-500/20 border border-green-500/30">
                                        <Shield className="w-8 h-8 text-green-400" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-white">
                                        Vaše práva & možnosti kontroly
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-8 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {userRights.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + (index * 0.1) }}
                                            whileHover={{ scale: 1.01, x: 10 }}
                                            className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                                        >
                                            <span className="text-2xl">{item.icon}</span>
                                            <p className="text-gray-300 leading-relaxed text-lg">
                                                {item.right}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.section>

                    
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mb-20"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-[#b90505] to-[#bd2727]" />
                                
                                <CardHeader className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-[#b90505]/20 border border-[#b90505]/30">
                                            <Mail className="w-6 h-6 text-[#bd2727]" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-white">
                                            Kontakt pro ochranu údajů
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-6 pt-0">
                                    <div className="space-y-4">
                                        <p className="text-gray-300 leading-relaxed">
                                            Pro jakékoli dotazy ohledně cookies a ochrany osobních údajů nás kontaktujte:
                                        </p>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-[#bd2727]" />
                                                <div>
                                                    <p className="font-medium text-white">Email</p>
                                                    <a 
                                                        href="mailto:tobiasvolny@icloud.com"
                                                        className="text-[#bd2727] hover:text-red-400 transition-colors"
                                                    >
                                                        tobiasvolny@icloud.com
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            Odpovídáme do 48 hodin
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            
                            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                                
                                <CardHeader className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                                            <Settings className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-white">
                                            Nastavení v prohlížeči
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-6 pt-0">
                                    <div className="space-y-4">
                                        <p className="text-gray-300 leading-relaxed">
                                            Cookies můžete spravovat přímo v nastavení vašeho prohlížeče:
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                                <span className="text-lg">🌐</span>
                                                <span className="text-gray-300">Chrome: Nastavení → Soukromí → Cookies</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                                <span className="text-lg">🦊</span>
                                                <span className="text-gray-300">Firefox: Možnosti → Soukromí → Cookies</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                                <span className="text-lg">🧭</span>
                                                <span className="text-gray-300">Safari: Předvolby → Soukromí</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
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
                                    Poslední aktualizace: {new Date().toLocaleDateString("cs-CZ")}
                                </p>
                                <p className="text-gray-400">
                                    Tato stránka popisuje používání cookies na webu serveru{" "}
                                    <span className="text-[#bd2727] font-semibold">Retrovax FiveM</span>
                                </p>
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <Cookie className="w-5 h-5 text-[#bd2727]" />
                                    <span className="text-[#bd2727] font-medium">Transparentní používání cookies</span>
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
    );
}