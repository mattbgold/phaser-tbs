import * as Phaser from 'phaser';
import {IArmyCommandStrategy} from "./interface";
import {GameController} from "../../controllers/game/controller";
import Game = Phaser.Game;
import {GameStateManager} from "../state/game/service";
import {BaseUnit} from "../../game_objects/units/base";
import {InputStateManager, InputEvent} from "../state/input/service";
import Point3 = Phaser.Plugin.Isometric.Point3;
import {GameConfig} from "../../config";

export class DemoArmyCommandStrategy implements IArmyCommandStrategy {

	private _myUnits: BaseUnit[];

	constructor(
		private _playerNum: number, 
		private _gameState: GameStateManager,
	    private _inputState: InputStateManager,
	    private _config: GameConfig
	) {
		this._myUnits = this._gameState.units.filter(u => u.belongsToPlayer === this._playerNum);
	}
	
	executeTurn() {
		let currentUnit = this._getActiveUnit();

		while(!!currentUnit) {

			this._inputState.dispatch(InputEvent.Tap, new Point3(currentUnit.x * this._config.cellSize, currentUnit.y * this._config.cellSize));

			//TODO: find a gridCell to move to

			//TODO: find a unit to attack

			currentUnit.hasMovedThisTurn = true;
			currentUnit = this._getActiveUnit();
		}


	};

	private _getActiveUnit() {
		return this._myUnits.find(u => u.hasMovedThisTurn === false);
	}
}