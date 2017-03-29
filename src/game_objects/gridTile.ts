import * as Phaser from 'phaser';
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class GridTile {
	x: number;
	y: number;
	spr: IsoSprite;
	
	constructor(spr: IsoSprite, x: number, y: number) {
		this.x = x;
		this.y = y;
		this.spr = spr;
	}
}