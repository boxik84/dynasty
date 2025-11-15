"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Plus,
  FileText,
  AlertCircle,
  List,
  Settings,
  Users,
  MessageSquare,
  Shield,
  BookOpen,
  CheckCircle2,
  Hash,
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// TypeScript Interfaces
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
  is_active: boolean
  created_at: string
  updated_at: string
}

// Data
const fieldTypeLabels: { [key in WhitelistQuestion['field_type']]: string } = {
  text: 'Krátký text',
  textarea: 'Dlouhý text',
  number: 'Číslo',
  checkbox: 'Zaškrtávací pole',
  url: 'URL odkaz',
  select: 'Výběr z možností'
}

const categoryConfig: { [key: string]: { label: string, icon: React.ElementType, description: string } } = {
  basic: { label: 'Základní informace', icon: Users, description: 'Jméno, věk, Discord...' },
  motivation: { label: 'Motivace', icon: MessageSquare, description: 'Proč u nás chcete hrát?' },
  roleplay: { label: 'Roleplay', icon: BookOpen, description: 'Pojmy, zkušenosti...' },
  rules_basic: { label: 'Základní pravidla', icon: Shield, description: 'Nejčastější prohřešky.' },
  rules_advanced: { label: 'Pokročilá pravidla', icon: Settings, description: 'Komplexnější pravidla.' },
  specific_rules: { label: 'Specifická pravidla', icon: CheckCircle2, description: 'Pravidla pro frakce, gangy.' },
  scenarios: { label: 'Herní scénáře', icon: FileText, description: 'Jak bys řešil situaci X?' },
  agreement: { label: 'Souhlasy', icon: CheckCircle2, description: 'Souhlas se zpracováním údajů.' },
  general: { label: 'Obecné', icon: Hash, description: 'Nezařazené otázky.' }
}

const defaultQuestion: Partial<WhitelistQuestion> = {
  question: '',
  field_name: '',
  field_type: 'text',
  placeholder: '',
  required: true,
  category: 'general',
  is_active: true
}

// Sortable Item Component
const SortableQuestionItem = ({ question, handleEdit, handleDelete, handleToggleActive }: { question: WhitelistQuestion, handleEdit: (q: WhitelistQuestion) => void, handleDelete: (id: number) => void, handleToggleActive: (q: WhitelistQuestion) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 pr-4 shadow-sm transition-all duration-200",
        !question.is_active && "bg-zinc-950/50 border-zinc-900 opacity-60"
      )}
    >
      <div {...attributes} {...listeners} className="p-2 cursor-grab text-zinc-500 hover:text-foreground dark:text-white transition-colors">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-grow ml-2">
        <p className="font-medium text-zinc-100">{question.question}</p>
        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
          <Badge variant="outline" className="text-xs">{fieldTypeLabels[question.field_type]}</Badge>
          {question.required && <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-none">Povinné</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleToggleActive(question)}>
                {question.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{question.is_active ? "Skrýt otázku" : "Zobrazit otázku"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleEdit(question)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upravit otázku</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400" onClick={() => handleDelete(question.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Smazat otázku</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}


// Main Page Component
export default function WhitelistQuestionsPage() {
  const [questions, setQuestions] = useState<WhitelistQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('basic')
  const [editingQuestion, setEditingQuestion] = useState<WhitelistQuestion | null>(null)
  const [formData, setFormData] = useState<Partial<WhitelistQuestion>>(defaultQuestion)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/whitelist-questions')
      if (!response.ok) throw new Error('Failed to fetch questions')
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (error) {
      toast.error('Chyba při načítání otázek')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.question || !formData.field_name || !formData.field_type) {
      toast.error('Vyplňte všechna povinná pole: Otázka, Název pole, Typ pole.')
      return
    }

    setIsSaving(true)
    try {
      const url = editingQuestion ? `/api/admin/whitelist-questions/${editingQuestion.id}` : '/api/admin/whitelist-questions'
      const method = editingQuestion ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        order_index: editingQuestion?.order_index ?? (questions.filter(q => q.category === formData.category).length)
      };

      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save question');
      }

      toast.success(editingQuestion ? 'Otázka byla aktualizována' : 'Otázka byla vytvořena')
      await fetchQuestions()
      setIsSheetOpen(false)
    } catch (error: any) {
      toast.error(`Chyba při ukládání: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    const questionToDelete = questions.find(q => q.id === id);
    if (!questionToDelete) return;

    if (!confirm(`Opravdu chcete smazat otázku "${questionToDelete.question}"?`)) return

    try {
      const response = await fetch(`/api/admin/whitelist-questions/${id}`, { method: 'DELETE' })
      if (!response.ok) {
         const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete question');
      }
      toast.success('Otázka byla smazána')
      await fetchQuestions()
    } catch (error: any) {
      toast.error(`Chyba při mazání: ${error.message}`)
    }
  }

  const handleToggleActive = async (question: WhitelistQuestion) => {
    try {
      const response = await fetch(`/api/admin/whitelist-questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...question, is_active: !question.is_active })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to toggle question');
      }
      toast.success(`Otázka byla ${!question.is_active ? 'zobrazena' : 'skryta'}.`);
      await fetchQuestions();
    } catch (error: any) {
      toast.error(`Chyba při změně viditelnosti: ${error.message}`);
    }
  }

  const handleEdit = (question: WhitelistQuestion) => {
    setEditingQuestion(question)
    setFormData(question)
    setIsSheetOpen(true)
  }

  const handleAddNew = () => {
    setEditingQuestion(null)
    setFormData({ ...defaultQuestion, category: activeCategory })
    setIsSheetOpen(true)
  }
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const filteredQuestions = questions.filter(q => q.category === activeCategory).sort((a, b) => a.order_index - b.order_index);

    if (active.id !== over?.id) {
      const oldIndex = filteredQuestions.findIndex((q) => q.id === active.id);
      const newIndex = filteredQuestions.findIndex((q) => q.id === over!.id);
      
      const newOrder = arrayMove(filteredQuestions, oldIndex, newIndex);
      
      const updatedQuestions = questions.map(q => {
        const newOrderItem = newOrder.find(item => item.id === q.id);
        if (newOrderItem) {
          const originalItemIndex = newOrder.findIndex(item => item.id === q.id);
          return { ...q, order_index: originalItemIndex };
        }
        return q;
      });
      setQuestions(updatedQuestions);

      const updates = newOrder.map((q, index) => ({
        id: q.id,
        order_index: index,
      }));

      try {
        const res = await fetch('/api/admin/whitelist-questions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates })
        });
        if (!res.ok) throw new Error('Failed to update order');
        toast.success('Pořadí otázek bylo aktualizováno.');
        await fetchQuestions();
      } catch (error) {
        toast.error('Nepodařilo se uložit nové pořadí.');
        await fetchQuestions();
      }
    }
  };

  const filteredAndSortedQuestions = useMemo(() => 
    questions
      .filter(q => q.category === activeCategory)
      .sort((a, b) => a.order_index - b.order_index),
    [questions, activeCategory]
  );

  return (
    <div className="flex gap-10 min-h-[calc(100vh-8rem)]">
      <aside className="w-64 flex-shrink-0">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#b90505]/20 to-[#bd2727]/10 text-[#bd2727] border border-[#b90505]/30 shadow-lg mb-6 flex items-center gap-4">
            <FileText className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Whitelist</h1>
              <p className="text-sm text-gray-400">Správa otázek</p>
            </div>
        </div>

        <nav className="flex flex-col gap-1">
          {Object.entries(categoryConfig).map(([key, { label, icon: Icon, description }]) => (
            <TooltipProvider key={key} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveCategory(key)}
                    className={cn(
                      "flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200",
                      activeCategory === key
                        ? "bg-zinc-800 text-foreground dark:text-white shadow-inner"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{label}</span>
                    <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded-sm bg-zinc-700/50">
                      {questions.filter(q => q.category === key).length}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-3xl font-bold text-foreground dark:text-white">{categoryConfig[activeCategory]?.label || 'Všechny otázky'}</h2>
                <p className="text-zinc-400 mt-1">{categoryConfig[activeCategory]?.description || 'Správa všech otázek ve formuláři.'}</p>
            </div>
            <Button onClick={handleAddNew} className="bg-[#b90505] hover:bg-[#8a0101]">
                <Plus className="mr-2 h-4 w-4" />
                Přidat novou otázku
            </Button>
        </div>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-[#b90505] border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : filteredAndSortedQuestions.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            <SortableContext items={filteredAndSortedQuestions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {filteredAndSortedQuestions.map((q) => (
                  <SortableQuestionItem 
                    key={q.id} 
                    question={q}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center text-center bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-xl py-20">
              <AlertCircle className="h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="text-xl font-semibold text-foreground dark:text-white">Žádné otázky v této kategorii</h3>
              <p className="text-zinc-400 mt-2 max-w-sm">
                  {`Pro kategorii "${categoryConfig[activeCategory]?.label}" zatím nebyly vytvořeny žádné otázky. Můžete je přidat kliknutím na tlačítko vpravo nahoře.`}
              </p>
          </div>
        )}
      </main>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-zinc-950 border-zinc-800 text-zinc-50 sm:max-w-lg">
            <ScrollArea className="h-full pr-6 -mr-6">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl text-foreground dark:text-white">{editingQuestion ? 'Upravit otázku' : 'Vytvořit novou otázku'}</SheetTitle>
                    <SheetDescription>
                        Pečlivě vyplňte všechny detaily. Změny se projeví ve formuláři pro žadatele o whitelist.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    <div className="space-y-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900">
                        <h4 className="font-semibold text-lg text-foreground dark:text-white">Základní nastavení</h4>
                        <div>
                            <Label htmlFor="question">Text otázky</Label>
                            <Textarea id="question" value={formData.question || ''} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="mt-1" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Kategorie</Label>
                                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger id="category" className="mt-1">
                                        <SelectValue placeholder="Vyberte kategorii" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(categoryConfig).map(([key, { label }]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="field_type">Typ pole</Label>
                                <Select value={formData.field_type} onValueChange={(v) => setFormData({ ...formData, field_type: v as WhitelistQuestion['field_type'] })}>
                                    <SelectTrigger id="field_type" className="mt-1">
                                        <SelectValue placeholder="Vyberte typ pole" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(fieldTypeLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="field_name">Unikátní název pole (bez diakritiky a mezer)</Label>
                            <Input id="field_name" value={formData.field_name || ''} onChange={(e) => setFormData({ ...formData, field_name: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') })} className="mt-1 font-mono" required />
                        </div>
                         <div>
                            <Label htmlFor="placeholder">Placeholder (nápověda v poli)</Label>
                            <Input id="placeholder" value={formData.placeholder || ''} onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })} className="mt-1" />
                        </div>
                    </div>
                    
                    <AnimatePresence>
                    {(formData.field_type === 'number' || formData.field_type === 'text' || formData.field_type === 'textarea' || formData.field_type === 'select') && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden"
                        >
                            <h4 className="font-semibold text-lg text-foreground dark:text-white">Specifická nastavení pole</h4>
                            {formData.field_type === 'number' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="min_value">Minimální hodnota</Label>
                                        <Input id="min_value" type="number" value={formData.min_value ?? ''} onChange={(e) => setFormData({ ...formData, min_value: e.target.value === '' ? undefined : Number(e.target.value) })} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="max_value">Maximální hodnota</Label>
                                        <Input id="max_value" type="number" value={formData.max_value ?? ''} onChange={(e) => setFormData({ ...formData, max_value: e.target.value === '' ? undefined : Number(e.target.value) })} className="mt-1" />
                                    </div>
                                </div>
                            )}
                            {(formData.field_type === 'text' || formData.field_type === 'textarea') && (
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <Label htmlFor="min_length">Minimální délka</Label>
                                        <Input id="min_length" type="number" value={formData.min_length ?? ''} onChange={(e) => setFormData({ ...formData, min_length: e.target.value === '' ? undefined : Number(e.target.value) })} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="max_length">Maximální délka</Label>
                                        <Input id="max_length" type="number" value={formData.max_length ?? ''} onChange={(e) => setFormData({ ...formData, max_length: e.target.value === '' ? undefined : Number(e.target.value) })} className="mt-1" />
                                    </div>
                                </div>
                            )}
                            {formData.field_type === 'select' && (
                                <div>
                                    <Label htmlFor="options">Možnosti (každá na nový řádek)</Label>
                                    <Textarea id="options" value={formData.options?.join('\n') || ''} onChange={(e) => setFormData({ ...formData, options: e.target.value.split('\n') })} className="mt-1 font-mono" rows={4} />
                                </div>
                            )}
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <div className="space-y-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900">
                        <h4 className="font-semibold text-lg text-foreground dark:text-white">Atributy</h4>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="required" checked={formData.required} onCheckedChange={(checked) => setFormData({ ...formData, required: !!checked })} />
                            <Label htmlFor="required">Povinná otázka</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })} />
                            <Label htmlFor="is_active">Aktivní (zobrazit ve formuláři)</Label>
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <SheetFooter className="mt-6 pt-4 border-t border-zinc-800">
              <SheetClose asChild>
                <Button variant="outline">Zrušit</Button>
              </SheetClose>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Ukládání...' : 'Uložit otázku'}
              </Button>
            </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
} 