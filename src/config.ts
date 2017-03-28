export interface GameConfig {
	gridSizeX: number;
	gridSizeY: number;
	cellSize: number;
};

export function getConfig(): GameConfig {
	return {
		gridSizeX: 10,
		gridSizeY: 8,
		cellSize: 38
	};
}