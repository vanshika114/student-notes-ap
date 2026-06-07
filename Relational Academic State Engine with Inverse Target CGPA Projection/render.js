import {
    GRADE_MAPPING,
    getAcademicState,
    getTotalCredits,
    getSemesterCount,
    getCourseCount,
    getCurrentCgpa,
    addCourseRow,
    deleteCourseRow,
    deleteSemesterBlock,
    updateCourseField
} from './state.js';
import { validateTargetInputs, createTargetMessage } from './projection.js';
import { getGradeDistribution, getScenarioSummary } from './analytics.js';
import { formatNumber } from './utils.js';

function createCourseRowHTML(semesterIndex, courseIndex, course) {
    const gradeSelect = ['S', 'A', 'B', 'C', 'D', 'E', 'F']
        .map(grade => `<option value="${grade}" ${course.grade === grade ? 'selected' : ''}>${grade}</option>`)
        .join('');

    return `
        <div class="course-row" data-sem-index="${semesterIndex}" data-course-index="${courseIndex}">
            <input type="text" value="${course.name}" data-field="name" placeholder="Course name" />
            <input type="number" min="0" step="1" value="${course.credits}" data-field="credits" />
            <select data-field="grade">${gradeSelect}</select>
            <button type="button" class="delete-course">Delete</button>
        </div>
    `;
}

function renderGradeDistribution() {
    const distribution = getGradeDistribution();
    if (distribution.total === 0) {
        return `<p class="empty-distribution">No grades available yet. Add courses to visualize grade distribution.</p>`;
    }

    return distribution.breakdown
        .map(({ grade, count, percentage }) => `
            <div class="grade-bar">
                <div class="grade-meta">
                    <span class="grade-label">${grade}</span>
                    <span class="grade-count">${count}</span>
                </div>
                <div class="grade-track">
                    <div class="grade-fill" style="width: ${percentage * 100}%;"></div>
                </div>
            </div>
        `)
        .join('');
}

export function renderDashboard() {
    const academicState = getAcademicState();
    const currentCgpa = getCurrentCgpa();
    const totalCredits = getTotalCredits();
    const remainingCredits = parseInt(document.getElementById('input-remaining-credits').value, 10);
    const scenario = getScenarioSummary(Number.isNaN(remainingCredits) ? 0 : remainingCredits);

    document.getElementById('display-cgpa').innerText = formatNumber(currentCgpa);
    document.getElementById('display-total-credits').innerText = totalCredits;
    document.getElementById('display-semester-count').innerText = getSemesterCount();
    document.getElementById('display-course-count').innerText = getCourseCount();
    document.getElementById('display-best-case-cgpa').innerText = formatNumber(scenario.bestCase);
    document.getElementById('display-best-case-cgpa-scenario').innerText = formatNumber(scenario.bestCase);
    document.getElementById('display-strong-case-cgpa').innerText = formatNumber(scenario.strongCase);
    document.getElementById('display-safe-case-cgpa').innerText = formatNumber(scenario.safeCase);
    document.getElementById('display-safe-case-cgpa-scenario').innerText = formatNumber(scenario.safeCase);
    document.getElementById('grade-distribution').innerHTML = renderGradeDistribution();

    const targetCgpa = parseFloat(document.getElementById('input-target-cgpa').value);
    const targetStatus = validateTargetInputs(targetCgpa, remainingCredits)
        ? createTargetMessage(currentCgpa, totalCredits, targetCgpa, remainingCredits)
        : 'Enter valid parameters to compile prediction matrices.';

    document.getElementById('projection-output').innerHTML = targetStatus;

    const matrixContainer = document.getElementById('semester-matrix-container');
    matrixContainer.innerHTML = academicState
        .map((semester, semIndex) => {
            const semCredits = semester.courses.reduce((sum, course) => sum + (Number(course.credits) || 0), 0);
            const semPoints = semester.courses.reduce((sum, course) => {
                const gradePoints = GRADE_MAPPING[course.grade] || 0;
                return sum + (Number(course.credits) || 0) * gradePoints;
            }, 0);
            const sgpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';
            const courseRows = semester.courses
                .map((course, courseIndex) => createCourseRowHTML(semIndex, courseIndex, course))
                .join('');

            return `
                <div class="semester-card" data-id="${semester.id}">
                    <header>
                        <div>
                            <h3>${semester.name}</h3>
                            <p>SGPA: ${sgpa}</p>
                        </div>
                    </header>
                    <div class="courses-list">${courseRows}</div>
                    <div class="semester-actions">
                        <button type="button" class="secondary add-course" data-sem-index="${semIndex}">+ Add Course</button>
                        <button type="button" class="danger delete-semester" data-sem-index="${semIndex}">Delete Semester</button>
                    </div>
                </div>
            `;
        })
        .join('');
}

export function attachMatrixDelegation() {
    const matrixContainer = document.getElementById('semester-matrix-container');

    matrixContainer.addEventListener('input', event => {
        const field = event.target.dataset.field;
        if (!field) return;

        const row = event.target.closest('.course-row');
        if (!row) return;

        const semIndex = Number(row.dataset.semIndex);
        const courseIndex = Number(row.dataset.courseIndex);

        updateCourseField(semIndex, courseIndex, field, event.target.value);
        renderDashboard();
    });

    matrixContainer.addEventListener('click', event => {
        const target = event.target;
        if (target.matches('.delete-course')) {
            const row = target.closest('.course-row');
            deleteCourseRow(Number(row.dataset.semIndex), Number(row.dataset.courseIndex));
            renderDashboard();
            return;
        }

        if (target.matches('.add-course')) {
            addCourseRow(Number(target.dataset.semIndex));
            renderDashboard();
            return;
        }

        if (target.matches('.delete-semester')) {
            deleteSemesterBlock(Number(target.dataset.semIndex));
            renderDashboard();
        }
    });
}
