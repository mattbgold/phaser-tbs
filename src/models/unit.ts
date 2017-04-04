import {Stats} from "./stats";

export interface Unit {
	name: string;
	asset: string;

	belongsToPlayer?: number;

	x?: number;
	y?: number;

	stats?: Stats

	abilities?: any[];
}