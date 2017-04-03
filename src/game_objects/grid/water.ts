import * as Phaser from 'phaser'
import {GridCell} from "./grid_cell";
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class WaterCell extends GridCell {
	constructor(spr: IsoSprite, x: number, y: number) {
		super(spr, x, y);
		
		this.restingTint = 0x6688cc;
		this.restingZ = -3;
		this.blocksMove = true;
		this.blocksAttack = false;

		this.init();
	}
}