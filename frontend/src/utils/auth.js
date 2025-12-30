export function getRole() {
    return String(localStorage.getItem("role") || "").toLowerCase();
}

export function isManager() {
    const r = getRole();
    return r === "admin" || r === "manager";
}

export function getToken() {
    return localStorage.getItem("token") || "";
}
