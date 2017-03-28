import * as Phaser from 'phaser';
import {GameController} from "../controller";
import Group = Phaser.Group;
export class GridController {
	isoGridGroup: Group;
	
	constructor(private _ctrl: GameController) {
	}
	//TODO: fires events for clicking grid cells, Handles events for game state change, etc. 
	//In charge of managing state of each grid cell. Highlighted, active, etc...

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
	}
}