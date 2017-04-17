import * as Phaser from 'phaser';
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;
import {Cell} from "../../models/cell";

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
	
	constructor(spr: IsoSprite, model: Cell) {
		this.spr = spr;
		
		this._init(model);
	}
	
	private _init(model: Cell): void {
		this.blocksAttack = model.blocksAttack;
		this.blocksMove = model.blocksMove;
		this.restingTint = model.restingTint;
		this.spr.tint = model.restingTint;
		this.restingZ = model.restingZ;
		this.spr.isoZ = model.restingZ;
		
		this.x = model.x;
		this.y = model.y;
	}
}