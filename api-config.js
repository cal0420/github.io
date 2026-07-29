"use strict";

/*
 * C4G Hub frontend API configuration
 *
 * This file must contain JavaScript only.
 * Do not place HTML such as <!doctype html> in this file.
 */

window.C4G_CONFIG = Object.freeze({
    API_BASE_URL: "https://c4g-api.onrender.com"
});

/*
 * Shared helper for authenticated API requests.
 * The credentials option is required so the browser sends
 * the secure session cookie created by the Render backend.
 */
window.c4gApiFetch = async function c4gApiFetch(path, options = {}) {
    const apiBaseUrl = window.C4G_CONFIG.API_BASE_URL.replace(/\/+$/, "");
    const requestPath = String(path || "").startsWith("/")
        ? String(path)
        : `/${String(path || "")}`;

    const headers = new Headers(options.headers || {});

    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type")
    ) {
        headers.set("Content-Type", "application/json");
    }

    return fetch(`${apiBaseUrl}${requestPath}`, {
        ...options,
        headers,
        credentials: "include"
    });
};
