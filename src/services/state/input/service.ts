import * as Phaser from 'phaser'
import {injectable} from "inversify";
import {BaseStateManager} from "../base";
import Point3 = Phaser.Plugin.Isometric.Point3;

@injectable()
export class InputStateManager extends BaseStateManager {
	constructor() {
		super();
	}

	cursorPos: Point3 = new Point3();
}

export enum InputEvent {
	MouseDown,
	MouseUp,
	Tap,
	DoubleTap,

	KeyAttack
}