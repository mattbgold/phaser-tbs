import {Stats} from "./stats";

export interface Unit {
	name: string;
	asset: string;

	x: number;
	y: number;

	stats?: Stats

	abilities?: any[];
}