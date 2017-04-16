import * as Phaser from 'phaser';
import {IArmyCommandStrategyFactory} from "./interface";
import {DemoArmyCommandStrategy} from "../service";
import {IArmyCommandStrategy} from "../interface";
import {GameSubject} from "../../subject/game";
import {injectable} from "inversify";
import Game = Phaser.Game;

@injectable()
export class ArmyCommandStrategyFactory implements IArmyCommandStrategyFactory {
	constructor(
		private _gameState: GameSubject
	) { }
	
	create(playerNum: number): IArmyCommandStrategy {
		let units = this._gameState.units.filter(unit => unit.belongsToPlayer === playerNum);
		//TODO: configure difficulty, strategy, etc...
		return new DemoArmyCommandStrategy(playerNum, units, this._gameState);
	}
}