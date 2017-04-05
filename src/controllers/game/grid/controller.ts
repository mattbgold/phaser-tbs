import * as Phaser from 'phaser';
import {injectable, inject} from "inversify";
import {BaseController} from "../../base";
import Group = Phaser.Group;
import {BaseUnit} from "../../../game_objects/units/base";
import Game = Phaser.Game;
import {GridCell} from "../../../game_objects/grid/grid_cell";
import {IMapBuilder} from "../../../services/map_builder/interface";
import {GameStateManager, GameEvent} from "../../../services/state/game/service";
import {InputStateManager, InputEvent} from "../../../services/state/input/service";

@injectable()
export class GridController extends BaseController {
	cells: GridCell[];

	private _activeCell: GridCell;
	private _highlightCellsForMove: BaseUnit;
	private _highlightCellsForAttack: BaseUnit;
	private _canActivateCells: boolean = true;

	constructor(
		private _game: Game,
		@inject('gameState') private _gameState: GameStateManager,
		@inject('inputState') private _inputState: InputStateManager,
		@inject('IMapBuilder') private _mapBuilder: IMapBuilder
	) {
		super();
	}

	init(): void {
		this._inputState.subscribe(InputEvent.Tap, this._onTap);
		this._gameState.subscribe(GameEvent.UnitMoveActionSelected, this._onMoveActionSelected);
		this._gameState.subscribe(GameEvent.UnitAttackActionSelected, this._onAttackActionSelected);
		this._gameState.subscribe(GameEvent.CancelAction, this._onCancelAction);
		this._gameState.subscribe(GameEvent.UnitMove, (): void => {this._canActivateCells = false;}); // returning false will cancel the event.
		this._gameState.subscribe(GameEvent.UnitMoveCompleted, (): void => {this._canActivateCells = true;});

		this.cells = this._mapBuilder.buildGrid();
		this._gameState.set('cells', this.cells);
		
		this._game.iso.simpleSort(this._game['isoGridGroup']);
	}
	
	update() {
		this.cells.forEach(cell =>  {
			if (cell.blocksAttack || cell.blocksMove)
				return;
			let inBounds = cell.spr.isoBounds.containsXY(this._inputState.cursorPos.x, this._inputState.cursorPos.y);

			//is the mouse hovering over a tile?
			if (inBounds) {
				if (!cell.hover) {
					cell.hover = true;
					if(!cell.highlighted && !cell.active) {
						cell.spr.tint = highlightHoverColor;
					}
					this._game.add.tween(cell.spr).to({isoZ: 4}, 200, Phaser.Easing.Quadratic.InOut, true);
					let unitToRaise = this._getUnitAt(cell);
					if (!!unitToRaise)
						this._game.add.tween(unitToRaise.spr).to({isoZ: 4}, 200, Phaser.Easing.Quadratic.InOut, true);
				}
			}
			// If not, revert back to how it was.
			else if ((cell.hover) && !inBounds) {
				cell.hover = false;
				if(!cell.highlighted && !cell.active) {
					cell.spr.tint = cell.restingTint;
				}
				if(!cell.active) { // do not lower the cell if its active
					this._game.add.tween(cell.spr).to({isoZ: cell.restingZ}, 200, Phaser.Easing.Quadratic.InOut, true);
					let unitToLower = this._getUnitAt(cell);
					if (!!unitToLower)
						this._game.add.tween(unitToLower.spr).to({isoZ: 0}, 200, Phaser.Easing.Quadratic.InOut, true);
				}
			}
			else if (!cell.hover && !cell.active && cell.spr.isoZ === 4) { // clean up active cells after deactivation
				this._game.add.tween(cell.spr).to({isoZ: cell.restingZ}, 200, Phaser.Easing.Quadratic.InOut, true);
				let unitToLower = this._getUnitAt(cell);
				if (!!unitToLower)
					this._game.add.tween(unitToLower.spr).to({isoZ: 0}, 200, Phaser.Easing.Quadratic.InOut, true);
			}
		});
	}

	render(){ }
	
	// ------------------------------------
	// ---------- EVENT HANDLERS ----------
	// ------------------------------------

	private _onTap = (tapCoords: Phaser.Plugin.Isometric.Point3) => {
		if (!this._canActivateCells)
			return;

		let clickedCell = this.cells.find(c => c.spr.isoBounds.containsXY(tapCoords.x, tapCoords.y));
		if(!clickedCell || clickedCell.blocksAttack || clickedCell.blocksMove)
			return;

		let unitAtClickedCell = this._getUnitAt(clickedCell);

		// if we clicked a cell that's not active
		if(!!clickedCell && this._activeCell !== clickedCell) {
			// reset the active cell
			if(!!this._activeCell) {
				this._activeCell.active = false;
				this._activeCell.spr.tint = this._activeCell.restingTint;
				this._activeCell = null;
			}

			// if we tapped a destination cell for MOVE action
			if (!!this._highlightCellsForMove && clickedCell.highlighted) {
				this._unhighlightAll();
				this._gameState.dispatch(GameEvent.UnitMove, clickedCell);
			}
			// else if we tapped a target cell for ATTACK action
			else if (!!this._highlightCellsForAttack && clickedCell.highlighted && !!unitAtClickedCell) {
				this._unhighlightAll();
				this._gameState.dispatch(GameEvent.UnitAttack, unitAtClickedCell);
			}
			// else we tapped an inactive cell not tied to any action
			else {
				// mark the tapped cell as active
				clickedCell.active = true;
				clickedCell.spr.tint = 0xFFFF88;
				this._activeCell = clickedCell;

				// we didn't tap a cell for an action, so lets cancel any pending actions
				this._gameState.dispatch(GameEvent.CancelAction, clickedCell);
				this._gameState.dispatch(GameEvent.GridCellActivated, clickedCell);
			}
		}
	};

	private _onCancelAction = () => {
		this._unhighlightAll();
	};

	private _onMoveActionSelected = (unit: BaseUnit) => {
		//highlight all cells in move range
		let cellUnderUnit = this._getCellAt(unit);
		if(!cellUnderUnit)
			return;

		this._unhighlightAll();
		this._highlightCellsForMove = unit;
		this._highlightCellsInRange(cellUnderUnit, unit.stats.mov + 1);
	};

	private _onAttackActionSelected = (unit: BaseUnit) => {
		let cellUnderUnit = this._getCellAt(unit);

		if(!cellUnderUnit)
			return;

		this._unhighlightAll();
		this._highlightCellsForAttack = unit;
		this._highlightCellsInRange(cellUnderUnit, unit.stats.range + 1, true);
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
				cell.spr.tint = cell.restingTint;
		});
	}
	
	private _highlightCellsInRange(cell: GridCell, range: number, isAttack: boolean = false, previousCell: GridCell = null, previousDirection: string = null) {
		if (!range || !cell || (cell.blocksMove && !isAttack) || (cell.blocksAttack && isAttack)
			|| (cell.active && !!previousCell)) //if we looped back to the original cell, just stop
			return;

		if((isAttack || !this._getUnitAt(cell)) && !cell.blocksMove) {
			// if the cell is not occupied, highlight it
			cell.highlighted = true;

			if (!cell.active)
				cell.spr.tint = isAttack ? highlightAttackColor : highlightMoveColor;
		}

		let direction = '';

		if(!previousCell) {
			this.cells.forEach(c => c.pathFromActiveCell = []);
		}
		else {
			direction = cell.x === previousCell.x
				? cell.y - previousCell.y > 0 ? 'down' : 'up'
				: cell.x - previousCell.x > 0 ? 'right' : 'left';

			if (cell.pathFromActiveCell.length === 0 || previousCell.pathFromActiveCell.length <= cell.pathFromActiveCell.length){
				cell.pathFromActiveCell = previousCell.pathFromActiveCell.concat([direction]);
			}
		}

		if (direction !== 'left' && previousDirection !== 'left') //prevent pointless U-turns
			this._highlightCellsInRange(this.cells.find(c => c.x === cell.x + 1 && c.y === cell.y), range - 1, isAttack, cell, direction);
		if (direction !== 'right' && previousDirection !== 'right')
			this._highlightCellsInRange(this.cells.find(c => c.x === cell.x - 1 && c.y === cell.y), range - 1, isAttack, cell, direction);
		if (direction !== 'up' && previousDirection !== 'up')
			this._highlightCellsInRange(this.cells.find(c => c.x === cell.x && c.y === cell.y + 1), range - 1, isAttack, cell, direction);
		if (direction !== 'down' && previousDirection !== 'down')
			this._highlightCellsInRange(this.cells.find(c => c.x === cell.x && c.y === cell.y - 1), range - 1, isAttack, cell, direction);
	}

	private _getUnitAt(cell: GridCell): BaseUnit {
		let units: BaseUnit[] = this._gameState.get('units');

		return units.find(unit => unit.x === cell.x && unit.y === cell.y)
	}

	private _getCellAt(unit: BaseUnit): GridCell {
		return this.cells.find(cell => cell.x === unit.x && cell.y === unit.y);
	}
}

const highlightHoverColor = 0xdddddd;
const highlightMoveColor = 0x86bfda;
const highlightAttackColor = 0xdc5566;