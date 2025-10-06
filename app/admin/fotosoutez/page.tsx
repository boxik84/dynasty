"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Contest {
  id: number;
  title: string;
  description: string;
  status: string;
  submission_count: number;
  created_at: string;
}

interface Submission {
  id: number;
  user_name: string;
  user_image: string;
  image_url: string;
  caption: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const statusColors = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

export default function AdminPhotoContestPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [loadingContests, setLoadingContests] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchContests = async () => {
    setLoadingContests(true);
    try {
      const response = await fetch("/api/admin/fotosoutez/contests");
      if (!response.ok) throw new Error("Nepodařilo se načíst soutěže.");
      const data = await response.json();
      setContests(data);
    } catch (error) {
      toast.error("Chyba při načítání soutěží", { description: (error as Error).message });
    } finally {
      setLoadingContests(false);
    }
  };

  const fetchSubmissions = async (contestId: number) => {
    setLoadingSubmissions(true);
    setSelectedContest(contests.find(c => c.id === contestId) || null);
    setSubmissions([]);
    try {
      const response = await fetch(`/api/admin/fotosoutez/submissions?contestId=${contestId}`);
      if (!response.ok) throw new Error("Nepodařilo se načíst příspěvky.");
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      toast.error("Chyba při načítání příspěvků", { description: (error as Error).message });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleStatusUpdate = async (submissionId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/fotosoutez/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Aktualizace stavu se nezdařila.");

      // Optimistic update
      setSubmissions(subs => subs.map(s => s.id === submissionId ? { ...s, status } : s));
      toast.success("Stav příspěvku byl úspěšně aktualizován.");
    } catch (error) {
      toast.error("Chyba při aktualizaci", { description: (error as Error).message });
    }
  };
  
  const handleCreateContest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    
    try {
        const response = await fetch('/api/admin/fotosoutez/contests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description }),
        });
        if (!response.ok) throw new Error('Nepodařilo se vytvořit soutěž.');
        
        toast.success('Nová soutěž byla úspěšně vytvořena!');
        fetchContests(); // Refresh the list
        // Close dialog if this form is in one
    } catch (error) {
        toast.error("Chyba", { description: (error as Error).message });
    } finally {
        setIsSubmitting(false);
    }
  }

  useEffect(() => {
    fetchContests();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Správa Fotosoutěže</h1>
        <Dialog>
            <DialogTrigger asChild>
                <Button>Vytvořit novou soutěž</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Vytvořit novou soutěž</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateContest} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-1">Název</label>
                        <Input id="title" name="title" required disabled={isSubmitting} />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Popis</label>
                        <Textarea id="description" name="description" disabled={isSubmitting} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Icons.spinner className="animate-spin" /> : "Vytvořit"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Soutěže</CardTitle>
              <CardDescription>Vyberte soutěž pro zobrazení detailů a příspěvků.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingContests ? (
                <p>Načítání soutěží...</p>
              ) : (
                <ul className="space-y-2">
                  {contests.map((contest) => (
                    <li key={contest.id}>
                      <Button
                        variant={selectedContest?.id === contest.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left h-auto"
                        onClick={() => fetchSubmissions(contest.id)}
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{contest.title}</p>
                          <p className="text-xs text-muted-foreground">{contest.description}</p>
                        </div>
                        <Badge>{contest.submission_count}</Badge>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Příspěvky soutěže</CardTitle>
              <CardDescription>
                {selectedContest ? `Příspěvky pro "${selectedContest.title}"` : "Vyberte soutěž vlevo"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSubmissions ? (
                <p>Načítání příspěvků...</p>
              ) : selectedContest ? (
                submissions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Obrázek</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Stav</TableHead>
                        <TableHead>Akce</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <a href={sub.image_url} target="_blank" rel="noopener noreferrer">
                                <Image src={sub.image_url} alt={sub.caption || 'Submission'} width={80} height={45} className="rounded-md object-cover" />
                            </a>
                          </TableCell>
                          <TableCell>{sub.user_name}</TableCell>
                          <TableCell>
                            <Badge className={`${statusColors[sub.status]}`}>{sub.status}</Badge>
                          </TableCell>
                          <TableCell className="space-x-2">
                            {sub.status !== 'approved' && (
                              <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(sub.id, 'approved')}>Schválit</Button>
                            )}
                            {sub.status !== 'rejected' && (
                              <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(sub.id, 'rejected')}>Zamítnout</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p>Pro tuto soutěž nebyly nalezeny žádné příspěvky.</p>
                )
              ) : (
                <p>Žádná soutěž není vybrána.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 