import * as Phaser from 'phaser'
import {GridCell} from "./grid_cell";
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class BridgeCell extends GridCell {
	constructor(spr: IsoSprite, x: number, y: number) {
		super(spr, x, y);
		
		this.restingTint = 0x9b7d4d;
		this.restingZ = 2;
		
		this.init();
	}
}