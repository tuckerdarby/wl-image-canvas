// Image dimensions
export const IMAGE_WIDTH = 150;
export const IMAGE_HEIGHT = 150;
export const INIT_IMAGE_X = 100;
export const INIT_IMAGE_Y = 100;

// Variations
export const IMAGE_VARIATION_DIFF = 175;
export const VARIATION_DIFFS: Record<number, number[]> = {
    0: [IMAGE_VARIATION_DIFF, 0],
    1: [0, IMAGE_VARIATION_DIFF],
    2: [-IMAGE_VARIATION_DIFF, 0],
    3: [0, -IMAGE_VARIATION_DIFF],
};
export const NUM_VARIATIONS = 4;

// Sorting
export const GRID_GAP = 20;
export const MARGIN_HEIGHT = 150;
export const MARGIN_WIDTH = 150;

// Duplicates
export const DUPLICATE_DIFF_X = 50;
export const DUPLICATE_DIFF_Y = 50;
