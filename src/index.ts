import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import 'phaser-plugin-isometric/dist/phaser-plugin-isometric';
import Group = Phaser.Group;

class SimpleGame {
  game: Phaser.Game;
  logo: Phaser.Sprite;
  cursors: Phaser.CursorKeys;

  constructor() {
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, "content", this);
  }

  cursorPos: any;
  isoGroup: Group;

  preload = () => {
    //assets
    this.game.load.image("tile", "./assets/images/cube.png");

    //game engine settings
    this.game.time.advancedTiming = true;

    //plugins
    this.game.plugins.add(Phaser.Plugin.Isometric);

    this.game.iso.anchor.setTo(0.5, 0.2);
  }

  create() {
    // Create a group for our tiles.
    this.isoGroup = this.game.add.group();

    // Let's make a load of tiles on a grid.
    this.spawnTiles(this.isoGroup);

    // Provide a 3D position for the cursor
    this.cursorPos = new Phaser.Plugin.Isometric.Point3();
  }

  render() {
    this.game.debug.text("Move your mouse around!", 2, 36, "#ffffff");
    this.game.debug.text(this.game.time.fps || '--', 2, 14, "#a7aebe");
  }

  update() {
    // Update the cursor position.
    // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
    // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
    this.game.iso.unproject(this.game.input.activePointer.position, this.cursorPos);

    // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
    this.isoGroup.forEach(tile =>  {
      var inBounds = tile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
      // If it does, do a little animation and tint change.
      if (!tile.selected && inBounds) {
        tile.selected = true;
        tile.tint = 0x86bfda;
        this.game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
      }
      // If not, revert back to how it was.
      else if (tile.selected && !inBounds) {
        tile.selected = false;
        tile.tint = 0xffffff;
        this.game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
      }
    });
  }

  private spawnTiles(group: Group) {
    var tile;
    for (var xx = 0; xx < 256; xx += 38) {
      for (var yy = 0; yy < 256; yy += 38) {
        // Create a tile using the new game.add.isoSprite factory method at the specified position.
        // The last parameter is the group you want to add it to (just like game.add.sprite)
        tile = this.game.add.isoSprite(xx, yy, 0, 'tile', 0, group);
        tile.anchor.set(0.5, 0);
      }
    }
  }
}

window.onload = () => {
  const game = new SimpleGame();
};