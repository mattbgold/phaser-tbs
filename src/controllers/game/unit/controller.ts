import * as Phaser from 'phaser';
import Game = Phaser.Game;
import {Unit} from "../../../models/unit";
import {BaseUnit} from "../../../game_objects/unit";
import {GameController} from "../controller";

export class UnitController {
	constructor(private _ctrl: GameController) {
	}

	create(unit: Unit): BaseUnit {
		let spr = this._ctrl.game.add.isoSprite(unit.x*this._ctrl.config.cellSize, unit.y*this._ctrl.config.cellSize, 0, unit.asset, 0);
		let unitObj = new BaseUnit(unit, spr);
		return unitObj;
	}

	move(unit: BaseUnit, x, y): void {
		unit.setXPosition(x);
		
		var movementX = this._ctrl.game.add.tween(unit.spr)
			.to({ isoX: x * this._ctrl.config.cellSize }, Math.abs(unit.x - x)*150, Phaser.Easing.Quadratic.InOut);

		movementX.onComplete.add(() => unit.setYPosition(y), this);

		var movementY = this._ctrl.game.add.tween(unit.spr)
			.to({ isoY: y * this._ctrl.config.cellSize }, Math.abs(unit.y - y)*150, Phaser.Easing.Quadratic.InOut, false, 200);

		movementX.chain(movementY).start();
	}
}