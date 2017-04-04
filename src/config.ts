import {Unit} from "./models/unit";

export interface GameConfig {
	cellSize: number;
	units: {[key:string]: Unit};
	maps: MapLayout[];
};

export interface MapLayout {
	name: string;
	armies: string[][];
	layout: string[][];
}

export function getConfig(): GameConfig {
	return {
		cellSize: 38,
		maps: [{
			name: 'demo',
			armies: [
				['scout', 'scout', 'scout', 'assault', 'assault', 'assault', 'assault'],
				['scout', 'tank', 'tank', 'scout']
			],
			layout: [
				['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],

				['W', ' ', ' ', ' ', '1', '1', '1', '1', ' ', ' ', ' ', 'W'],

				['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],

				['W', 'B', 'W', 'W', ' ', ' ', 'M', ' ', ' ', ' ', ' ', 'W'],

				['W', ' ', ' ', 'W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],

				['W', ' ', ' ', 'W', 'W', 'B', 'B', 'W', 'W', ' ', ' ', 'W'],

				['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', ' ', ' ', 'W'],

				['W', ' ', ' ', 'M', 'M', ' ', ' ', ' ', 'W', 'B', 'W', 'W'],

				['W', ' ', ' ', 'M', 'M', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],

				['W', ' ', ' ', ' ', ' ', '0', '0', '0', ' ', ' ', ' ', 'W'],

				['W', ' ', ' ', ' ', '0', '0', '0', '0', ' ', ' ', ' ', 'W'],

				['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
			]
		}],
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