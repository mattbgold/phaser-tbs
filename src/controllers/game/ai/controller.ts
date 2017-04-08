import * as Phaser from 'phaser'
import {BaseController} from "../../base";
import {GameConfig} from "../../../config";
import Game = Phaser.Game;
import {inject, injectable} from "inversify";
import {GameStateManager, GameEvent} from "../../../services/state/game/service";
import {InputStateManager} from "../../../services/state/input/service";
import {IArmyCommandStrategyFactory} from "../../../services/army_command_strategy/factory/interface";
import {IArmyCommandStrategy} from "../../../services/army_command_strategy/interface";
import {BaseUnit} from "../../../game_objects/units/base";

@injectable()
export class AIController extends BaseController {
	constructor(
		private _game: Game,
		private _gameState: GameStateManager,
		private _inputState: InputStateManager,
		@inject('IArmyCommandStrategyFactory') private _armyStategyFactory: IArmyCommandStrategyFactory,
		@inject('config') private _config: GameConfig
	) {
		super();
	}

	private _playerAis: IArmyCommandStrategy[] = [];
	private _numOfPlayers: number;


	create() {
		this._gameState.subscribe(GameEvent.TurnStart, this._onTurnStart);
		this._gameState.subscribe(GameEvent.UnitMoveActionSelected, this._onMoveActionSelected);
		this._gameState.subscribe(GameEvent.UnitMoveCompleted, this._onMoveCompleted);
		this._gameState.subscribe(GameEvent.UnitAttackActionSelected, this._onAttackActionSelected);
		this._gameState.subscribe(GameEvent.UnitAttackCompleted, this._onAttackCompleted);
		this._gameState.subscribe(GameEvent.TurnComplete, this._onTurnComplete);

		this._numOfPlayers = this._gameState.getNumOfPlayers();

		for(let i = 0; i < this._numOfPlayers; i++) {
			this._playerAis.push(this._armyStategyFactory.create(i));
		}

		this._gameState.dispatch(GameEvent.TurnStart, 0);
	}

	private _onTurnStart = (playerNum: number): void => {
		this._playerAis[playerNum].selectNextUnit();
	};
	
	private _onMoveActionSelected = (unit: BaseUnit): void => {
		this._playerAis[unit.belongsToPlayer].moveUnit(unit);
	};

	private _onMoveCompleted = (unit: BaseUnit): void => {
		this._playerAis[unit.belongsToPlayer].beginAttack(unit);
	};

	private _onAttackActionSelected = (unit: BaseUnit): void => {
		this._playerAis[unit.belongsToPlayer].attackWithUnit(unit);
	};

	private _onAttackCompleted = (unit: BaseUnit): void => {
		this._playerAis[unit.belongsToPlayer].selectNextUnit();
	};
	
	private _onTurnComplete = (playerNum: number): void => {
		let nextPlayer =  playerNum === (this._numOfPlayers - 1) ? 0 : (playerNum + 1);

		this._gameState.dispatch(GameEvent.TurnStart, nextPlayer);
	};
}
