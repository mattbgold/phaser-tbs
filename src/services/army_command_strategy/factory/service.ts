import * as Phaser from 'phaser';
import {IArmyCommandStrategyFactory} from "./interface";
import {ArmyCommandStrategy} from "../service";
import Game = Phaser.Game;
import {IArmyCommandStrategy} from "../interface";
import {GameStateManager} from "../../state/game/service";

export class ArmyCommandStrategyFactory implements IArmyCommandStrategyFactory {
	constructor(
		private _gameState: GameStateManager
	) {
	}
	
	getForPlayer(playerNum: number): IArmyCommandStrategy {
		//TODO: configure difficulty, strategy, etc...
		return new ArmyCommandStrategy(playerNum, this._gameState);
	}
}