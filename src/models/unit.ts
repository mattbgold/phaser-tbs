export interface Unit {
	name: string;
	asset: string;

	x: number;
	y: number;

	attack?: number;
	defense?: number;
	speed?: number;
	hp?:number;

	abilities?: any[];
}