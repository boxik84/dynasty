"use client";

import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Definice typů pro data, která budeme načítat
interface PhotoSubmission {
    id: number;
    user_id: string;
    user_name: string;
    user_image: string;
    image_url: string;
    caption: string | null;
    created_at: string;
    like_count: number;
    has_liked: boolean;
}

interface PhotoContest {
    id: number;
    title: string;
    description: string | null;
    status: 'open' | 'judging' | 'closed';
    submissions: PhotoSubmission[];
}

function UploadForm({ contestId, onUploadFinished }: { contestId: number, onUploadFinished: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!file) {
            setError('Prosím, vyberte obrázek k nahrání.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10 MB limit
            setError('Soubor je příliš velký. Maximální velikost je 10 MB.');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // 1. Získání presigned URL z našeho serveru
            const presignedResponse = await fetch('/api/fotosoutez/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentType: file.type }),
            });

            if (!presignedResponse.ok) {
                throw new Error('Nepodařilo se připravit nahrávání souboru.');
            }

            const { url, publicUrl } = await presignedResponse.json();

            // 2. Nahrání souboru přímo na Fivemanage
            const uploadResponse = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
            });

            if (!uploadResponse.ok) {
                throw new Error('Nahrávání souboru na cloud selhalo.');
            }

            // 3. Uložení odkazu a popisku do naší databáze
            const submissionResponse = await fetch('/api/fotosoutez/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: publicUrl,
                    caption,
                    contestId,
                }),
            });

            if (!submissionResponse.ok) {
                throw new Error('Nepodařilo se uložit příspěvek do databáze.');
            }

            toast.success("Úspěšně nahráno!", {
                description: "Tvá fotka byla odeslána a čeká na schválení administrátorem.",
            });
            onUploadFinished();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Došlo k neznámé chybě.';
            setError(errorMessage);
            toast.error("Chyba při nahrávání", {
                description: errorMessage,
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-neutral-300 mb-1">
                    Soutěžní fotka
                </label>
                <Input
                    id="file-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="file:text-white"
                />
                <p className="text-xs text-neutral-400 mt-1">PNG, JPG, GIF. Max 10MB.</p>
            </div>
            <div>
                <label htmlFor="caption" className="block text-sm font-medium text-neutral-300 mb-1">
                    Popisek (nepovinné)
                </label>
                <Textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Napiš něco o své fotce..."
                    maxLength={200}
                    disabled={isUploading}
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isUploading || !file} className="w-full">
                {isUploading ? <><Icons.spinner className="animate-spin mr-2" /> Nahrávám...</> : 'Odeslat fotku'}
            </Button>
        </form>
    )
}

export default function PhotoContestPage() {
    const [contests, setContests] = useState<PhotoContest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialogId, setOpenDialogId] = useState<number | null>(null);

    const fetchContests = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/fotosoutez');
            if (!response.ok) {
                throw new Error('Nepodařilo se načíst data');
            }
            const data = await response.json();
            setContests(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Neznámá chyba');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchContests();
    }, []);

    const handleLikeToggle = async (contestId: number, submissionId: number) => {
        // Najdeme soutěž a příspěvek, které chceme aktualizovat
        const originalContests = [...contests];
        const newContests = contests.map(c => ({...c, submissions: [...c.submissions]}));
        const contest = newContests.find(c => c.id === contestId);
        if (!contest) return;
        const submission = contest.submissions.find(s => s.id === submissionId);
        if (!submission) return;

        // Optimistická aktualizace UI
        const originalHasLiked = submission.has_liked;
        const originalLikeCount = submission.like_count;
        submission.has_liked = !submission.has_liked;
        submission.like_count += submission.has_liked ? 1 : -1;
        setContests(newContests);

        try {
            const response = await fetch('/api/fotosoutez/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Nezdařilo se provést akci.');
            }

            // Můžeme volitelně aktualizovat stav daty ze serveru, ale optimistická aktualizace by měla stačit
            const data = await response.json();
            submission.has_liked = data.hasLiked;
            submission.like_count = data.likeCount;
            setContests([...newContests]);

        } catch (err) {
            // Pokud nastala chyba, vrátíme stav do původní podoby
            setContests(originalContests);
            toast.error("Chyba", {
                description: err instanceof Error ? err.message : "Nepodařilo se lajknout fotku.",
            });
        }
    };

    const handleUploadFinished = () => {
        if (openDialogId !== null) {
            setOpenDialogId(null);
        }
        // Znovu načteme soutěže, aby se zobrazil nový (zatím neschválený) příspěvek, pokud bychom ho chtěli zobrazovat
        // Prozatím jen zavřeme dialog
    };

    return (
        <main className="min-h-screen">
             <section className="relative py-20 md:py-28">
                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#b90505]/10 border border-[#b90505]/30 text-[#bd2727] px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm mb-6">
                            <Icons.heart className="h-4 w-4" />
                            Komunitní Event
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                            Fotosoutěž
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
                            Ukaž komunitě své nejlepší RP fotky a vyhraj! Zapoj se, sbírej lajky a nech vedení rozhodnout o vítězi.
                        </p>
                    </motion.div>

                    {loading && (
                        <div className="flex items-center justify-center text-white/80">
                            <Icons.spinner className="h-8 w-8 animate-spin mr-3" />
                            Načítání soutěží...
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 text-center">Chyba: {error}</p>}

                    {!loading && !error && (
                        <div className="w-full max-w-7xl mx-auto space-y-12">
                            {contests.length > 0 ? (
                                contests.map((contest) => (
                                    <div key={contest.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row justify-between md:items-start mb-8">
                                            <div className="mb-4 md:mb-0">
                                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{contest.title}</h2>
                                                <p className="text-neutral-300 max-w-2xl">{contest.description}</p>
                                            </div>
                                            {contest.status === 'open' && (
                                                <Dialog open={openDialogId === contest.id} onOpenChange={(isOpen) => setOpenDialogId(isOpen ? contest.id : null)}>
                                                    <DialogTrigger asChild>
                                                        <Button className="shrink-0 bg-[#8a0101] hover:bg-[#570000] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-[#8a0101]/25 transition-all duration-300">
                                                            <Icons.plus className="mr-2 h-5 w-5" /> Přidat fotku
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px] bg-[#101010] border-neutral-700 text-white">
                                                        <DialogHeader>
                                                            <DialogTitle>Nahrát fotku do soutěže</DialogTitle>
                                                            <DialogDescription>
                                                                Vyber nejlepší snímek a přidej krátký popisek. Po odeslání bude fotka čekat na schválení.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <UploadForm contestId={contest.id} onUploadFinished={handleUploadFinished} />
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {contest.submissions.map((submission) => (
                                                <div key={submission.id} className="group relative rounded-2xl overflow-hidden border border-white/10 bg-black/30 transition-all duration-300 hover:border-[#b90505]/40 hover:shadow-2xl hover:shadow-[#b90505]/20">
                                                    <div className="relative w-full aspect-[16/10]">
                                                        <Image
                                                            src={submission.image_url}
                                                            alt={submission.caption || 'Soutěžní fotka'}
                                                            fill
                                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 p-4 w-full">
                                                        <p className="text-white/90 text-sm mb-3 min-h-[40px] font-medium">{submission.caption}</p>
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-8 w-8 border-2 border-transparent group-hover:border-[#b90505]/50 transition-colors">
                                                                    <AvatarImage src={submission.user_image} />
                                                                    <AvatarFallback>{submission.user_name.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm text-white/80 font-semibold">{submission.user_name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleLikeToggle(contest.id, submission.id)}
                                                                className={cn(
                                                                    "flex items-center gap-2 rounded-full px-3 py-1 text-white/80 transition-all duration-200 backdrop-blur-sm",
                                                                    submission.has_liked 
                                                                        ? "bg-red-500/30 text-red-300 hover:bg-red-500/40" 
                                                                        : "bg-black/30 hover:bg-white/20"
                                                                )}
                                                            >
                                                                <Icons.heart
                                                                    className={cn(
                                                                        "h-5 w-5 transition-all",
                                                                        submission.has_liked ? 'text-red-400 fill-current' : 'text-white/70'
                                                                    )}
                                                                />
                                                                <span className="font-semibold">{submission.like_count}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {contest.submissions.length === 0 && (
                                            <div className="text-center py-10 rounded-2xl bg-black/20 border border-dashed border-white/10">
                                                <p className="text-neutral-400">Zatím zde nejsou žádné schválené fotografie.</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 rounded-2xl bg-black/20 border border-dashed border-white/10">
                                    <h3 className="text-2xl font-bold text-white/90 mb-2">Žádná aktivní soutěž</h3>
                                    <p className="text-center text-white/60 text-lg">
                                        Momentálně neprobíhá žádná fotosoutěž. Zkus to prosím později!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}