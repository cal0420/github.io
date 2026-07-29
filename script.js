const DISCORD_INVITE_URL = "https://discord.gg/c4ghub";

document.querySelectorAll("[data-discord]").forEach(link => {
    link.addEventListener("click", () => {
        link.href = DISCORD_INVITE_URL;
    });
});
