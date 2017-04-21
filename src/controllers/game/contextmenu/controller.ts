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
	private _hoveredUnit: BaseUnit;
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
		this._gameSubject.subscribe(GameEvent.UnitSelected, this._selectUnit);
		this._gameSubject.subscribe(GameEvent.CancelAction, this._deselectAndHideMenu);
		this._gameSubject.subscribe(GameEvent.UnitAttackActionSelected, this._hideMenu);
		this._gameSubject.subscribe(GameEvent.UnitWaitActionSelected, this._hideMenu);
		this._gameSubject.subscribe(GameEvent.UnitMove, this._hideMenu);
		this._gameSubject.subscribe(GameEvent.UnitMoveCompleted, this._showMenu);
		this._inputSubject.subscribe(InputEvent.KeyAttack, this._dispatchAttack);
		this._inputSubject.subscribe(InputEvent.KeyWait, this._dispatchWait);
		this._inputSubject.subscribe(InputEvent.KeyCancel, this._dispatchCancel);

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
					this._gameSubject.dispatch(GameEvent.CancelAction, this._selectedUnit);
					break;
				default:
					console.error('Invalid action dispatched on actionSelected');
			}
		});
	}

	update() {
		let foundUnitUnderCursor = false;

		this._gameSubject.units.forEach(unit => {
			let inBounds = unit.spr.isoBounds.containsXY(this._inputSubject.cursorPos.x, this._inputSubject.cursorPos.y);

			if(inBounds) {
				foundUnitUnderCursor = true;
				this._hoveredUnit = unit;
			}
		});

		if (!foundUnitUnderCursor)
			this._hoveredUnit = null;
	}

	render() {
		if(!!this._hoveredUnit) {
			this._game.debug.text(`${this._hoveredUnit.name} HP: ${this._hoveredUnit.hp}/${this._hoveredUnit.stats.hp}`, 2, 34, "#a7aebe");
			this._game.debug.text(JSON.stringify(this._hoveredUnit.stats).replace(/[{}"]/g, '').replace(/,/g, ', '), 2, 54, "#a7aebe");
		}
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

	private _selectUnit = (unit: BaseUnit): void => {
		this._selectedUnit = unit;
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

	private _dispatchCancel = (): void => {
		if(!!this._selectedUnit) {
			this._gameSubject.dispatch(GameEvent.CancelAction, this._selectedUnit);
		}
	};
}