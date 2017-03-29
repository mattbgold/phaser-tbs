import * as Phaser from 'phaser';
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class GridCell {
	x: number;
	y: number;
	spr: IsoSprite;
	hover: boolean;
	active: boolean;
	highlighted: boolean;
	
	constructor(spr: IsoSprite, x: number, y: number) {
		this.x = x;
		this.y = y;
		this.spr = spr;
	}
}