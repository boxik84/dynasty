'use client'

import { useState, useEffect } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Plus,
    Edit3,
    Trash2,
    Save,
    X,
    GripVertical,
    ChevronDown,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Interfaces
interface RuleSection {
    id: string
    title: string
    icon?: string
    order_index: number
}

interface RuleSubcategory {
    id: string
    section_id: string
    title: string
    icon?: string
    order_index: number
}

interface Rule {
    id: number
    section_id: string
    subcategory_id?: string | null
    content: string
    order_index: number
}

interface RulesData {
    sections: RuleSection[]
    subcategories: RuleSubcategory[]
    rules: Rule[]
}

// Sortable Item Component
function SortableItem(props: {
    type: 'section' | 'subcategory' | 'rule',
    item: RuleSection | RuleSubcategory | Rule,
    children: React.ReactNode
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: props.item.id,
        data: {
            type: props.type,
            item: props.item,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 w-full">
            <button {...attributes} {...listeners} className="p-2 text-gray-400 hover:text-foreground dark:text-white transition-colors cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5" />
            </button>
            <div className="flex-1">
                {props.children}
            </div>
        </div>
    );
}

export default function RulesAdmin() {
    const [rulesData, setRulesData] = useState<RulesData>({
        sections: [],
        subcategories: [],
        rules: []
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editType, setEditType] = useState<'section' | 'subcategory' | 'rule'>('rule')
    const [editingData, setEditingData] = useState<any>({})
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{type: string, id: any} | null>(null)
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchRulesData()
    }, [])

    const fetchRulesData = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/rules')
            
            if (!response.ok) {
                toast.error('Chyba při načítání pravidel')
                return
            }

            const data = await response.json()
            setRulesData({
                sections: data.sections.sort((a: RuleSection, b: RuleSection) => a.order_index - b.order_index),
                subcategories: data.subcategories.sort((a: RuleSubcategory, b: RuleSubcategory) => a.order_index - b.order_index),
                rules: data.rules.sort((a: Rule, b: Rule) => a.order_index - b.order_index)
            });
        } catch (error) {
            console.error('Error fetching rules:', error)
            toast.error('Chyba při načítání pravidel')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
    
        if (!over || active.id === over.id) {
            return;
        }
    
        const activeType = active.data.current?.type as 'section' | 'subcategory' | 'rule';
        const activeItem = active.data.current?.item;
    
        const overType = over.data.current?.type;
    
        if (!activeType || !activeItem || activeType !== overType) {
            return;
        }
        
        const typeToKeyMap = {
            section: 'sections',
            subcategory: 'subcategories',
            rule: 'rules',
        };
    
        const itemsKey = typeToKeyMap[activeType] as keyof RulesData;
        const allItemsOfThisType = rulesData[itemsKey] as (RuleSection | RuleSubcategory | Rule)[];
    
        let currentSortableList: any[];
    
        if (activeType === 'section') {
            currentSortableList = [...rulesData.sections];
        } else if (activeType === 'subcategory') {
            const typedActiveItem = activeItem as RuleSubcategory;
            currentSortableList = rulesData.subcategories.filter(s => s.section_id === typedActiveItem.section_id);
        } else { // rule
            const typedActiveItem = activeItem as Rule;
            currentSortableList = rulesData.rules.filter(r => 
                r.section_id === typedActiveItem.section_id && r.subcategory_id === typedActiveItem.subcategory_id
            );
        }
    
        const oldIndex = currentSortableList.findIndex(item => item.id === active.id);
        const newIndex = currentSortableList.findIndex(item => item.id === over.id);
    
        if (oldIndex === -1 || newIndex === -1) {
            return;
        }
    
        const reorderedList = arrayMove(currentSortableList, oldIndex, newIndex);
    
        const updatedItemsForAPI = reorderedList.map((item, index) => ({
            id: item.id,
            order_index: index,
        }));

        const reorderedSublistWithNewIndices = reorderedList.map((item, index) => ({
            ...item,
            order_index: index,
        }));
    
        const newFullListForState = allItemsOfThisType.map(item => {
            const updatedItem = reorderedSublistWithNewIndices.find(u => u.id === item.id);
            return updatedItem || item;
        });

        // This is the crucial step: sort the entire list correctly before setting state
        if (itemsKey === 'sections') {
            (newFullListForState as RuleSection[]).sort((a, b) => a.order_index - b.order_index);
        } else if (itemsKey === 'subcategories') {
            (newFullListForState as RuleSubcategory[]).sort((a, b) => {
                if (a.section_id < b.section_id) return -1;
                if (a.section_id > b.section_id) return 1;
                return a.order_index - b.order_index;
            });
        } else if (itemsKey === 'rules') {
            (newFullListForState as Rule[]).sort((a, b) => {
                if (a.section_id < b.section_id) return -1;
                if (a.section_id > b.section_id) return 1;
                const subA = a.subcategory_id || '';
                const subB = b.subcategory_id || '';
                if (subA < subB) return -1;
                if (subA > subB) return 1;
                return a.order_index - b.order_index;
            });
        }
    
        setRulesData(prev => ({
            ...prev,
            [itemsKey]: newFullListForState,
        }));
    
        try {
            const response = await fetch('/api/admin/rules', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: itemsKey,
                    items: updatedItemsForAPI,
                }),
            });
    
            if (!response.ok) {
                toast.error('Nepodařilo se uložit nové pořadí.');
                fetchRulesData();
            } else {
                toast.success('Pořadí bylo úspěšně uloženo.');
            }
        } catch (error) {
            toast.error('Chyba sítě při ukládání pořadí.');
            fetchRulesData();
        }
    };
    
    const handleEdit = (type: 'section' | 'subcategory' | 'rule', data: any) => {
        setEditType(type)
        setEditingData(data)
        setIsEditing(true)
    }

    const handleNew = (type: 'section' | 'subcategory' | 'rule', context: any = {}) => {
        setEditType(type);
        const newData = 
            type === 'section' ? { id: '', title: '', icon: '', order_index: rulesData.sections.length }
            : type === 'subcategory' ? { id: '', section_id: context.section_id, title: '', icon: '', order_index: rulesData.subcategories.filter(s => s.section_id === context.section_id).length }
            : { section_id: context.section_id, subcategory_id: context.subcategory_id || null, content: '', order_index: rulesData.rules.filter(r => r.section_id === context.section_id && r.subcategory_id === (context.subcategory_id || null)).length };
        setEditingData(newData);
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true)
            const response = await fetch('/api/admin/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: editType, data: editingData })
            })
            if (!response.ok) {
                const errorData = await response.json()
                toast.error(errorData.error || 'Chyba při ukládání')
                return
            }
            toast.success('Položka byla úspěšně uložena!')
            setIsEditing(false)
            fetchRulesData()
        } catch (error) {
            console.error('Error saving:', error)
            toast.error('Chyba při ukládání')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            setIsDeleting(true)
            const response = await fetch('/api/admin/rules', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deleteTarget)
            })
            if (!response.ok) {
                const errorData = await response.json()
                toast.error(errorData.error || 'Chyba při mazání')
                return
            }
            toast.success('Položka byla úspěšně smazána!')
            setDeleteTarget(null)
            fetchRulesData()
        } catch (error) {
            console.error('Error deleting:', error)
            toast.error('Chyba při mazání')
        } finally {
            setIsDeleting(false)
        }
    }
    
    const toggleOpen = (id: string) => {
        setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        )
    }

    const renderRule = (rule: Rule) => (
        <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 group w-full">
            <p className="text-sm text-zinc-300 flex-1 break-words">{rule.content}</p>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" onClick={() => handleEdit('rule', rule)} className="h-8 w-8 hover:bg-blue-500/20 hover:text-blue-400"><Edit3 className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteTarget({ type: 'rule', id: rule.id })} className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
            </div>
        </div>
    );

    const renderSubcategory = (subcategory: RuleSubcategory) => {
        const rulesInSubcategory = rulesData.rules.filter(r => r.subcategory_id === subcategory.id);
        return (
            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700 w-full">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => toggleOpen(subcategory.id)} className="p-1 hover:bg-zinc-700 rounded-md"><ChevronDown className={`h-5 w-5 transition-transform ${openItems[subcategory.id] ? 'rotate-180' : ''}`} /></button>
                        <h3 className="font-semibold text-lg text-zinc-100">{subcategory.title}</h3>
                        <span className="text-xs font-mono px-2 py-1 bg-zinc-700 rounded-md">{rulesInSubcategory.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleNew('rule', { section_id: subcategory.section_id, subcategory_id: subcategory.id })}>Přidat pravidlo</Button>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit('subcategory', subcategory)} className="h-8 w-8 hover:bg-blue-500/20 hover:text-blue-400"><Edit3 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget({ type: 'subcategory', id: subcategory.id })} className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </div>
                {openItems[subcategory.id] && (
                    <div className="pl-8 pt-3 border-l-2 border-zinc-700 ml-3 flex flex-col gap-3">
                         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}>
                            <SortableContext items={rulesInSubcategory.map(r => r.id)} strategy={verticalListSortingStrategy}>
                                {rulesInSubcategory.map((rule) => (
                                     <SortableItem key={rule.id} type="rule" item={rule}>
                                        {renderRule(rule)}
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>
                        {rulesInSubcategory.length === 0 && <p className="text-zinc-400 text-sm">Žádná pravidla v této podkategorii.</p>}
                    </div>
                )}
            </div>
        );
    };

    const renderSection = (section: RuleSection) => {
        const subcategoriesInSection = rulesData.subcategories.filter(s => s.section_id === section.id);
        const rulesInSection = rulesData.rules.filter(r => r.section_id === section.id && !r.subcategory_id);
        return (
             <div key={section.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-700/80 w-full">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                         <button onClick={() => toggleOpen(section.id)} className="p-1 hover:bg-zinc-800 rounded-md"><ChevronDown className={`h-6 w-6 transition-transform ${openItems[section.id] ? 'rotate-180' : ''}`} /></button>
                         <h2 className="font-bold text-xl text-foreground dark:text-white">{section.title}</h2>
                         <span className="text-xs font-mono px-2 py-1 bg-zinc-700 rounded-md">{rulesInSection.length + rulesData.rules.filter(r => subcategoriesInSection.some(s => s.id === r.subcategory_id)).length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button size="sm" onClick={() => handleNew('subcategory', { section_id: section.id })}>Přidat podkategorii</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleNew('rule', { section_id: section.id })}>Přidat pravidlo</Button>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit('section', section)} className="h-8 w-8 hover:bg-blue-500/20 hover:text-blue-400"><Edit3 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget({ type: 'section', id: section.id })} className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </div>
                 {openItems[section.id] && (
                     <div className="pl-8 pt-4 border-l-2 border-zinc-700 ml-4 flex flex-col gap-4">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}>
                            <SortableContext items={subcategoriesInSection.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                {subcategoriesInSection.map((sub) => (
                                    <SortableItem key={sub.id} type="subcategory" item={sub}>
                                        {renderSubcategory(sub)}
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}>
                            <SortableContext items={rulesInSection.map(r => r.id)} strategy={verticalListSortingStrategy}>
                                {rulesInSection.map((rule) => (
                                    <SortableItem key={rule.id} type="rule" item={rule}>
                                        {renderRule(rule)}
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>

                        {subcategoriesInSection.length === 0 && rulesInSection.length === 0 && <p className="text-zinc-400 text-sm">Žádný obsah v této sekci.</p>}
                     </div>
                 )}
            </div>
        )
    };
    
    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground dark:text-white">Správa Pravidel</h1>
                        <p className="text-zinc-400 mt-1">Uspořádejte, upravujte a přidávejte pravidla serveru.</p>
                    </div>
                    <Button onClick={() => handleNew('section')} className="bg-red-600 hover:bg-red-700 text-foreground dark:text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Přidat novou sekci
                    </Button>
                </header>

                <main className="flex flex-col gap-6">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}>
                        <SortableContext items={rulesData.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            {rulesData.sections.map(section => (
                                <SortableItem key={section.id} type="section" item={section}>
                                    {renderSection(section)}
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </DndContext>
                </main>
            </div>

            {isEditing && (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-center items-center"
                    onClick={() => setIsEditing(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-2xl p-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground dark:text-white">
                                {editingData.id && editingData.id !== '' ? 'Upravit' : 'Vytvořit'} {editType === 'section' ? 'sekci' : editType === 'subcategory' ? 'podkategorii' : 'pravidlo'}
                            </h2>
                             <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 w-8 hover:bg-zinc-700"><X className="h-5 w-5" /></Button>
                        </div>
                        
                        <div className="space-y-6">
                            {(editType === 'section' || editType === 'subcategory') && (
                                <>
                                    <div>
                                        <Label htmlFor="title">Název</Label>
                                        <Input id="title" value={editingData.title || ''} onChange={e => setEditingData({...editingData, title: e.target.value})} className="mt-1"/>
                                    </div>
                                    <div>
                                        <Label htmlFor="id">Unikátní ID (bez diakritiky, např. {'"obecna_pravidla'})</Label>
                                        <Input id="id" value={editingData.id || ''} onChange={e => setEditingData({...editingData, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} className="mt-1 font-mono" disabled={!!editingData.id && editingData.id !== ''}/>
                                    </div>
                                </>
                            )}
                            {editType === 'rule' && (
                                <div>
                                    <Label htmlFor="content">Obsah pravidla</Label>
                                    <Textarea id="content" value={editingData.content || ''} onChange={e => setEditingData({...editingData, content: e.target.value})} className="mt-1" rows={5}/>
                                    <p className="text-xs text-zinc-400 mt-2">
                                        Můžete použít Markdown pro formátování. Např: <code className="text-xs">**tučně**</code>, <code className="text-xs">*kurzíva*</code>, <code className="text-xs">`kód`</code>.
                                    </p>
                                </div>
                            )}
                            {editType === 'rule' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="section_id">Sekce</Label>
                                        <Select value={editingData.section_id} onValueChange={val => setEditingData({...editingData, section_id: val, subcategory_id: null })}>
                                            <SelectTrigger id="section_id" className="mt-1"><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                {rulesData.sections.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="subcategory_id">Podkategorie (volitelné)</Label>
                                        <Select value={editingData.subcategory_id || 'none'} onValueChange={val => setEditingData({...editingData, subcategory_id: val === 'none' ? null : val})} disabled={!editingData.section_id}>
                                            <SelectTrigger id="subcategory_id" className="mt-1"><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Žádná podkategorie</SelectItem>
                                                {rulesData.subcategories.filter(s => s.section_id === editingData.section_id).map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-zinc-700">
                             <Button variant="outline" onClick={() => setIsEditing(false)}>Zrušit</Button>
                             <Button onClick={handleSave} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-foreground dark:text-white">
                                {isSaving ? 'Ukládání...' : <><Save className="mr-2 h-4 w-4"/> Uložit</>}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Opravdu chcete smazat tuto položku?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tato akce je nevratná. Pokud smažete sekci nebo podkategorii, smažou se i VŠECHNA pravidla v ní obsažená.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Zrušit</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className={buttonVariants({ variant: "destructive" })}>
                        {isDeleting ? 'Mazání...' : 'Smazat'}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
} 