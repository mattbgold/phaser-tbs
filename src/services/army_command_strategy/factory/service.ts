import * as Phaser from 'phaser';
import {IArmyCommandStrategyFactory} from "./interface";
import {DemoArmyCommandStrategy} from "../service";
import Game = Phaser.Game;
import {IArmyCommandStrategy} from "../interface";
import {GameStateManager} from "../../state/game/service";
import {InputStateManager} from "../../state/input/service";
import {inject, injectable} from "inversify";
import {GameConfig} from "../../../config";

@injectable()
export class ArmyCommandStrategyFactory implements IArmyCommandStrategyFactory {
	constructor(
		private _gameState: GameStateManager,
	    private _inputState: InputStateManager,
	    @inject('config') private _config: GameConfig
	) {
	}
	
	getForPlayer(playerNum: number): IArmyCommandStrategy {
		//TODO: configure difficulty, strategy, etc...
		return new DemoArmyCommandStrategy(playerNum, this._gameState, this._inputState, this._config);
	}
}