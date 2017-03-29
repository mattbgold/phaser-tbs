import * as Phaser from 'phaser';
import {GameController, GameEvent} from "../controller";
import Group = Phaser.Group;
import {Controller} from "../../interface";
import {GridTile} from "../../../game_objects/gridTile";
import {InputController, InputEvent} from "../../input/controller";

export class GridController implements Controller {
	isoGridGroup: Group;
	activeTile: any;

	constructor(private _ctrl: GameController, private _input: InputController) {
	}

	init(): void {
		this.isoGridGroup = this._ctrl.game.add.group();

		for (var xx = 0; xx < this._ctrl.config.gridSizeX; xx++) {
			for (var yy = 0; yy < this._ctrl.config.gridSizeY; yy++) {
				// Create a tile using the new game.add.isoSprite factory method at the specified position.
				// The last parameter is the group you want to add it to (just like game.add.sprite)
				let tile = this._ctrl.game.add.isoSprite(xx*this._ctrl.config.cellSize, yy*this._ctrl.config.cellSize, 0, 'tile', 0, this.isoGridGroup);
				tile.anchor.set(0.5, 0);
			}
		}

		this._input.subscribe(InputEvent.Tap, this._onTap);
	}
	
	update() {
		this.isoGridGroup.forEach(tile =>  {;
			var inBounds = tile.isoBounds.containsXY(this._input.cursorPos.x, this._input.cursorPos.y);

			//is the mouse hovering over a tile?
			if (inBounds) {
				if (!tile.hover) {
					tile.hover = true;
					tile.tint = 0x86bfda;
					this._ctrl.game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
				}
			}
			// If not, revert back to how it was.
			else if (tile.hover && !inBounds) {
				tile.hover = false;
				tile.tint = 0xffffff;
				this._ctrl.game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
			}
		});
	}

	private _onTap(tapCoords: Phaser.Plugin.Isometric.Point3) {
		//TODO: //this.unitController.move(this.unit, tile.isoX/this.config.cellSize, tile.isoY/this.config.cellSize);
		var tileClicked = this.isoGridGroup.find(t =>  t.isoBounds.containsXY(tapCoords.x, tapCoords.y));
		if(!!tileClicked) {
			this.activeTile.active = false;
			tileClicked.active = true;
			this.activeTile = tileClicked;
			this._ctrl.signals[GameEvent.GridCellActivated].dispatch(new GridTile(tileClicked, tileClicked.isoX/this._ctrl.config.cellSize, tileClicked.isoY/this._ctrl.config.cellSize));
		}
	}
}