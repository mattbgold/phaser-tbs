import {injectable, inject} from "inversify";
import * as Phaser from 'phaser';
import {BaseController} from "../../base";
import {BaseUnit} from "../../../game_objects/units/base";
import {GameConfig} from "../../../config";
import Game = Phaser.Game;
import {GameSubject, GameEvent} from "../../../services/subject/game";
import {InputSubject, InputEvent} from "../../../services/subject/input";
import {ContainerKeys} from "../../../inversify.config";

@injectable()
export class ContextMenuController extends BaseController {

	private _selectedUnit: BaseUnit;
	private _menuElement: HTMLElement;

	constructor(
		private _game: Game,
		private _gameSubject: GameSubject,
		private _inputSubject: InputSubject,
		@inject(ContainerKeys.CONFIG) private _config: GameConfig
	) {
		super();
		this._menuElement = document.getElementById('context-menu');
	}

	preload() {
		this._gameSubject.subscribe(GameEvent.UnitSelected, this._showMenuForUnit);
		this._gameSubject.subscribe(GameEvent.CancelAction, this._deselectAndHideMenu);
		this._gameSubject.subscribe(GameEvent.UnitAttackActionSelected, this._hideMenu);
		this._gameSubject.subscribe(GameEvent.UnitWaitActionSelected, this._hideMenu);
		this._gameSubject.subscribe(GameEvent.UnitMove, this._hideMenu);
		this._gameSubject.subscribe(GameEvent.UnitMoveCompleted, this._showMenu);
		this._inputSubject.subscribe(InputEvent.KeyAttack, this._dispatchAttack);
		this._inputSubject.subscribe(InputEvent.KeyWait, this._dispatchWait);

		//handle events from context menu
		window.addEventListener('actionSelected', e => {
			let action = e['detail']['action'];
			switch (action) {
				case 'attack':
					this._gameSubject.dispatch(GameEvent.UnitAttackActionSelected, this._selectedUnit);
					break;
				case 'wait':
					this._gameSubject.dispatch(GameEvent.UnitWaitActionSelected, this._selectedUnit);
					break;
				case 'cancel':
					this._gameSubject.dispatch(GameEvent.CancelAction);
					break;
				default:
					console.error('Invalid action dispatched on actionSelected');
			}
		});
	}

	private _hideMenu = (): void => {
		this._menuElement.style.display = 'none';
	};

	private _showMenu = (): void => {
		if(!this._selectedUnit || this._selectedUnit.belongsToPlayer !== 0)
			return;

		this._menuElement.style.display = 'block';
		this._menuElement.style.left = `${this._selectedUnit.spr.x + 50}px`;
		this._menuElement.style.top = `${this._selectedUnit.spr.y - 80}px`;
	};

	// ------------------------------------
	// ---------- EVENT HANDLERS ----------
	// ------------------------------------

	private _showMenuForUnit = (unit: BaseUnit): void => {
		if(unit.hasActedThisTurn || unit.belongsToPlayer !== 0) //player 0 is the user
			return;

		this._selectedUnit = unit;

		this._showMenu();
	};

	private _deselectAndHideMenu = (): void => {
		this._selectedUnit = null;
		this._hideMenu();
	};

	private _dispatchAttack = (): void => {
		if(!!this._selectedUnit) {
			this._gameSubject.dispatch(GameEvent.UnitAttackActionSelected, this._selectedUnit);
		}
	};

	private _dispatchWait = (): void => {
		if(!!this._selectedUnit) {
			this._gameSubject.dispatch(GameEvent.UnitWaitActionSelected, this._selectedUnit);
		}
	};
}