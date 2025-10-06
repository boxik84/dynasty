/**
 * 🎯 PRISMA QUERY EXAMPLES - Dynasty FiveM Web
 * 
 * Tento soubor obsahuje příklady všech Prisma operací
 * pro usnadnění migrace z MySQL2 na Prisma
 */

import prisma from '@/lib/prisma'

// ============================================
// WHITELIST OPERATIONS
// ============================================

export const whitelistExamples = {
  // Získat všechny whitelist žádosti
  getAllRequests: async () => {
    return await prisma.whitelistRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })
  },

  // Získat žádosti konkrétního uživatele
  getUserRequests: async (userId: string) => {
    return await prisma.whitelistRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  },

  // Najít nejnovější žádost uživatele
  getLatestRequest: async (userId: string) => {
    return await prisma.whitelistRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  },

  // Vytvořit novou žádost
  createRequest: async (userId: string, formData: any, serialNumber: string) => {
    return await prisma.whitelistRequest.create({
      data: {
        userId,
        formData,
        status: 'pending',
        serialNumber
      }
    })
  },

  // Aktualizovat status žádosti
  updateStatus: async (id: number, status: 'pending' | 'approved' | 'rejected', notes?: string) => {
    return await prisma.whitelistRequest.update({
      where: { id },
      data: { 
        status,
        notes,
        updatedAt: new Date()
      }
    })
  },

  // Smazat žádost
  deleteRequest: async (id: number) => {
    return await prisma.whitelistRequest.delete({
      where: { id }
    })
  },

  // Počet žádostí podle statusu
  countByStatus: async (status: 'pending' | 'approved' | 'rejected') => {
    return await prisma.whitelistRequest.count({
      where: { status }
    })
  },

  // Počet žádostí v roce
  countInYear: async (year: number) => {
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year + 1, 0, 1)
    
    return await prisma.whitelistRequest.count({
      where: {
        createdAt: {
          gte: startOfYear,
          lt: endOfYear
        }
      }
    })
  }
}

// ============================================
// USER & ACCOUNT OPERATIONS
// ============================================

export const userExamples = {
  // Najít uživatele podle ID
  findById: async (id: string) => {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true,
        sessions: true
      }
    })
  },

  // Najít Discord account ID
  getDiscordAccountId: async (userId: string) => {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: 'discord'
      },
      select: {
        accountId: true
      }
    })
    
    return account?.accountId
  },

  // Získat všechny uživatele s účty
  getAllUsers: async () => {
    return await prisma.user.findMany({
      include: {
        accounts: {
          where: {
            providerId: 'discord'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  },

  // Počet registrovaných uživatelů
  countUsers: async () => {
    return await prisma.user.count()
  }
}

// ============================================
// ACTIVITY OPERATIONS
// ============================================

export const activityExamples = {
  // Získat všechny aktivity
  getAll: async () => {
    return await prisma.activity.findMany({
      orderBy: [
        { orderIndex: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  },

  // Získat aktivity podle kategorie
  getByCategory: async (category: 'legal' | 'illegal' | 'heist') => {
    return await prisma.activity.findMany({
      where: { category },
      orderBy: { orderIndex: 'asc' }
    })
  },

  // Vytvořit novou aktivitu
  create: async (data: {
    nazev: string
    popis: string
    riziko: string
    rizikoLevel: 'low' | 'medium' | 'high' | 'extreme'
    category: 'legal' | 'illegal' | 'heist'
    obrazek?: string
    icon?: string
    odmena?: string
    vzdalenost?: string
    cas?: string
    span?: number
    gradient?: string
    borderColor?: string
    glowColor?: string
    orderIndex?: number
  }) => {
    return await prisma.activity.create({
      data
    })
  },

  // Aktualizovat aktivitu
  update: async (id: number, data: any) => {
    return await prisma.activity.update({
      where: { id },
      data
    })
  },

  // Smazat aktivitu
  delete: async (id: number) => {
    return await prisma.activity.delete({
      where: { id }
    })
  },

  // Hromadná aktualizace pořadí
  updateOrder: async (items: Array<{ id: number; orderIndex: number }>) => {
    // Použij transaction pro atomické operace
    return await prisma.$transaction(
      items.map(item =>
        prisma.activity.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex }
        })
      )
    )
  }
}

// ============================================
// RULES OPERATIONS
// ============================================

export const rulesExamples = {
  // Získat všechny sekce s podsekacemi a pravidly
  getAllWithRelations: async () => {
    const sections = await prisma.ruleSection.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        subcategories: {
          orderBy: { orderIndex: 'asc' },
          include: {
            rules: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        },
        rules: {
          where: { subcategoryId: null },
          orderBy: { orderIndex: 'asc' }
        }
      }
    })
    
    return sections
  },

  // Vytvořit sekci
  createSection: async (data: {
    id: string
    title: string
    icon?: string
    orderIndex?: number
  }) => {
    return await prisma.ruleSection.upsert({
      where: { id: data.id },
      update: {
        title: data.title,
        icon: data.icon,
        orderIndex: data.orderIndex ?? 0
      },
      create: data
    })
  },

  // Vytvořit podsekci
  createSubcategory: async (data: {
    id: string
    sectionId: string
    title: string
    icon?: string
    orderIndex?: number
  }) => {
    return await prisma.ruleSubcategory.upsert({
      where: {
        sectionId_id: {
          sectionId: data.sectionId,
          id: data.id
        }
      },
      update: {
        title: data.title,
        icon: data.icon,
        orderIndex: data.orderIndex ?? 0
      },
      create: data
    })
  },

  // Vytvořit pravidlo
  createRule: async (data: {
    sectionId: string
    subcategoryId?: string
    content: string
    orderIndex?: number
  }) => {
    return await prisma.rule.create({
      data: {
        ...data,
        orderIndex: data.orderIndex ?? 0
      }
    })
  },

  // Aktualizovat pravidlo
  updateRule: async (id: number, data: {
    sectionId?: string
    subcategoryId?: string | null
    content?: string
    orderIndex?: number
  }) => {
    return await prisma.rule.update({
      where: { id },
      data
    })
  },

  // Smazat sekci (cascade smaže i related záznamy)
  deleteSection: async (id: string) => {
    return await prisma.ruleSection.delete({
      where: { id }
    })
  },

  // Smazat pravidlo
  deleteRule: async (id: number) => {
    return await prisma.rule.delete({
      where: { id }
    })
  }
}

// ============================================
// WHITELIST QUESTIONS OPERATIONS
// ============================================

export const whitelistQuestionsExamples = {
  // Získat všechny aktivní otázky
  getActive: async () => {
    return await prisma.whitelistQuestion.findMany({
      // where: { isActive: true }, // Pokud máš toto pole
      orderBy: [
        { orderIndex: 'asc' },
        { id: 'asc' }
      ]
    })
  },

  // Vytvořit otázku
  create: async (data: {
    question: string
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'email' | 'url'
    required: boolean
    placeholder?: string
    options?: any
    orderIndex?: number
  }) => {
    return await prisma.whitelistQuestion.create({
      data: {
        ...data,
        orderIndex: data.orderIndex ?? 0
      }
    })
  },

  // Aktualizovat otázku
  update: async (id: number, data: any) => {
    return await prisma.whitelistQuestion.update({
      where: { id },
      data
    })
  },

  // Smazat otázku
  delete: async (id: number) => {
    return await prisma.whitelistQuestion.delete({
      where: { id }
    })
  }
}

// ============================================
// STATISTICS & DASHBOARD
// ============================================

export const statsExamples = {
  // Dashboard statistiky
  getDashboardStats: async () => {
    const [
      totalUsers,
      pendingWhitelists,
      approvedWhitelists,
      rejectedWhitelists
    ] = await Promise.all([
      prisma.user.count(),
      prisma.whitelistRequest.count({ where: { status: 'pending' } }),
      prisma.whitelistRequest.count({ where: { status: 'approved' } }),
      prisma.whitelistRequest.count({ where: { status: 'rejected' } })
    ])

    return {
      totalUsers,
      pendingWhitelists,
      approvedWhitelists,
      rejectedWhitelists,
      totalWhitelists: pendingWhitelists + approvedWhitelists + rejectedWhitelists
    }
  },

  // Statistiky podle data
  getWhitelistsByDate: async (startDate: Date, endDate: Date) => {
    return await prisma.whitelistRequest.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        status: true
      }
    })
  }
}

// ============================================
// BACKUP LOGS
// ============================================

export const backupExamples = {
  // Vytvořit log zálohy
  create: async (data: {
    filename: string
    size: bigint
    status: 'success' | 'failed' | 'pending'
    message?: string
  }) => {
    return await prisma.backupLog.create({
      data
    })
  },

  // Získat poslední zálohy
  getRecent: async (limit: number = 10) => {
    return await prisma.backupLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }
}

// ============================================
// PHOTO CONTEST
// ============================================

export const photoContestExamples = {
  // Získat všechny příspěvky soutěže
  getAllEntries: async (contestId: number) => {
    return await prisma.photoContestEntry.findMany({
      where: { contestId },
      orderBy: { votes: 'desc' }
    })
  },

  // Vytvořit příspěvek
  createEntry: async (data: {
    userId: string
    imageUrl: string
    title: string
    description?: string
    contestId: number
  }) => {
    return await prisma.photoContestEntry.create({
      data: {
        ...data,
        status: 'pending',
        votes: 0
      }
    })
  },

  // Hlasovat
  vote: async (entryId: number, userId: string) => {
    // Použij transaction pro atomickou operaci
    return await prisma.$transaction(async (tx) => {
      // Zkontroluj, jestli uživatel už nehlasoval
      const existingVote = await tx.photoContestVote.findUnique({
        where: {
          entryId_userId: {
            entryId,
            userId
          }
        }
      })

      if (existingVote) {
        throw new Error('Already voted')
      }

      // Vytvoř hlas
      await tx.photoContestVote.create({
        data: {
          entryId,
          userId
        }
      })

      // Aktualizuj počet hlasů
      return await tx.photoContestEntry.update({
        where: { id: entryId },
        data: {
          votes: {
            increment: 1
          }
        }
      })
    })
  }
}

// ============================================
// RAW QUERIES (když potřebuješ SQL)
// ============================================

export const rawQueryExamples = {
  // Použij když Prisma neumí složitý dotaz
  customQuery: async () => {
    // SELECT
    const result = await prisma.$queryRaw`
      SELECT 
        u.id, 
        u.name, 
        COUNT(w.id) as request_count
      FROM user u
      LEFT JOIN whitelist_requests w ON u.id = w.user_id
      GROUP BY u.id, u.name
      HAVING request_count > 1
    `
    
    return result
  },

  // Execute (pro UPDATE, DELETE, INSERT)
  customExecute: async () => {
    const result = await prisma.$executeRaw`
      UPDATE activities 
      SET order_index = order_index + 1 
      WHERE category = 'legal'
    `
    
    return result
  }
}

export default {
  whitelistExamples,
  userExamples,
  activityExamples,
  rulesExamples,
  whitelistQuestionsExamples,
  statsExamples,
  backupExamples,
  photoContestExamples,
  rawQueryExamples
}
