export const GRADE_MAPPING = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 4, F: 0 };
const STORAGE_KEY = 'academic_state';

const defaultState = [
    {
        id: 'sem_1',
        name: 'Semester 1',
        courses: [
            { id: 'c_1', name: 'Engineering Math', credits: 4, grade: 'S' },
            { id: 'c_2', name: 'AI/ML Introduction', credits: 3, grade: 'A' }
        ]
    }
];

let academicState = loadState();

function loadState() {
    try {
        const payload = localStorage.getItem(STORAGE_KEY);
        return payload ? JSON.parse(payload) : JSON.parse(JSON.stringify(defaultState));
    } catch (error) {
        console.warn('Could not parse academic state from storage:', error);
        return JSON.parse(JSON.stringify(defaultState));
    }
}

export function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(academicState));
}

export function getAcademicState() {
    return academicState;
}

export function setAcademicState(state) {
    if (!Array.isArray(state)) return;
    academicState = state;
    saveState();
}

export function clearAcademicState() {
    academicState = JSON.parse(JSON.stringify(defaultState));
    saveState();
}

export function createSemesterBlock() {
    academicState.push({
        id: `sem_${Date.now()}`,
        name: `Semester ${academicState.length + 1}`,
        courses: []
    });
    saveState();
}

export function deleteSemesterBlock(index) {
    if (!academicState[index]) return;
    academicState.splice(index, 1);
    saveState();
}

export function addCourseRow(semIndex) {
    if (!academicState[semIndex]) return;
    academicState[semIndex].courses.push({
        id: `c_${Date.now()}`,
        name: 'New Course',
        credits: 3,
        grade: 'S'
    });
    saveState();
}

export function deleteCourseRow(semIndex, courseIndex) {
    if (!academicState[semIndex] || !academicState[semIndex].courses[courseIndex]) return;
    academicState[semIndex].courses.splice(courseIndex, 1);
    saveState();
}

export function updateCourseField(semIndex, courseIndex, field, value) {
    if (!academicState[semIndex] || !academicState[semIndex].courses[courseIndex]) return;
    academicState[semIndex].courses[courseIndex][field] = field === 'credits' ? Number(value) : value;
    saveState();
}

export function getSemesterCount() {
    return academicState.length;
}

export function getCourseCount() {
    return academicState.reduce((sum, semester) => sum + semester.courses.length, 0);
}

export function getTotalCredits() {
    return academicState.reduce((semesterSum, semester) => {
        return semesterSum + semester.courses.reduce((courseSum, course) => courseSum + (Number(course.credits) || 0), 0);
    }, 0);
}

export function getTotalPoints() {
    return academicState.reduce((semesterSum, semester) => {
        return semesterSum + semester.courses.reduce((courseSum, course) => {
            const points = GRADE_MAPPING[course.grade] || 0;
            return courseSum + (Number(course.credits) || 0) * points;
        }, 0);
    }, 0);
}

export function getCurrentCgpa() {
    const totalCredits = getTotalCredits();
    if (totalCredits === 0) return 0;
    return getTotalPoints() / totalCredits;
}

export function getSemesterName(index) {
    return academicState[index]?.name || `Semester ${index + 1}`;
}
