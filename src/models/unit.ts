export interface Unit {
	name: string;
	asset: string; //TODO: move to VisibleGameElement abstraction?

	x: number;
	y: number;

	attack?: number;
	defense?: number;
	speed?: number;
	hp?:number;

	abilities?: any[];
}