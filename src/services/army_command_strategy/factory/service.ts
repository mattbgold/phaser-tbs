import * as Phaser from 'phaser';
import {IArmyCommandStrategyFactory} from "./interface";
import {DemoArmyCommandStrategy} from "../service";
import {IArmyCommandStrategy} from "../interface";
import {GameSubject} from "../../subject/game";
import {InputSubject} from "../../subject/input";
import {inject, injectable} from "inversify";
import {GameConfig} from "../../../config";
import Game = Phaser.Game;
import {ContainerKeys} from "../../../inversify.config";

@injectable()
export class ArmyCommandStrategyFactory implements IArmyCommandStrategyFactory {
	constructor(
		private _gameState: GameSubject,
	    private _inputState: InputSubject,
	    @inject(ContainerKeys.CONFIG) private _config: GameConfig
	) { }
	
	create(playerNum: number): IArmyCommandStrategy {
		let units = this._gameState.units.filter(unit => unit.belongsToPlayer === playerNum);
		//TODO: configure difficulty, strategy, etc...
		return new DemoArmyCommandStrategy(playerNum, units, this._gameState, this._inputState, this._config);
	}
}