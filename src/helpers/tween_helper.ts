import * as Phaser from 'phaser';
import {inject, injectable} from "inversify";

@injectable()
export class TweenHelper {
	constructor(private _game: Phaser.Game) {}

	tweenTint(spr: Phaser.Sprite, endTint: number, time: number, callback: Function = null) {
		if(!spr)
			return;

		let startTint = spr.tint;

		let tweenStep = { step: 0 };

		let tween = this._game.add.tween(tweenStep).to({ step: 100 }, time, Phaser.Easing.Linear.None);

		tween.onUpdateCallback(() => {
			spr.tint = Phaser.Color.interpolateColor(startTint, endTint, 100, tweenStep.step);
		});

		tween.onComplete.add(() => spr.tint = endTint);

		if (callback)
			tween.onComplete.add(callback);

		tween.start();
	}
}