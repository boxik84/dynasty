import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import database from "@/lib/db";
import { getDiscordRoles } from '@/lib/discord'; // Předpokládá existenci pomocné funkce

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Získání administrátorských oprávnění přímo
    const adminRoles = [
      process.env.DISCORD_VEDENI_ROLE_ID,
      process.env.DISCORD_DEVELOPER_ROLE_ID,
    ].filter(Boolean);
    
    const userDiscordRoles = await getDiscordRoles(session.user.id);
    const isAdmin = userDiscordRoles.some((roleId: string) => adminRoles.includes(roleId));

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Získání všech uživatelů s jejich účty a sezeními
    const usersResult = await database.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.image,
        u.emailVerified,
        u.createdAt,
        u.updatedAt,
        a.accountId as discordId,
        (SELECT COUNT(DISTINCT s.id) FROM session s WHERE s.userId = u.id AND s.expiresAt > NOW()) as activeSessions
      FROM user u
      LEFT JOIN account a ON u.id = a.userId AND a.providerId = 'discord'
      ORDER BY u.createdAt DESC
    `);
    
    const users = (usersResult[0] || []) as any[];

    // Získání Discord rolí pro každého uživatele
    const usersWithPermissions = await Promise.all(users.map(async (user: any) => {
      const discordRoles = user.discordId ? await getDiscordRoles(user.discordId, true) : [];
      
      const vedeniRoleId = process.env.DISCORD_VEDENI_ROLE_ID;
      const staffRoleId = process.env.DISCORD_STAFF_ROLE_ID;
      const developerRoleId = process.env.DISCORD_DEVELOPER_ROLE_ID;
      const blacklistedRoleId = process.env.DISCORD_BLACKLISTED_ROLE_ID;

      const permissions = {
        hasVedeniRole: vedeniRoleId && discordRoles.includes(vedeniRoleId),
        hasStaffRole: staffRoleId && discordRoles.includes(staffRoleId),
        hasDeveloperRole: developerRoleId && discordRoles.includes(developerRoleId),
        isAdmin: (vedeniRoleId && discordRoles.includes(vedeniRoleId)) || (developerRoleId && discordRoles.includes(developerRoleId)),
        isBlacklisted: blacklistedRoleId && discordRoles.includes(blacklistedRoleId),
      };

      return {
        ...user,
        activeSessions: Number(user.activeSessions) || 0,
        roles: discordRoles,
        permissions,
      };
    }));

    return NextResponse.json({ 
      users: usersWithPermissions,
      totalUsers: usersWithPermissions.length,
      activeUsers: usersWithPermissions.filter(u => u.activeSessions > 0).length,
      adminUsers: usersWithPermissions.filter(u => u.permissions.isAdmin).length,
      blacklistedUsers: usersWithPermissions.filter(u => u.permissions.isBlacklisted).length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : 'http://localhost:3000';
      
    const response = await fetch(`${baseUrl}/api/user/me`, {
      headers: { cookie: (await headers()).get('cookie') || '' }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await response.json();
    if (!userData.permissions?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Start transaction to delete user and all related data
    await database.execute('START TRANSACTION');

    try {
      // Get Discord ID before deleting accounts
      const discordIdResult = await database.execute('SELECT accountId FROM account WHERE userId = ? AND providerId = "discord"', [userId]);
      const discordRows = discordIdResult[0] as any[];
      const discordId = discordRows.length > 0 ? discordRows[0]?.accountId : null;
      
      // Delete user whitelist requests if has Discord ID
      if (discordId) {
        await database.execute('DELETE FROM whitelist_requests WHERE discord_id = ?', [discordId]);
      }
      
      // Delete user sessions
      await database.execute('DELETE FROM session WHERE userId = ?', [userId]);
      
      // Delete user accounts (social logins)
      await database.execute('DELETE FROM account WHERE userId = ?', [userId]);
      
      // Finally delete the user
      const deleteResult = await database.execute('DELETE FROM user WHERE id = ?', [userId]);
      
      await database.execute('COMMIT');

      if ((deleteResult[0] as any).affectedRows === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true,
        message: 'User and all related data deleted successfully'
      });

    } catch (error) {
      await database.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 