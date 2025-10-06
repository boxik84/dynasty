const WEBHOOK_URL = "https://discord.com/api/webhooks/1372661715610767401/wisOzzpHWXYJr5IhwtQD2M39c9IRRYnDESX0Sw2Ei8G9-V8FubfTPip7yM6OazaK-324";
// Whitelist webhook URL disabled
// const WHITELIST_WEBHOOK_URL = "https://discord.com/api/webhooks/1383036570684227584/2LZ1ldxVuC4Nrdnt496O2S3OXnl2DScCpf7QiVlt_vk8ye0G-R9GDyuV8ctJcgsnUjRt";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_WHITELIST_ROLE_ID = process.env.DISCORD_WHITELIST_ROLE_ID!;
const DISCORD_WAITING_ROLE_ID = process.env.DISCORD_WAITING_ROLE_ID!;

export async function sendDiscordLog({ title, description, fields = [] }: {
  title: string,
  description?: string,
  fields?: { name: string, value: string, inline?: boolean }[]
}) {
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title,
            description,
            color: 0x3498db,
            fields,
            timestamp: new Date().toISOString(),
          }
        ]
      })
    });
  } catch (e) {
    console.error("Nepodařilo se odeslat Discord log:", e);
  }
}

// Pošle notifikaci o schválení/odmítnutí whitelist žádosti
export async function sendWhitelistNotification({
  type,
  discordId,
  serialNumber,
  playerName,
  approvedBy
}: {
  type: 'approved' | 'rejected',
  discordId: string,
  serialNumber: string,
  playerName?: string,
  approvedBy?: string
}) {
  // Webhooky pro whitelist notifikace jsou vypnuté
  console.log(`Discord webhook pro whitelist je deaktivovaný (type=${type}, discordId=${discordId}, serial=${serialNumber}, approvedBy=${approvedBy})`);
}

// Odebere waiting roli Discord uživateli
export async function removeWaitingRole(discordId: string): Promise<boolean> {
  try {
    console.log(`Odebírám waiting roli uživateli ${discordId}`);
    console.log(`Waiting Role ID: ${DISCORD_WAITING_ROLE_ID}`);
    
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}/roles/${DISCORD_WAITING_ROLE_ID}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
          "X-Audit-Log-Reason": "Automatické odebrání waiting role po schválení whitelist žádosti"
        }
      }
    );

    if (response.ok || response.status === 204) {
      console.log(`✅ Waiting role úspěšně odebrána uživateli ${discordId}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Chyba při odebírání waiting role (${response.status}):`, errorText);
      
      if (response.status === 403) {
        console.error("Bot nemá oprávnění 'Manage Roles'");
      } else if (response.status === 404) {
        console.error("Uživatel nemá waiting roli nebo role neexistuje");
      }
      
      return false;
    }
  } catch (error) {
    console.error("❌ Kritická chyba při odebírání waiting role:", error);
    return false;
  }
}

// Přidá waiting roli Discord uživateli
export async function addWaitingRole(discordId: string): Promise<boolean> {
  try {
    console.log(`Přidávám waiting roli uživateli ${discordId}`);
    console.log(`Waiting Role ID: ${DISCORD_WAITING_ROLE_ID}`);

    // Ověřit, že je členem guildy
    const memberResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      {
        headers: {
          "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
        }
      }
    );

    if (!memberResponse.ok) {
      const memberError = await memberResponse.text();
      console.error(`Uživatel ${discordId} nebyl nalezen na serveru (${memberResponse.status}):`, memberError);
      return false;
    }

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}/roles/${DISCORD_WAITING_ROLE_ID}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
          "X-Audit-Log-Reason": "Automatické přidání waiting role při změně statusu na pending",
          "Content-Length": "0"
        }
      }
    );

    if (response.ok || response.status === 204) {
      console.log(`✅ Waiting role úspěšně přidána uživateli ${discordId}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Chyba při přidávání waiting role (${response.status}):`, errorText);
      if (response.status === 403) {
        console.error("Bot nemá oprávnění 'Manage Roles' nebo nemá dostatečně vysokou roli");
      } else if (response.status === 404) {
        console.error("Uživatel nebo role nebyla nalezena");
      }
      return false;
    }
  } catch (error) {
    console.error("❌ Kritická chyba při přidávání waiting role:", error);
    return false;
  }
}

// Přidá whitelist roli Discord uživateli
export async function addWhitelistRole(discordId: string): Promise<boolean> {
  try {
    console.log(`Přidávám whitelist roli uživateli ${discordId}`);
    console.log(`Guild ID: ${DISCORD_GUILD_ID}`);
    console.log(`Role ID: ${DISCORD_WHITELIST_ROLE_ID}`);
    
    // Nejdřív zkontrolujeme, jestli uživatel existuje na serveru
    const memberResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      {
        headers: {
          "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
        }
      }
    );

    if (!memberResponse.ok) {
      const memberError = await memberResponse.text();
      console.error(`Uživatel ${discordId} nebyl nalezen na serveru (${memberResponse.status}):`, memberError);
      return false;
    }

    // Přidáme roli
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}/roles/${DISCORD_WHITELIST_ROLE_ID}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
          "X-Audit-Log-Reason": "Automatické přidání whitelist role po schválení žádosti"
        }
      }
    );

    if (response.ok || response.status === 204) {
      console.log(`✅ Whitelist role úspěšně přidána uživateli ${discordId}`);
      
      // Po úspěšném přidání whitelist role odebereme waiting roli
      const waitingRemoved = await removeWaitingRole(discordId);
      console.log(`Waiting role odebrána: ${waitingRemoved}`);
      
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Chyba při přidávání whitelist role (${response.status}):`, errorText);
      
      // Pokusíme se získat více informací o chybě
      if (response.status === 403) {
        console.error("Bot nemá oprávnění 'Manage Roles' nebo má nižší roli než ta, kterou se snaží přidat");
      } else if (response.status === 404) {
        console.error("Uživatel nebo role nebyla nalezena");
      }
      
      return false;
    }
  } catch (error) {
    console.error("❌ Kritická chyba při přidávání whitelist role:", error);
    return false;
  }
}

// Odebere whitelist roli Discord uživateli (pro případ odmítnutí)
export async function removeWhitelistRole(discordId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}/roles/${DISCORD_WHITELIST_ROLE_ID}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
          "X-Audit-Log-Reason": "Automatické odebrání whitelist role po odmítnutí žádosti"
        }
      }
    );

    if (response.ok || response.status === 204) {
      console.log(`Whitelist role úspěšně odebrána uživateli ${discordId}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Chyba při odebírání role (${response.status}):`, errorText);
      return false;
    }
  } catch (error) {
    console.error("Chyba při odebírání whitelist role:", error);
    return false;
  }
} 