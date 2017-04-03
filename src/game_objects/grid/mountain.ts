import * as Phaser from 'phaser'
import {GridCell} from "./grid_cell";
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class MountainCell extends GridCell {
	constructor(spr: IsoSprite, x: number, y: number) {
		super(spr, x, y);
		
		this.restingTint = 0x777777;
		this.blocksMove = true;
		this.blocksAttack = true;
		this.restingZ = 18;

		this.init();
	}
}