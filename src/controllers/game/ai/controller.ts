import * as Phaser from 'phaser'
import {BaseController} from "../../base";
import {inject, injectable} from "inversify";
import {GameSubject, GameEvent} from "../../../services/subject/game/service";
import {IArmyCommandStrategyFactory} from "../../../services/army_command_strategy/factory/interface";
import {IArmyCommandStrategy} from "../../../services/army_command_strategy/interface";
import {BaseUnit} from "../../../game_objects/units/base";
import {ContainerKeys} from "../../../inversify.config";

@injectable()
export class AIController extends BaseController {
	constructor(
		private _gameSubject: GameSubject,
		@inject(ContainerKeys.AI_FACTORY) private _armyStrategyFactory: IArmyCommandStrategyFactory
	) {
		super();
	}

	private _playerAis: {[key: number]: IArmyCommandStrategy} = {};

	preload() {
		this._gameSubject.subscribe(GameEvent.UnitsInitialized, this.initializeAi);
		this._gameSubject.subscribe(GameEvent.TurnStart, this._onTurnStart);
		this._gameSubject.subscribe(GameEvent.UnitMoveActionSelected, this._onMoveActionSelected);
		this._gameSubject.subscribe(GameEvent.UnitMoveCompleted, this._onMoveCompleted);
		this._gameSubject.subscribe(GameEvent.UnitAttackActionSelected, this._onAttackActionSelected);
		this._gameSubject.subscribe(GameEvent.UnitAttackCompleted, this._onAttackCompleted);
	}

	create() {

	}

	private initializeAi = (): void => {
		//start at 1 because player 0 is controlled by the user
		for(let i = 1; i < this._gameSubject.numberOfPlayers; i++) {
			this._playerAis[i] = this._armyStrategyFactory.create(i);
		}
	};

	private _onTurnStart = (playerNum: number): void => {
		if(!!this._playerAis[playerNum])
			this._playerAis[playerNum].selectNextUnit();
	};
	
	private _onMoveActionSelected = (unit: BaseUnit): void => {
		if(!!this._playerAis[unit.belongsToPlayer])
			this._playerAis[unit.belongsToPlayer].moveUnit(unit);
	};

	private _onMoveCompleted = (unit: BaseUnit): void => {
		if(!!this._playerAis[unit.belongsToPlayer])
			this._playerAis[unit.belongsToPlayer].beginAttack(unit);
	};

	private _onAttackActionSelected = (unit: BaseUnit): void => {
		if(!!this._playerAis[unit.belongsToPlayer])
			this._playerAis[unit.belongsToPlayer].attackWithUnit(unit);
	};

	private _onAttackCompleted = (unit: BaseUnit): void => {
		if(!!this._playerAis[unit.belongsToPlayer])
			this._playerAis[unit.belongsToPlayer].selectNextUnit();
	};
}
