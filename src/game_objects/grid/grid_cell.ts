import * as Phaser from 'phaser';
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class GridCell {
	x: number;
	y: number;
	spr: IsoSprite;
	hover: boolean;
	active: boolean;
	highlighted: boolean;
	blocksMove: boolean;
	blocksAttack: boolean;
	
	pathFromActiveCell: string[] = [];
	
	restingZ: number = 0;
	restingTint: number = 0xffffff;
	
	constructor(spr: IsoSprite, x: number, y: number) {
		this.x = x;
		this.y = y;
		this.spr = spr;
	}
	
	protected init(): void {
		this.spr.tint = this.restingTint;
		this.spr.isoZ = this.restingZ;
	}
}