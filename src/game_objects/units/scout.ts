import * as Phaser from 'phaser';
import {BaseUnit} from "./base";
import {Unit} from "../../models/unit";
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class ScoutUnit extends BaseUnit {
	constructor(model: Unit, spr: IsoSprite) {
		super(model, spr);
	}
}