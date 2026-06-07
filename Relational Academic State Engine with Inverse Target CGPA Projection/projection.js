import { isPositiveInteger, formatNumber } from './utils.js';

export function validateTargetInputs(targetCgpa, remainingCredits) {
    if (Number.isNaN(targetCgpa) || targetCgpa < 0 || targetCgpa > 10) return false;
    if (!isPositiveInteger(remainingCredits)) return false;
    return true;
}

export function computeRequiredFutureGpa(currentCgpa, currentCredits, targetCgpa, remainingCredits) {
    const currentPoints = currentCgpa * currentCredits;
    const totalFutureCredits = currentCredits + remainingCredits;
    const totalRequiredPoints = targetCgpa * totalFutureCredits;
    const neededPoints = totalRequiredPoints - currentPoints;
    return neededPoints / remainingCredits;
}

export function createTargetMessage(currentCgpa, currentCredits, targetCgpa, remainingCredits) {
    if (!validateTargetInputs(targetCgpa, remainingCredits)) {
        return 'Enter valid parameters to compile prediction matrices.';
    }

    if (remainingCredits === 0) {
        return targetCgpa <= currentCgpa
            ? `🎉 Secured: Target is already met with current CGPA of <strong>${formatNumber(currentCgpa)}</strong>.`
            : `⚠️ Impossible State: No remaining credits available to change CGPA from <strong>${formatNumber(currentCgpa)}</strong> to <strong>${formatNumber(targetCgpa)}</strong>.`;
    }

    const requiredFutureGpa = computeRequiredFutureGpa(currentCgpa, currentCredits, targetCgpa, remainingCredits);
    if (requiredFutureGpa > 10.0) {
        return `⚠️ Impossible State: Requires a future GPA of <strong>${formatNumber(requiredFutureGpa)}</strong> (Exceeds maximum cap of 10.0).`;
    }

    if (requiredFutureGpa <= 0.0) {
        return '🎉 Secured: Target is fully safe. You require a minimum future performance threshold of <strong>0.00</strong>.';
    }

    return `🎯 Target Balance: You must maintain an average of minimum <strong>${formatNumber(requiredFutureGpa)}</strong> across the remaining ${remainingCredits} credits to lock your goal.`;
}
