"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const chartData = [
  { date: "2024-04-01", police: 32, ems: 18 },
  { date: "2024-04-02", police: 28, ems: 20 },
  { date: "2024-04-03", police: 26, ems: 17 },
  { date: "2024-04-04", police: 38, ems: 24 },
  { date: "2024-04-05", police: 42, ems: 29 },
  { date: "2024-04-06", police: 36, ems: 31 },
  { date: "2024-04-07", police: 40, ems: 28 },
  { date: "2024-04-08", police: 45, ems: 30 },
  { date: "2024-04-09", police: 33, ems: 21 },
  { date: "2024-04-10", police: 39, ems: 23 },
  { date: "2024-04-11", police: 41, ems: 35 },
  { date: "2024-04-12", police: 34, ems: 22 },
  { date: "2024-04-13", police: 47, ems: 38 },
  { date: "2024-04-14", police: 29, ems: 20 },
  { date: "2024-04-15", police: 27, ems: 18 },
  { date: "2024-04-16", police: 30, ems: 22 },
  { date: "2024-04-17", police: 52, ems: 40 },
  { date: "2024-04-18", police: 48, ems: 36 },
  { date: "2024-04-19", police: 31, ems: 19 },
  { date: "2024-04-20", police: 22, ems: 14 },
  { date: "2024-04-21", police: 28, ems: 17 },
  { date: "2024-04-22", police: 37, ems: 25 },
  { date: "2024-04-23", police: 34, ems: 26 },
  { date: "2024-04-24", police: 49, ems: 34 },
  { date: "2024-04-25", police: 35, ems: 27 },
  { date: "2024-04-26", police: 25, ems: 16 },
  { date: "2024-04-27", police: 51, ems: 39 },
  { date: "2024-04-28", police: 30, ems: 21 },
  { date: "2024-04-29", police: 44, ems: 32 },
  { date: "2024-04-30", police: 55, ems: 38 },
  { date: "2024-05-01", police: 33, ems: 24 },
  { date: "2024-05-02", police: 42, ems: 31 },
  { date: "2024-05-03", police: 40, ems: 28 },
  { date: "2024-05-04", police: 58, ems: 45 },
  { date: "2024-05-05", police: 63, ems: 44 },
  { date: "2024-05-06", police: 61, ems: 47 },
  { date: "2024-05-07", police: 52, ems: 35 },
  { date: "2024-05-08", police: 29, ems: 20 },
  { date: "2024-05-09", police: 36, ems: 27 },
  { date: "2024-05-10", police: 43, ems: 31 },
  { date: "2024-05-11", police: 45, ems: 30 },
  { date: "2024-05-12", police: 34, ems: 24 },
  { date: "2024-05-13", police: 33, ems: 22 },
  { date: "2024-05-14", police: 60, ems: 46 },
  { date: "2024-05-15", police: 58, ems: 40 },
  { date: "2024-05-16", police: 48, ems: 34 },
  { date: "2024-05-17", police: 63, ems: 44 },
  { date: "2024-05-18", police: 50, ems: 36 },
  { date: "2024-05-19", police: 37, ems: 25 },
  { date: "2024-05-20", police: 31, ems: 22 },
  { date: "2024-05-21", police: 24, ems: 16 },
  { date: "2024-05-22", police: 23, ems: 15 },
  { date: "2024-05-23", police: 42, ems: 30 },
  { date: "2024-05-24", police: 46, ems: 28 },
  { date: "2024-05-25", police: 34, ems: 25 },
  { date: "2024-05-26", police: 38, ems: 26 },
  { date: "2024-05-27", police: 57, ems: 41 },
  { date: "2024-05-28", police: 39, ems: 27 },
  { date: "2024-05-29", police: 22, ems: 15 },
  { date: "2024-05-30", police: 48, ems: 32 },
  { date: "2024-05-31", police: 30, ems: 22 },
  { date: "2024-06-01", police: 29, ems: 21 },
  { date: "2024-06-02", police: 62, ems: 43 },
  { date: "2024-06-03", police: 28, ems: 19 },
  { date: "2024-06-04", police: 55, ems: 36 },
  { date: "2024-06-05", police: 27, ems: 18 },
  { date: "2024-06-06", police: 44, ems: 33 },
  { date: "2024-06-07", police: 49, ems: 37 },
  { date: "2024-06-08", police: 52, ems: 34 },
  { date: "2024-06-09", police: 57, ems: 42 },
  { date: "2024-06-10", police: 31, ems: 21 },
  { date: "2024-06-11", police: 24, ems: 16 },
  { date: "2024-06-12", police: 59, ems: 38 },
  { date: "2024-06-13", police: 25, ems: 17 },
  { date: "2024-06-14", police: 53, ems: 41 },
  { date: "2024-06-15", police: 45, ems: 33 },
  { date: "2024-06-16", police: 49, ems: 36 },
  { date: "2024-06-17", police: 64, ems: 47 },
  { date: "2024-06-18", police: 28, ems: 19 },
  { date: "2024-06-19", police: 51, ems: 34 },
  { date: "2024-06-20", police: 56, ems: 39 },
  { date: "2024-06-21", police: 33, ems: 24 },
  { date: "2024-06-22", police: 48, ems: 32 },
  { date: "2024-06-23", police: 63, ems: 45 },
  { date: "2024-06-24", police: 27, ems: 18 },
  { date: "2024-06-25", police: 29, ems: 19 },
  { date: "2024-06-26", police: 58, ems: 41 },
  { date: "2024-06-27", police: 60, ems: 44 },
  { date: "2024-06-28", police: 31, ems: 21 },
  { date: "2024-06-29", police: 25, ems: 17 },
  { date: "2024-06-30", police: 59, ems: 40 },
]

const chartConfig: ChartConfig = {
  police: {
    label: "LSPD výjezdy",
    color: "hsl(var(--chart-1))",
  },
  ems: {
    label: "EMS zásahy",
    color: "hsl(var(--chart-2))",
  },
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => new Date(item.date) >= startDate)
  }, [timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Bezpečnostní složky</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Přehled zásahů za poslední období
          </span>
          <span className="@[540px]/card:hidden">Poslední období</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Poslední 3 měsíce</ToggleGroupItem>
            <ToggleGroupItem value="30d">Posledních 30 dní</ToggleGroupItem>
            <ToggleGroupItem value="7d">Posledních 7 dní</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Zvol rozsah"
            >
              <SelectValue placeholder="Poslední 3 měsíce" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Poslední 3 měsíce
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Posledních 30 dní
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Posledních 7 dní
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPolice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-police)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-police)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillEms" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ems)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-ems)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("cs-CZ", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("cs-CZ", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="ems"
              type="natural"
              fill="url(#fillEms)"
              stroke="var(--color-ems)"
              stackId="a"
            />
            <Area
              dataKey="police"
              type="natural"
              fill="url(#fillPolice)"
              stroke="var(--color-police)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}




