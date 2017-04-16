import * as Phaser from 'phaser';
import {injectable, inject} from "inversify";
import {BaseController} from "../../base";
import Group = Phaser.Group;
import {BaseUnit} from "../../../game_objects/units/base";
import Game = Phaser.Game;
import {GridCell} from "../../../game_objects/grid/grid_cell";
import {IMapBuilder} from "../../../services/map_builder/interface";
import {GameSubject, GameEvent} from "../../../services/subject/game";
import {InputSubject, InputEvent} from "../../../services/subject/input";
import {ContainerKeys} from "../../../inversify.config";

@injectable()
export class GridController extends BaseController {
	cells: GridCell[];

	private _activeCell: GridCell;
	private _unitHighlightedForMove: BaseUnit;
	private _unitHighlightedForAttack: BaseUnit;
	private _canActivateCells: boolean = true;

	constructor(
		private _game: Game,
		private _gameSubject: GameSubject,
		private _inputSubject: InputSubject,
		@inject(ContainerKeys.MAP_BUILDER) private _mapBuilder: IMapBuilder
	) {
		super();
	}

	preload() {
		this._inputSubject.subscribe(InputEvent.Tap, this._handleTap);
		this._gameSubject.subscribe(GameEvent.LoadMapCompleted, this._initGrid);
		this._gameSubject.subscribe(GameEvent.UnitMoveActionSelected, this._highlightCellsForMove);
		this._gameSubject.subscribe(GameEvent.UnitAttackActionSelected, this._highlightCellsForAttack);
		this._gameSubject.subscribe([GameEvent.UnitWaitActionSelected, GameEvent.UnitMove, GameEvent.CancelAction], this._unhighlightAll);
		this._gameSubject.subscribe(GameEvent.UnitMove, (): void => {
			this._canActivateCells = false;
		}); // returning false will cancel the event.
		this._gameSubject.subscribe(GameEvent.UnitAttack, this._unhighlightAll);
		this._gameSubject.subscribe(GameEvent.UnitMoveCompleted, (): void => {this._canActivateCells = true;});
	}
	
	create(): void {
	}
	
	update() {
		this.cells.forEach(cell =>  {
			if (cell.blocksAttack || cell.blocksMove)
				return;
			let inBounds = cell.spr.isoBounds.containsXY(this._inputSubject.cursorPos.x, this._inputSubject.cursorPos.y);

			//is the mouse hovering over a tile?
			if (inBounds) {
				if (!cell.hover) {
					cell.hover = true;
					if(!cell.highlighted && !cell.active) {
						cell.spr.tint = highlightHoverColor;
					}
					this._game.add.tween(cell.spr).to({isoZ: 4}, 200, Phaser.Easing.Quadratic.InOut, true);
					let unitToRaise = this._gameSubject.getUnitAt(cell);
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
					let unitToLower = this._gameSubject.getUnitAt(cell);
					if (!!unitToLower)
						this._game.add.tween(unitToLower.spr).to({isoZ: 0}, 200, Phaser.Easing.Quadratic.InOut, true);
				}
			}
			else if (!cell.hover && !cell.active && cell.spr.isoZ === 4) { // clean up active cells after deactivation
				this._game.add.tween(cell.spr).to({isoZ: cell.restingZ}, 200, Phaser.Easing.Quadratic.InOut, true);
				let unitToLower = this._gameSubject.getUnitAt(cell);
				if (!!unitToLower)
					this._game.add.tween(unitToLower.spr).to({isoZ: 0}, 200, Phaser.Easing.Quadratic.InOut, true);
			}
		});
	}
	
	// ------------------------------------
	// ---------- EVENT HANDLERS ----------
	// ------------------------------------
	private _initGrid = () => {
		this.cells = this._mapBuilder.buildGrid();
		this._gameSubject.cells = this.cells;

		this._game.iso.simpleSort(this._game['isoGridGroup']);
	};
	
	private _handleTap = (tapCoords: Phaser.Plugin.Isometric.Point3) => {
		if (!this._canActivateCells)
			return;

		let clickedCell = this.cells.find(c => c.spr.isoBounds.containsXY(tapCoords.x, tapCoords.y));
		if(!clickedCell || clickedCell.blocksAttack || clickedCell.blocksMove)
			return;

		let unitAtClickedCell = this._gameSubject.getUnitAt(clickedCell);

		// if we clicked a cell
		if(!!clickedCell) {
			// reset the active cell
			if(this._activeCell && this._activeCell !== clickedCell) {
				this._activeCell.active = false;
				this._activeCell.spr.tint = this._activeCell.restingTint;
				this._activeCell = null;
			}

			//TODO: maybe we should just dispatch gridCellActivated and let unit controller handle dispatching UnitAttack or UnitMove. 
			// We need to check that it is a valid unit to attack etc...

			// if we tapped a destination cell for MOVE action
			if (!!this._unitHighlightedForMove && (clickedCell.highlighted || this._unitHighlightedForMove === unitAtClickedCell)) {
				this._gameSubject.dispatch(GameEvent.UnitMove, clickedCell);
			}
			// else if we tapped a target cell for ATTACK action
			else if (
				!!this._unitHighlightedForAttack
				&& clickedCell.highlighted
				&& !!unitAtClickedCell
				&& unitAtClickedCell.belongsToPlayer !== this._unitHighlightedForAttack.belongsToPlayer
			) {
				this._gameSubject.dispatch(GameEvent.UnitAttack, unitAtClickedCell);
			}
			// else we tapped an inactive cell not tied to any action
			else {
				// mark the tapped cell as active
				clickedCell.active = true;
				clickedCell.spr.tint = 0xFFFF88;
				this._activeCell = clickedCell;

				// we didn't tap a cell for an action, so lets cancel any pending actions
				this._gameSubject.dispatch(GameEvent.GridCellActivated, clickedCell);
			}
		}
	};

	private _highlightCellsForMove = (unit: BaseUnit) => {
		//highlight all cells in move range
		let cellUnderUnit = this._gameSubject.getCellAt(unit);
		if(!cellUnderUnit)
			return;

		this._unhighlightAll();
		this._unitHighlightedForMove = unit;
		this._highlightCellsInRange(cellUnderUnit, unit.stats.mov + 1);
	};

	private _highlightCellsForAttack = (unit: BaseUnit) => {
		let cellUnderUnit = this._gameSubject.getCellAt(unit);

		if(!cellUnderUnit)
			return;

		this._unhighlightAll();
		this._unitHighlightedForAttack = unit;
		this._highlightCellsInRange(cellUnderUnit, unit.stats.range + 1, true);
	};

	// ---------------------------------------
	// ---------- HELPER FUNCTIONS -----------
	// ---------------------------------------

	private _unhighlightAll = (): void => {
		this._unitHighlightedForMove = null;
		this._unitHighlightedForAttack = null;

		this.cells.filter(cell => cell.highlighted).forEach(cell => {
			cell.highlighted = false;
			if(!cell.active)
				cell.spr.tint = cell.restingTint;
		});
	};
	
	private _highlightCellsInRange(cell: GridCell, range: number, isAttack: boolean = false, previousCell: GridCell = null, previousDirection: string = null) {
		if (!range || !cell || (cell.blocksMove && !isAttack) || (cell.blocksAttack && isAttack)
			|| (cell.active && !!previousCell)) //if we looped back to the original cell, just stop
			return;

		let unitAtCell = this._gameSubject.getUnitAt(cell);

		let playerNum: number = isAttack ? this._unitHighlightedForAttack.belongsToPlayer : this._unitHighlightedForMove.belongsToPlayer;

		//dont allow move or attack through enemy units
		if(unitAtCell && unitAtCell.belongsToPlayer !== playerNum) {
			if(!isAttack)
				return;
			else {
				let unitAtPreviousCell = this._gameSubject.getUnitAt(previousCell);
				if(unitAtPreviousCell &&  unitAtPreviousCell.belongsToPlayer !== playerNum)
					return;
			}
		}

		if((isAttack || !unitAtCell) && !cell.blocksMove) {
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
}

const highlightHoverColor = 0xdddddd;
const highlightMoveColor = 0x86bfda;
const highlightAttackColor = 0xdc5566;