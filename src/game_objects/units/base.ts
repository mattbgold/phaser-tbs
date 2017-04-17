import * as Phaser from 'phaser';;
import Sprite = Phaser.Sprite;
import Game = Phaser.Game;
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;
import {Stats} from "../../models/stats";
import {Unit} from "../../models/unit";

export abstract class BaseUnit implements Unit {
	spr: IsoSprite;

	name: string;
	asset: string;

	belongsToPlayer: number;
	
	hasMovedThisTurn: boolean = false;
	hasActedThisTurn: boolean = false;
	
	x: number;
	y: number;
	
	committedX: number; //stores original position until a move is committed by selecting an action.
	committedY: number;
	
	hp: number; //current hp

	stats: Stats;

	abilities: any[];

	currentTint: number = 0xffffff;
	
	constructor(model: Unit, spr: IsoSprite) {
		this.spr = spr;
		this.spr.anchor.set(.5, .5);
		
		this._init(model);
	}
	
	private _init(unit: Unit): void {
		this.name = unit.name;
		this.asset = unit.asset;
		this.belongsToPlayer = unit.belongsToPlayer;
		this.x = unit.x;
		this.y = unit.y;
		this.committedX = unit.x;
		this.committedY = unit.y;
		this.stats = unit.stats;
		this.abilities = unit.abilities;

		this.hp = unit.stats.hp;
	}
	
	setXPosition(x): void {
		let sign = Math.sign(this.x - x);
		if (sign !== 0)
			this.spr.scale.x = sign;
		this.x = x;
	}
	setYPosition(y): void {
		let sign = Math.sign(y - this.y);
		if (sign !== 0)
			this.spr.scale.x = sign;
		this.y = y;
	}
	
	setTint(tint: number) {
		this.spr.tint = tint;
		this.currentTint = tint;
	}

	pointToUnit(other: BaseUnit): void {
		let sign = Math.sign(this.spr.x - other.spr.x);
		if (sign !== 0)
			this.spr.scale.x = sign;
	}

	get isDead(): boolean {
		return this.hp <= 0;
	}
}