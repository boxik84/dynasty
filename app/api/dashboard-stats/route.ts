import { NextResponse } from "next/server";
import databasefivem from "@/lib/db-fivem";
import database from "@/lib/db";

interface DatabaseRow {
  count: number;
}

interface AccountStats {
  totalBank: number;
  totalMoney: number;
  totalBlack: number;
}

export async function GET() {
  try {
    // Získání počtu online hráčů
    const [onlinePlayersRows] = await databasefivem.execute(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE last_seen > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `) as [DatabaseRow[], any];
    
    // Celkový počet postav
    const [totalCharactersRows] = await databasefivem.execute(`
      SELECT COUNT(*) as count FROM users
    `) as [DatabaseRow[], any];
    
    // Počet registrovaných uživatelů z Better Auth
    const [registeredUsersRows] = await database.execute(`
      SELECT COUNT(*) as count FROM user
    `) as [DatabaseRow[], any];
    
    // Počet vozidel
    const [totalVehiclesRows] = await databasefivem.execute(`
      SELECT COUNT(*) as count FROM owned_vehicles
    `) as [DatabaseRow[], any];
    
    // Ekonomické statistiky
    const [economyStatsRows] = await databasefivem.execute(`
      SELECT 
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(accounts, '$.bank')) AS UNSIGNED)) as totalBank,
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(accounts, '$.money')) AS UNSIGNED)) as totalMoney,
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(accounts, '$.black_money')) AS UNSIGNED)) as totalBlack
      FROM users
    `) as [AccountStats[], any];
    
    // Výpočet uptime
    const serverStartTime = new Date("2025-01-01T00:00:00Z");
    const now = new Date();
    const totalTime = now.getTime() - serverStartTime.getTime();
    const downtime = 0; // Můžete sledovat skutečný downtime
    const uptimePercentage = ((totalTime - downtime) / totalTime) * 100;
    
    const onlinePlayers = onlinePlayersRows[0]?.count || 0;
    const totalCharacters = totalCharactersRows[0]?.count || 0;
    const registeredUsers = registeredUsersRows[0]?.count || 0;
    const totalVehicles = totalVehiclesRows[0]?.count || 0;
    const economyStats = economyStatsRows[0] || { totalBank: 0, totalMoney: 0, totalBlack: 0 };
    
    return NextResponse.json({
      server: {
        onlinePlayers,
        maxPlayers: 128,
        uptime: Math.min(99.9, Math.max(0, Number(uptimePercentage.toFixed(1)))),
        status: onlinePlayers > 0 ? "online" : "maintenance"
      },
      statistics: {
        totalCharacters,
        registeredUsers,
        totalVehicles,
        economy: {
          totalBank: economyStats.totalBank || 0,
          totalMoney: economyStats.totalMoney || 0,
          totalBlackMoney: economyStats.totalBlack || 0
        }
      },
      lastUpdate: now.toISOString()
    });
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json({ 
      error: "Nepodařilo se načíst statistiky" 
    }, { 
      status: 500 
    });
  }
}
