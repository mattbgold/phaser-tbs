import {injectable} from "inversify";
import {GameController, GameEvent} from "../controller";
import {InputController, InputEvent} from "../../input/controller";
import {BaseController} from "../../base";
import {BaseUnit} from "../../../game_objects/units/base";

@injectable()
export class ContextMenuController extends BaseController {

	private _selectedUnit: BaseUnit;

	constructor(private _ctrl: GameController, private _input: InputController) {
		super();
	}

	init() {
		this._ctrl.subscribe(GameEvent.UnitSelected, unit => this._selectedUnit = unit);
		this._ctrl.subscribe(GameEvent.CancelAction, unit => this._selectedUnit = null);
		this._input.subscribe(InputEvent.KeyAttack, this._onKeyAttack);
	}

	update() { }

	render() { }

	// ------------------------------------
	// ---------- EVENT HANDLERS ----------
	// ------------------------------------

	private _onKeyAttack = (): void => {
		//TODO: eventually we only want to dispatch this if it is a VALID time to initiate attack. I put it in here because attack will be the menu
		// TODO: maybe this should be moved to unit controller? or perhaps action selected events belong here
		if(!!this._selectedUnit) {
			this._ctrl.dispatch(GameEvent.UnitAttackActionSelected, this._selectedUnit);
		}
	};
}