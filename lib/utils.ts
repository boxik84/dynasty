import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to check if user has whitelist management permissions
export function hasWhitelistPermissions(userRoles: string[]): boolean {
  const whitelistAdderRole = process.env.DISCORD_WHITELIST_ADDER_ROLE_ID;
  const headWhitelistAdderRole = process.env.DISCORD_HEAD_WHITELIST_ADDER_ROLE_ID;
  const trialWhitelistAdderRole = process.env.DISCORD_TRIAL_WHITELIST_ADDER_ROLE_ID;
  const vedeniRole = process.env.DISCORD_VEDENI_ROLE_ID;
  const staffRole = process.env.DISCORD_STAFF_ROLE_ID;
  // Developer role NENÍ zahrnutá - jak požadováno

  console.log('hasWhitelistPermissions check:', {
    userRoles,
    requiredRoles: {
      whitelistAdderRole,
      headWhitelistAdderRole,
      trialWhitelistAdderRole,
      vedeniRole,
      staffRole
    }
  });

  const hasPermissions = userRoles.some(role =>
    role === whitelistAdderRole ||
    role === headWhitelistAdderRole ||
    role === trialWhitelistAdderRole ||
    role === vedeniRole ||
    role === staffRole
  );

  console.log('hasWhitelistPermissions result:', hasPermissions);

  return hasPermissions;
}