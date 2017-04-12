import {injectable, inject} from "inversify";
import * as Phaser from 'phaser';
import {BaseController} from "../../base";
import {BaseUnit} from "../../../game_objects/units/base";
import {GameConfig} from "../../../config";
import Game = Phaser.Game;
import {GameSubject, GameEvent} from "../../../services/subject/game/service";
import {InputSubject, InputEvent} from "../../../services/subject/input/service";
import {ContainerKeys} from "../../../inversify.config";

@injectable()
export class ContextMenuController extends BaseController {

	private _selectedUnit: BaseUnit;

	constructor(
		private _game: Game,
		private _gameSubject: GameSubject,
		private _inputSubject: InputSubject,
		@inject(ContainerKeys.CONFIG) private _config: GameConfig
	) {
		super();
	}

	preload() {
		this._gameSubject.subscribe(GameEvent.UnitSelected, unit => this._selectedUnit = unit);
		this._gameSubject.subscribe(GameEvent.CancelAction, unit => this._selectedUnit = null);
		this._inputSubject.subscribe(InputEvent.KeyAttack, this._onKeyAttack);
	}

	// ------------------------------------
	// ---------- EVENT HANDLERS ----------
	// ------------------------------------

	private _onKeyAttack = (): void => {
		//TODO: eventually we only want to dispatch this if it is a VALID time to initiate attack. I put it in here because attack will be the menu
		// TODO: maybe this should be moved to unit controller? or perhaps action selected events belong here
		if(!!this._selectedUnit) {
			this._gameSubject.dispatch(GameEvent.UnitAttackActionSelected, this._selectedUnit);
		}
	};
}