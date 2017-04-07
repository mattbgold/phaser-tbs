import * as Phaser from 'phaser'
import {BaseController} from "../../base";
import {GameConfig} from "../../../config";
import Game = Phaser.Game;
import {inject, injectable} from "inversify";
import {GameStateManager, GameEvent} from "../../../services/state/game/service";
import {InputStateManager} from "../../../services/state/input/service";
import {IArmyCommandStrategyFactory} from "../../../services/army_command_strategy/factory/interface";
import {IArmyCommandStrategy} from "../../../services/army_command_strategy/interface";

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

	init() {
		this._gameState.subscribe(GameEvent.TurnComplete, playerNum => this._startNextTurn(playerNum));

		let totalPlayers = this._gameState.getNumOfPlayers();

		for(let i =0; i < totalPlayers; i++) {
			this._playerAis.push(this._armyStategyFactory.getForPlayer(i));
		}

		this._gameState.dispatch(GameEvent.TurnStart, 0);
	}

	update() {

	}

	render() {

	}

	private _startNextTurn(playerNum: number): void {
		let totalPlayers = this._gameState.getNumOfPlayers();

		let nextPlayer =  playerNum === totalPlayers - 1 ? 0 : playerNum + 1;

		this._gameState.dispatch(GameEvent.TurnStart, nextPlayer);
	}
}
