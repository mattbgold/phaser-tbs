import * as Phaser from 'phaser'
import {GridCell} from "./grid_cell";
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class WaterCell extends GridCell {
	constructor(spr: IsoSprite, x: number, y: number) {
		super(spr, x, y);
		
		this.restingZ = -3;
		this.restingTint = 0x4477DD;
		this.blocksMove = true;
		this.blocksAttack = false;

		this.init();
	}
}