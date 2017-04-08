import * as Phaser from 'phaser';
import {IArmyCommandStrategyFactory} from "./interface";
import {DemoArmyCommandStrategy} from "../service";
import {IArmyCommandStrategy} from "../interface";
import {GameStateManager} from "../../state/game/service";
import {InputStateManager} from "../../state/input/service";
import {inject, injectable} from "inversify";
import {GameConfig} from "../../../config";
import Game = Phaser.Game;

@injectable()
export class ArmyCommandStrategyFactory implements IArmyCommandStrategyFactory {
	constructor(
		private _gameState: GameStateManager,
	    private _inputState: InputStateManager,
	    @inject('config') private _config: GameConfig
	) { }
	
	create(playerNum: number): IArmyCommandStrategy {
		let units = this._gameState.units.filter(unit => unit.belongsToPlayer === playerNum);
		//TODO: configure difficulty, strategy, etc...
		return new DemoArmyCommandStrategy(playerNum, units, this._gameState, this._inputState, this._config);
	}
}