import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-background via-background to-muted/20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[5%] top-[15%] size-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[10%] top-[35%] size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-1/2 size-80 -translate-x-1/2 rounded-full bg-muted/20 blur-[120px]" />
      </div>
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-8xl font-bold text-foreground sm:text-9xl">
          404
        </h1>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Tato stránka neexistuje
          </h2>
          <p className="max-w-md text-muted-foreground">
            Stránka, kterou hledáte, nebyla nalezena. Může být přesunuta nebo odstraněna.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" />
            Vrátit se domů
          </Link>
        </Button>
        </div>
      </div>
    </div>
  )
}
