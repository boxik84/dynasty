'use client'

import { useState, useEffect } from 'react'
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    FileText,
    ChevronDown,
    Scale,
    Search,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Info,
    LucideIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

// Define interfaces for the data structure
interface RuleSection {
    id: string
    title: string
    icon: string
}

interface RuleSubcategory {
    id: string
    section_id: string
    title: string
    icon: string
}

interface Rule {
    id: number
    section_id: string
    subcategory_id?: string | null
    content: string
}

// A map to associate string names with Lucide icon components
const iconMap: { [key: string]: LucideIcon } = {
    filetext: FileText,
    scale: Scale,
    // Add other icons as needed, mapping string names to component references
};

const DefaultIcon = FileText; // Fallback icon

export default function PravidlaPage() {
    const [sections, setSections] = useState<RuleSection[]>([]);
    const [subcategories, setSubcategories] = useState<RuleSubcategory[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [activeSection, setActiveSection] = useState('');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/api/rules');
                if (!res.ok) throw new Error('Failed to fetch rules');
                
                const data = await res.json();
                const fetchedSections = data.sections || [];
                const fetchedSubcategories = data.subcategories || [];
                const fetchedRules = data.rules || [];

                setSections(fetchedSections);
                setSubcategories(fetchedSubcategories);
                setRules(fetchedRules);
                
                if (fetchedSections.length > 0) {
                    setActiveSection(fetchedSections[0].id);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Search functionality hotkey
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setSearchOpen((open) => !open);
            }
        }
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const toggleSectionExpansion = (sectionId: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) newSet.delete(sectionId);
            else newSet.add(sectionId);
            return newSet;
        });
    };

    const getIcon = (iconName: string): LucideIcon => {
        if (!iconName) {
            return DefaultIcon;
        }
        return iconMap[iconName.toLowerCase()] || DefaultIcon;
    }

    const getAllRulesForSearch = () => {
        return rules.map(rule => {
            let sectionTitle = sections.find(s => s.id === rule.section_id)?.title || '';
            if (rule.subcategory_id) {
                const sub = subcategories.find(s => s.id === rule.subcategory_id);
                sectionTitle += ` > ${sub?.title || ''}`;
            }
            return {
                text: rule.content,
                sectionId: rule.subcategory_id || rule.section_id,
                sectionTitle: sectionTitle,
            };
        });
    };
    
    const getCurrentSectionData = () => {
        const sub = subcategories.find(s => s.id === activeSection);
        if (sub) return sub;
        return sections.find(s => s.id === activeSection);
    };

    const getRulesForCurrentSection = () => {
         // Check if activeSection is a subcategory
        const isSubcategory = subcategories.some(sub => sub.id === activeSection);
        if (isSubcategory) {
            return rules.filter(rule => rule.subcategory_id === activeSection);
        }
        // It's a main section, get rules that are in this section but not in any of its subcategories
        const subcategoryIds = subcategories.filter(s => s.section_id === activeSection).map(s => s.id);
        return rules.filter(rule => rule.section_id === activeSection && !rule.subcategory_id);
    };

    const getRuleStyle = (ruleText: string) => {
        const text = ruleText.toLowerCase()
        if (text.includes('zakázáno') || text.includes('přísně zakázáno') || text.includes('zákaz')) {
            return { icon: <XCircle className="h-4 w-4" />, type: 'forbidden' }
        }
        if (text.includes('povoleno') || text.includes('lze') || text.includes('můžete')) {
            return { icon: <CheckCircle2 className="h-4 w-4" />, type: 'allowed' }
        }
        if (text.includes('minimální') || text.includes('maximální') || text.includes('musí') || text.includes('povinn')) {
            return { icon: <AlertCircle className="h-4 w-4" />, type: 'important' }
        }
        return { icon: <Info className="h-4 w-4" />, type: 'default' }
    };
    
    const currentSection = getCurrentSectionData();
    const currentRules = getRulesForCurrentSection();

    const RuleDisplay = ({ rule }: { rule: Rule }) => {
        const style = getRuleStyle(rule.content);
        const colorClasses: Record<string, string> = {
            forbidden: "text-red-400 bg-red-500/10",
            allowed: "text-green-400 bg-green-500/10",
            important: "text-orange-400 bg-orange-500/10",
            default: "text-blue-400 bg-blue-500/10"
        }

        return (
            <div className="flex items-start gap-3 py-3 group">
                <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full ${colorClasses[style.type]} mt-1`}>
                    {style.icon}
                </div>
                <div className="flex-1 min-w-0 prose prose-invert prose-sm sm:prose-base prose-p:text-gray-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {rule.content}
                    </ReactMarkdown>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="relative min-h-screen bg-[#0a0a0a] p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-64">
                         <Skeleton className="h-10 w-full mb-4" />
                         <Skeleton className="h-64 w-full" />
                    </aside>
                    <main className="flex-1">
                        <Skeleton className="h-96 w-full" />
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
             <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                 <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[300px] w-[400px] md:h-[400px] md:w-[600px] rounded-full bg-[#b90505]/10 blur-3xl" />
             </div>
 
             <div className="relative z-10 container mx-auto max-w-7xl py-4 sm:py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
                 <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, ease: "easeOut" }}
                     className="space-y-6 sm:space-y-8"
                 >
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6 lg:mb-8">
                         <div className="text-center sm:text-left">
                             <Badge variant="outline" className="border-[#b90505]/60 text-[#bd2727] bg-[#b90505]/10 px-3 sm:px-4 py-1 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur mb-3 sm:mb-4">
                                 <Scale className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                 Retrovax FiveM
                             </Badge>
                             <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">Pravidla Serveru</h1>
                             <p className="text-xs sm:text-sm lg:text-base text-gray-400">Neznalost pravidel není omluva</p>
                         </div>
                         <div>
                             <Button variant="outline" onClick={() => setSearchOpen(true)} className="border-white/20 text-white hover:bg-white/10 gap-2 text-xs sm:text-sm" size="sm">
                                 <Search className="h-4 w-4" />
                                 <span className="hidden sm:inline">Vyhledat pravidla</span>
                                 <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                     <span className="text-xs">⌘</span>K
                                 </kbd>
                             </Button>
                         </div>
                     </div>
 
                     <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                         <motion.aside
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                             className="w-full lg:w-64 flex-shrink-0"
                         >
                             <div className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 rounded-2xl backdrop-blur-md p-3 sm:p-4 lg:p-6 lg:sticky lg:top-24">
                                <nav className="space-y-1">
                                    {sections.map((section) => {
                                        const isParentActive = activeSection === section.id || subcategories.some(sub => sub.id === activeSection && sub.section_id === section.id);
                                        const isExpanded = expandedSections.has(section.id);
                                        const hasSubcategories = subcategories.some(sub => sub.section_id === section.id);
                                        const Icon = getIcon(section.icon);

                                        return (
                                            <div key={section.id}>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setActiveSection(section.id)} className={`group relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border flex-1 text-left ${activeSection === section.id ? "text-[#b90505] bg-[#b90505]/20 border-[#b90505]/40 shadow-lg shadow-[#b90505]/10" : isParentActive ? "text-[#bd2727] bg-[#b90505]/10 border-[#b90505]/30" : "text-gray-300 hover:text-white bg-transparent border-transparent hover:bg-white/5"}`}>
                                                        <Icon className={`w-5 h-5 transition-all duration-200 ${activeSection === section.id ? "text-[#b90505] drop-shadow-[0_0_5px_#b90505]" : isParentActive ? "text-[#bd2727]" : "text-gray-400 group-hover:text-gray-300"}`} />
                                                        <span className="flex-1">{section.title}</span>
                                                        {activeSection === section.id && (<div className="w-2 h-2 rounded-full bg-[#b90505] shadow-[0_0_8px_#b90505]" />)}
                                                    </button>
                                                     {hasSubcategories && (
                                                         <button onClick={() => toggleSectionExpansion(section.id)} className={`p-2 rounded-lg transition-all duration-300 hover:bg-white/10 ${isExpanded ? 'text-[#bd2727]' : 'text-gray-400'}`} aria-label={isExpanded ? "Sbalit" : "Rozbalit"}>
                                                             <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}><ChevronDown className="h-4 w-4" /></motion.div>
                                                         </button>
                                                     )}
                                                </div>
                                                <AnimatePresence>
                                                    {hasSubcategories && isExpanded && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="ml-7 pl-3 border-l-2 border-[#b90505]/20 space-y-1 mt-1 overflow-hidden">
                                                            {subcategories.filter(sub => sub.section_id === section.id).map((sub, index) => {
                                                                const SubIcon = getIcon(sub.icon);
                                                                const isSubActive = activeSection === sub.id;
                                                                return (
                                                                    <motion.button key={sub.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05, duration: 0.2 }} onClick={() => setActiveSection(sub.id)} className={`w-full group relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border text-left ${isSubActive ? "text-[#b90505] bg-[#b90505]/20 border-[#b90505]/40 shadow-lg shadow-[#b90505]/10" : "text-gray-400 hover:text-gray-200 bg-transparent border-transparent hover:bg-white/5"}`}>
                                                                        <SubIcon className={`w-4 h-4 transition-all duration-200 ${isSubActive ? "text-[#b90505] drop-shadow-[0_0_5px_#b90505]" : "text-gray-500 group-hover:text-gray-400"}`} />
                                                                        <span className="flex-1">{sub.title}</span>
                                                                        {isSubActive && (<div className="w-1.5 h-1.5 rounded-full bg-[#b90505] shadow-[0_0_6px_#b90505]" />)}
                                                                    </motion.button>
                                                                );
                                                            })}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                 </nav>
                             </div>
                         </motion.aside>
 
                         <motion.main
                             key={activeSection}
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ duration: 0.4, ease: "easeOut" }}
                             className="flex-1"
                         >
                             {currentSection && (
                                <div className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 rounded-2xl backdrop-blur-md p-4 sm:p-6 lg:p-8">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                        <div className="p-2 rounded-lg bg-[#b90505]/20 text-[#bd2727]">
                                            {React.createElement(getIcon(currentSection.icon), { className: "h-4 w-4" })}
                                        </div>
                                        <div>
                                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                                                {currentSection.title}
                                            </h1>
                                            {/* Počet pravidel bude dynamický níže */}
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        {/* Pokud je aktivní podkategorie, zobraz jen její pravidla */}
                                        {subcategories.some(sub => sub.id === activeSection) ? (
                                            <div className="space-y-4">
                                                {getRulesForCurrentSection().map((rule) => <RuleDisplay key={rule.id} rule={rule} />)}
                                            </div>
                                        ) : (
                                            <>
                                                {/* Pravidla přímo v sekci (bez podkategorie) */}
                                                {getRulesForCurrentSection().length > 0 && (
                                                    <div className="mb-8">
                                                        <h2 className="text-lg font-semibold text-white mb-2">Obecná pravidla</h2>
                                                        <div className="space-y-4">
                                                            {getRulesForCurrentSection().map((rule) => <RuleDisplay key={rule.id} rule={rule} />)}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Všechny podkategorie této sekce */}
                                                {subcategories.filter(sub => sub.section_id === activeSection).map((sub) => {
                                                    const subRules = rules.filter(rule => rule.subcategory_id === sub.id);
                                                    if (subRules.length === 0) return null;
                                                    const SubIcon = getIcon(sub.icon);
                                                    return (
                                                        <div key={sub.id} className="mb-8">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <SubIcon className="h-4 w-4 text-[#b90505]" />
                                                                <h3 className="text-md font-semibold text-white">{sub.title}</h3>
                                                            </div>
                                                            <div className="space-y-4">
                                                                {subRules.map((rule) => <RuleDisplay key={rule.id} rule={rule} />)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                </div>
                             )}
                         </motion.main>
                     </div>
                 </motion.div>
             </div>
 
             <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
                 <div className="bg-gradient-to-br from-[#131618] via-[#151a1c] to-[#111b22] border border-white/10">
                     <Command className="bg-transparent">
                         <CommandInput placeholder="Vyhledat pravidla..." className="border-0 border-b border-white/10 bg-transparent text-white placeholder-gray-400 focus:ring-0" />
                         <CommandList className="bg-transparent">
                             <CommandEmpty className="text-gray-400 p-6 text-center">Žádná pravidla nenalezena.</CommandEmpty>
                             <CommandGroup heading={<span className="text-gray-400">Pravidla</span>} className="text-white [&_[cmdk-group-heading]]:p-2 [&_[cmdk-group-heading]]:font-semibold">
                                 {getAllRulesForSearch().map((rule, index) => (
                                     <CommandItem
                                         key={index}
                                         value={rule.text}
                                         onSelect={() => {
                                             setActiveSection(rule.sectionId);
                                             setSearchOpen(false);
                                         }}
                                         className="flex flex-col items-start gap-2 p-4 text-white rounded-lg hover:bg-white/10 data-[selected=true]:bg-white/5 cursor-pointer"
                                     >
                                         <div className="text-xs text-gray-400">{rule.sectionTitle}</div>
                                         <div className="text-sm line-clamp-2">{rule.text}</div>
                                     </CommandItem>
                                 ))}
                             </CommandGroup>
                         </CommandList>
                     </Command>
                 </div>
             </CommandDialog>
        </div>
    )} 
