export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function formatNumber(value, decimals = 2) {
    return Number.isFinite(value) ? value.toFixed(decimals) : '0.00';
}

export function isPositiveInteger(value) {
    return Number.isInteger(value) && value >= 0;
}
