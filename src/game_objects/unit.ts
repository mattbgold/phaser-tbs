import * as Phaser from 'phaser';
import {Unit} from "../models/unit";
import Sprite = Phaser.Sprite;
import Game = Phaser.Game;
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;
import {TbsController} from "../controllers/TbsController";

export class BaseUnit //implements Unit
{
	private _spr: IsoSprite;

	constructor(private _model: Unit, private _ctrl: TbsController) {
		this._spr = _ctrl.game.add.isoSprite(_model.x*_ctrl.gridSize, _model.y*_ctrl.gridSize, 0, _model.asset, 0);
		this._spr.anchor.set(.5, .7);
	}

	setPosition(x, y): void {
		this._spr.scale.x = Math.sign(this._model.x - x)

		var movementX = this._ctrl.game.add.tween(this._spr)
			.to({ isoX: x * this._ctrl.gridSize }, Math.abs(this._model.x - x)*150, Phaser.Easing.Quadratic.InOut);

		movementX.onComplete.add(_ => {
			this._spr.scale.x = Math.sign(y - this._model.y) || 1
			this._model.x = x;
			this._model.y = y;
		} , this);
		
		var movementY = this._ctrl.game.add.tween(this._spr)
			.to({ isoY: y * this._ctrl.gridSize }, Math.abs(this._model.y - y)*150, Phaser.Easing.Quadratic.InOut, false, 200);

		movementX.chain(movementY).start();
	}
}