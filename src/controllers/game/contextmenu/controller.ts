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
		this._gameSubject.subscribe(GameEvent.UnitSelected, this._onUnitSelected);
		this._gameSubject.subscribe(GameEvent.CancelAction, this._onCancelAction);
		this._gameSubject.subscribe(GameEvent.UnitAttackActionSelected, this._hideMenu);
		this._gameSubject.subscribe(GameEvent.UnitWaitActionSelected, this._hideMenu);
		this._inputSubject.subscribe(InputEvent.KeyAttack, this._onKeyAttack);
		this._inputSubject.subscribe(InputEvent.KeyWait, this._onKeyWait);

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

	// ------------------------------------
	// ---------- EVENT HANDLERS ----------
	// ------------------------------------

	private _onUnitSelected = (unit: BaseUnit): void => {
		if(unit.hasActedThisTurn)
			return;
		
		this._selectedUnit = unit;

		this._menuElement.style.display = 'block';
		this._menuElement.style.left = `${unit.spr.x + 50}px`;
		this._menuElement.style.top = `${unit.spr.y - 80}px`;
	};

	private _onCancelAction = (): void => {
		this._selectedUnit = null;
		this._hideMenu();
	};

	private _onKeyAttack = (): void => {
		if(!!this._selectedUnit) {
			this._gameSubject.dispatch(GameEvent.UnitAttackActionSelected, this._selectedUnit);
		}
	};

	private _onKeyWait = (): void => {
		if(!!this._selectedUnit) {
			this._gameSubject.dispatch(GameEvent.UnitWaitActionSelected, this._selectedUnit);
		}
	};
}