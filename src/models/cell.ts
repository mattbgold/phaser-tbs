export interface Cell {
	name: string;
	asset: string;
	blocksMove: boolean;
	blocksAttack: boolean;
	restingTint: number;
	restingZ: number;
	x?: number;
	y?: number;
}