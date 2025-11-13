import {
  IconActivity,
  IconGauge,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const cards = [
  {
    title: "Aktivní hráči",
    description: "Live connections",
    value: "218",
    delta: "+12%",
    trend: "up",
    detail: "Server plný ve večerním prime time.",
  },
  {
    title: "Nové whitelisty",
    description: "Za posledních 7 dní",
    value: "64",
    delta: "-8%",
    trend: "down",
    detail: "Potřebujeme více promo kampaní.",
  },
  {
    title: "Ekonomika",
    description: "Průměrné příjmy hráče",
    value: "$4,520",
    delta: "+5.6%",
    trend: "up",
    detail: "Příjmy stabilní, inflace pod kontrolou.",
  },
  {
    title: "Zdraví serveru",
    description: "Latency & stabilita",
    value: "99.2%",
    delta: "+0.4%",
    trend: "up",
    detail: "Poslední restart zlepšil výkon.",
  },
]

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="@container/card">
          <CardHeader>
            <CardDescription>{card.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {card.trend === "up" ? (
                  <>
                    <IconTrendingUp />
                    {card.delta}
                  </>
                ) : (
                  <>
                    <IconTrendingDown />
                    {card.delta}
                  </>
                )}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.trend === "up" ? (
                <>
                  Stabilní růst <IconActivity className="size-4" />
                </>
              ) : (
                <>
                  Sledujte vývoj <IconGauge className="size-4" />
                </>
              )}
            </div>
            <div className="text-muted-foreground">{card.detail}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

