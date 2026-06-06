#include <stdio.h>
#include <stdbool.h>

#define N 9

// Function to print the 9x9 grid with clean formatting
void printGrid(int grid[N][N]) {
    for (int r = 0; r < N; r++) {
        if (r % 3 == 0 && r != 0) {
            printf("------+-------+------\n");
        }
        for (int c = 0; c < N; c++) {
            if (c % 3 == 0 && c != 0) {
                printf("| ");
            }
            if (grid[r][c] == 0) {
                printf(". ");
            } else {
                printf("%d ", grid[r][c]);
            }
        }
        printf("\n");
    }
}

// Check if a number can safely be assigned to a specific row, col
bool isValid(int grid[N][N], int row, int col, int num) {
    // Check row and column constraints
    for (int i = 0; i < N; i++) {
        if (grid[row][i] == num || grid[i][col] == num) {
            return false;
        }
    }

    // Check the local 3x3 sub-grid constraint
    int startRow = row - row % 3;
    int startCol = col - col % 3;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] == num) {
                return false;
            }
        }
    }

    return true; // Safe to place
}

// Backtracking solver algorithm
bool solveSudoku(int grid[N][N]) {
    int row = -1;
    int col = -1;
    bool isEmpty = false;

    // Find the first empty cell (represented by 0)
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            if (grid[i][j] == 0) {
                row = i;
                col = j;
                isEmpty = true;
                break;
            }
        }
        if (isEmpty) {
            break;
        }
    }

    // No empty space left means puzzle is solved successfully
    if (!isEmpty) {
        return true;
    }

    // Try placing numbers 1 through 9
    for (int num = 1; num <= 9; num++) {
        if (isValid(grid, row, col, num)) {
            grid[row][col] = num; // Assign tentatively

            if (solveSudoku(grid)) {
                return true; // Success path found
            }

            grid[row][col] = 0; // Backtrack/Undo assignment
        }
    }
    return false; // Triggers backtracking to try new variations
}

int main() {
    // Initial 0 values represent empty spaces to solve
    int grid[N][N] = {
        {5, 3, 0, 0, 7, 0, 0, 0, 0},
        {6, 0, 0, 1, 9, 5, 0, 0, 0},
        {0, 9, 8, 0, 0, 0, 0, 6, 0},
        {8, 0, 0, 0, 6, 0, 0, 0, 3},
        {4, 0, 0, 8, 0, 3, 0, 0, 1},
        {7, 0, 0, 0, 2, 0, 0, 0, 6},
        {0, 6, 0, 0, 0, 0, 2, 8, 0},
        {0, 0, 0, 4, 1, 9, 0, 0, 5},
        {0, 0, 0, 0, 8, 0, 0, 7, 9}
    };

    printf("--- Original Puzzle Grid ---\n");
    printGrid(grid);
    printf("\n");

    if (solveSudoku(grid)) {
        printf("--- Solved Puzzle Grid ---\n");
        printGrid(grid);
    } else {
        printf("No valid solution exists for this Sudoku puzzle grid.\n");
    }

    return 0;
}
