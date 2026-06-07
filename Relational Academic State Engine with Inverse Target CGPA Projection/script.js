import { renderDashboard, attachMatrixDelegation } from './render.js';
import { createSemesterBlock } from './state.js';
import { downloadStateJson, loadStateFromFile, resetAcademicState } from './io.js';

function initApp() {
    renderDashboard();
    attachMatrixDelegation();

    document.getElementById('btn-add-semester').addEventListener('click', () => {
        createSemesterBlock();
        renderDashboard();
    });

    document.getElementById('input-target-cgpa').addEventListener('input', renderDashboard);
    document.getElementById('input-remaining-credits').addEventListener('input', renderDashboard);

    document.getElementById('btn-export').addEventListener('click', downloadStateJson);

    const importFileInput = document.getElementById('import-file');
    document.getElementById('btn-import').addEventListener('click', () => importFileInput.click());

    importFileInput.addEventListener('change', async event => {
        const file = event.target.files?.[0];
        const status = document.getElementById('import-status');
        status.textContent = '';

        if (!file) {
            status.textContent = 'No file selected.';
            return;
        }

        try {
            await loadStateFromFile(file);
            renderDashboard();
            status.textContent = 'Import successful.';
        } catch (error) {
            status.textContent = `Import failed: ${error.message}`;
        }

        importFileInput.value = '';
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        if (!window.confirm('Reset the academic state to the default starter semester?')) return;
        resetAcademicState();
        renderDashboard();
    });
}

window.addEventListener('DOMContentLoaded', initApp);
