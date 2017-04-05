import {injectable} from "inversify";
import * as Phaser from 'phaser';
import Signal = Phaser.Signal;

@injectable()
export abstract class BaseController {
	abstract init(): void;
	abstract update(): void;
	abstract render(): void;
}