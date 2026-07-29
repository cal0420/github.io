const DISCORD_INVITE_URL = "https://discord.gg/c4ghub";

document.querySelectorAll("[data-discord]").forEach((link) => {
    link.href = DISCORD_INVITE_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
});
