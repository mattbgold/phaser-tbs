import * as Phaser from 'phaser';
import {GameController, GameEvent} from "../controller";
import {GridCell} from "../../../game_objects/grid_cell";
import {InputController, InputEvent} from "../../input/controller";
import {BaseController} from "../../base";
import Group = Phaser.Group;
import {BaseUnit} from "../../../game_objects/units/base";

export class GridController extends BaseController {
	isoGridGroup: Group;
	cells: GridCell[];

	private _activeCell: GridCell;
	private _highlightCellsForMove: BaseUnit;
	private _highlightCellsForAttack: BaseUnit;

	constructor(private _ctrl: GameController, private _input: InputController) {
		super();
		this.cells = [];
		_ctrl.set('cells', this.cells);
	}

	init(): void {
		this._input.subscribe(InputEvent.Tap, this._onTap);
		this._ctrl.subscribe(GameEvent.UnitMoveActionSelected, this._onMoveActionSelected);
		this._ctrl.subscribe(GameEvent.UnitAttackActionSelected, this._onAttackActionSelected);
		this._ctrl.subscribe(GameEvent.CancelAction, this._onCancelAction);
		
		this.isoGridGroup = this._ctrl.game.add.group();

		for (let xx = 0; xx < this._ctrl.config.gridSizeX; xx++) {
			for (let yy = 0; yy < this._ctrl.config.gridSizeY; yy++) {
				// Create a tile using the new game.add.isoSprite factory method at the specified position.
				// The last parameter is the group you want to add it to (just like game.add.sprite)
				let tileSpr = this._ctrl.game.add.isoSprite(xx*this._ctrl.config.cellSize, yy*this._ctrl.config.cellSize, 0, 'tile', 0, this.isoGridGroup);
				tileSpr.anchor.set(0.5, 0);
				this.cells.push(new GridCell(tileSpr, xx, yy));
			}
		}
	}
	
	update() {
		this.cells.forEach(cell =>  {
			let inBounds = cell.spr.isoBounds.containsXY(this._input.cursorPos.x, this._input.cursorPos.y);

			//is the mouse hovering over a tile?
			if (inBounds) {
				if (!cell.hover) {
					cell.hover = true;
					if(!cell.highlighted && !cell.active)
						cell.spr.tint = highlightHoverColor;
					this._ctrl.game.add.tween(cell.spr).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
				}
			}
			// If not, revert back to how it was.
			else if (cell.hover && !inBounds) {
				cell.hover = false;
				if(!cell.highlighted && !cell.active)
					cell.spr.tint = 0xffffff;
				this._ctrl.game.add.tween(cell.spr).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
			}
		});
	}

	// ------------------------------------
	// ---------- EVENT HANDLERS ----------
	// ------------------------------------

	private _onTap = (tapCoords: Phaser.Plugin.Isometric.Point3) => {
		let clickedCell = this.cells.find(c => c.spr.isoBounds.containsXY(tapCoords.x, tapCoords.y));

		// if we clicked a cell that's not active
		if(!!clickedCell && this._activeCell !== clickedCell) {
			// reset the active cell
			if(!!this._activeCell) {
				this._activeCell.active = false;
				this._activeCell.spr.tint = 0xffffff;
				this._activeCell = null;
			}

			// if we tapped a destination cell for MOVE action
			if (!!this._highlightCellsForMove && clickedCell.highlighted) {

				this._unhighlightAll()
				this._ctrl.dispatch(GameEvent.UnitMove, clickedCell);
			}
			// else if we tapped a target cell for ATTACK action
			else if (!!this._highlightCellsForAttack && clickedCell.highlighted) {

				this._unhighlightAll();
				this._ctrl.dispatch(GameEvent.UnitAttack, clickedCell);
			}
			// else we tapped an inactive cell not tied to any action
			else {
				// mark the tapped cell as active
				clickedCell.active = true;
				clickedCell.spr.tint = 0x5555FF;
				this._activeCell = clickedCell;

				// we didn't tap a cell for an action, so lets cancel any pending actions
				this._ctrl.dispatch(GameEvent.CancelAction, clickedCell);
				this._ctrl.dispatch(GameEvent.GridCellActivated, clickedCell);
			}
		}
	}

	private _onCancelAction = () => {
		this._unhighlightAll();
	}

	private _onMoveActionSelected = (unit: BaseUnit) => {
		//highlight all cells in move range
		let cellUnderUnit = this._getCellAt(unit);
		if(!cellUnderUnit)
			return;

		this._unhighlightAll();
		this._highlightCellsForMove = unit;
		this._highlightCellsInRange(cellUnderUnit, unit.stats.mov);
	};

	private _onAttackActionSelected = (unit: BaseUnit) => {
		let cellUnderUnit = this._getCellAt(unit);

		if(!cellUnderUnit)
			return;

		this._unhighlightAll();
		this._highlightCellsForAttack = unit;
		this._highlightCellsInRange(cellUnderUnit, unit.stats.range, true);
	};

	// ---------------------------------------
	// ---------- HELPER FUNCTIONS -----------
	// ---------------------------------------

	private _unhighlightAll(): void {
		this._highlightCellsForMove = null;
		this._highlightCellsForAttack = null;

		this.cells.filter(cell => cell.highlighted).forEach(cell => {
			cell.highlighted = false;
			if(!cell.active)
				cell.spr.tint = 0xffffff;
		});
	}

	//TODO: use this fn for attack range, just change tint color
	private _highlightCellsInRange(cell: GridCell, range: number, isAttack: boolean = false) {
		if (!range || !cell || cell.isObstacle)
			return;

		if(isAttack || !this._getUnitAt(cell)) {
			// if the cell is not occupied, highlight it
			cell.highlighted = true;

			if (!cell.active)
				cell.spr.tint = isAttack ? highlightAttackColor : highlightMoveColor;
		}

		this._highlightCellsInRange(this.cells.find(c => c.x === cell.x + 1 && c.y === cell.y), range - 1, isAttack);
		this._highlightCellsInRange(this.cells.find(c => c.x === cell.x - 1 && c.y === cell.y), range - 1, isAttack);
		this._highlightCellsInRange(this.cells.find(c => c.x === cell.x && c.y === cell.y + 1), range - 1, isAttack);
		this._highlightCellsInRange(this.cells.find(c => c.x === cell.x && c.y === cell.y - 1), range - 1, isAttack);
	}

	private _getUnitAt(cell: GridCell): BaseUnit {
		let units: BaseUnit[] = this._ctrl.get('units');

		return units.find(unit => unit.x === cell.x && unit.y === cell.y)
	}

	private _getCellAt(unit: BaseUnit): GridCell {
		return this.cells.find(cell => cell.x === unit.x && cell.y === unit.y);
	}
}

const highlightHoverColor = 0x86bfda;
const highlightMoveColor = 0x86bfda;
const highlightAttackColor = 0xdc5566;