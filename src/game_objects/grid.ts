import {TbsController} from "../controllers/TbsController";
import Group = Phaser.Group;

export class Grid {
	//TODO: init method that creates the grid. keeps a 2d array of sprites
	// select cell method that highlights cell on click
	//      takes an arg to show move range
	//      recursive get neighbors, highlight
	//

	private _tileGroup: Group;

	constructor(private _ctrl: TbsController) {
		this.tileGroup = this._ctrl.game.add.group();
		let tile;
		for (var xx = 0; xx < sizeX; xx++) {
			for (var yy = 0; yy < sizeY; yy++) {
				// Create a tile using the new game.add.isoSprite factory method at the specified position.
				// The last parameter is the group you want to add it to (just like game.add.sprite)
				tile = this.game.add.isoSprite(xx*38, yy*38, 0, 'tile', 0, this._tileGroup);
				tile.anchor.set(0.5, 0);
			}
		}
	}
}