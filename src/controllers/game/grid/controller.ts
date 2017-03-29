import * as Phaser from 'phaser';
import {GameController, GameEvent} from "../controller";
import {GridCell} from "../../../game_objects/grid_cell";
import {InputController, InputEvent} from "../../input/controller";
import {BaseController} from "../../base";
import Group = Phaser.Group;

export class GridController extends BaseController {
	isoGridGroup: Group;
	cells: GridCell[] = [];

	private _activeCell: GridCell;

	constructor(private _ctrl: GameController, private _input: InputController) {
		super();
	}

	init(): void {
		this._input.subscribe(InputEvent.Tap, this._onTap);
		
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
					cell.spr.tint = 0x86bfda;
					this._ctrl.game.add.tween(cell.spr).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
				}
			}
			// If not, revert back to how it was.
			else if (cell.hover && !inBounds) {
				cell.hover = false;
				cell.spr.tint = 0xffffff;
				this._ctrl.game.add.tween(cell.spr).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
			}
		});
	}

	private _onTap = (tapCoords: Phaser.Plugin.Isometric.Point3) => {
		//TODO: //this.unitController.move(this.unit, tile.isoX/this.config.cellSize, tile.isoY/this.config.cellSize);
		let cellClicked = this.cells.find(c => c.spr.isoBounds.containsXY(tapCoords.x, tapCoords.y));

		if(!!cellClicked) {
			if(!!this._activeCell)
				this._activeCell.active = false;
			cellClicked.active = true;
			this._activeCell = cellClicked;
			this._ctrl.signals[GameEvent.GridCellActivated].dispatch(cellClicked);
		}
	}
}