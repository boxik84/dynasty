export type SiteConfig = typeof siteConfig

export const siteConfig = {
    name: "Dynasty RP",
    description: "Dynasty - Nejlepší CZ/SK FiveM Roleplay server",
    url: "https://dynasty-rp.cz/",
    ogImage: "https://dynasty-rp.cz/banner.png",
    keywords: [
        "Dynasty",
        "FiveM",
        "Roleplay",
        "CZ/SK",
        "GTA RP",
        "FiveM Server",
    ],
    links: {
        home: "/",
        discord: "https://discord.gg/dynasty", // Nahraď skutečným linkem
        github: "https://github.com/boxik84/dynasty",
        login: "/sign-in",
        register: "/sign-up",
        dashboard: "/dashboard",
        fivem: "fivem://connect/cfx.re/join/XXXXX", // Nahraď skutečným FiveM connect linkem
    },
}
