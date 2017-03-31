import {Unit} from "./models/unit";

export interface GameConfig {
	gridSizeX: number;
	gridSizeY: number;
	cellSize: number;
	units: {[key:string]: Unit};
	army: string[];
};

export function getConfig(): GameConfig {
	return {
		gridSizeX: 10,
		gridSizeY: 8,
		cellSize: 38,
		army: ['scout', 'scout', 'assault', 'tank'],
		units: {
			'scout': {
				name: 'scout',
				asset: 'unit_scout',
				stats: {
					attack: 2,
					armor: 0,
					hp: 4,
					mov: 5,
					range: 3,
					sight: 5,
					cost: 2
				},
			},
			'assault': {
				name: 'assault',
				asset: 'unit_assault',
				stats: {
					attack: 3,
					armor: 0,
					hp: 5,
					mov: 3,
					range: 3,
					sight: 4,
					cost: 3
				},
			},
			'tank': {
				name: 'tank',
				asset: 'unit_tank',
				stats: {
					attack: 3,
					armor: 2,
					hp: 4,
					mov: 4,
					range: 5,
					sight: 3,
					cost: 6
				},
			}
		}
	};
}