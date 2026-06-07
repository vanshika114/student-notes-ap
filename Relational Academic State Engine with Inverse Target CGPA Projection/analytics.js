import { getAcademicState, GRADE_MAPPING, getCurrentCgpa, getTotalCredits, getTotalPoints } from './state.js';

export function getSemesterCount() {
    return getAcademicState().length;
}

export function getCourseCount() {
    return getAcademicState().reduce((sum, semester) => sum + semester.courses.length, 0);
}

export function getGradeDistribution() {
    const buckets = Object.keys(GRADE_MAPPING).reduce((acc, grade) => {
        acc[grade] = 0;
        return acc;
    }, {});

    const courses = getAcademicState().flatMap(semester => semester.courses);
    courses.forEach(course => {
        const grade = course.grade;
        if (buckets[grade] !== undefined) {
            buckets[grade] += 1;
        }
    });

    const total = courses.length;
    return {
        total,
        buckets,
        breakdown: Object.entries(buckets).map(([grade, count]) => ({
            grade,
            count,
            percentage: total > 0 ? count / total : 0,
            score: GRADE_MAPPING[grade]
        }))
    };
}

function projectCumulativeCgpa(remainingCredits, targetGrade) {
    const currentCredits = getTotalCredits();
    const currentPoints = getTotalPoints();
    if (remainingCredits <= 0) {
        return getCurrentCgpa();
    }
    const futurePoints = remainingCredits * targetGrade;
    return (currentPoints + futurePoints) / (currentCredits + remainingCredits);
}

export function getScenarioSummary(remainingCredits) {
    return {
        bestCase: projectCumulativeCgpa(remainingCredits, 10),
        strongCase: projectCumulativeCgpa(remainingCredits, 9),
        safeCase: projectCumulativeCgpa(remainingCredits, 7)
    };
}
