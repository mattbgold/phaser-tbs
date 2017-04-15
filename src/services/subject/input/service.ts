import * as Phaser from 'phaser'
import {injectable} from "inversify";
import {BaseSubject} from "../base";
import Point3 = Phaser.Plugin.Isometric.Point3;

@injectable()
export class InputSubject extends BaseSubject {
	constructor() {
		super();
	}

	cursorPos: Point3 = new Point3();
}
