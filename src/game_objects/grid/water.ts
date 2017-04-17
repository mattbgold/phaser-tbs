import * as Phaser from 'phaser'
import {GridCell} from "./grid_cell";
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;
import {Cell} from "../../models/cell";

export class WaterCell extends GridCell {
	constructor(spr: IsoSprite, model: Cell) {
		super(spr, model);
	}
}