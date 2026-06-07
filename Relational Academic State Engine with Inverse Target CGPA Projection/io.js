import { getAcademicState, setAcademicState, clearAcademicState } from './state.js';

export function exportStateJson() {
    return JSON.stringify(getAcademicState(), null, 2);
}

export function downloadStateJson() {
    const json = exportStateJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'academic-state.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

export function loadStateFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                if (!Array.isArray(parsed)) {
                    throw new Error('Imported file must contain a state array.');
                }
                setAcademicState(parsed);
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read the selected file.'));
        reader.readAsText(file);
    });
}

export function resetAcademicState() {
    clearAcademicState();
}
