import {Unit} from "../models/unit";
export class ArmyBuilder {
	private _units: Unit[];

	//this class is used to build armies in the army selection phase, then used to get the list of units to put into the grid.
	// also used to place units in that begin pjhase
	constructor() {
		this._units = [];
	}

	add(unit: Unit) {
		this._units.push(unit);
	}
	
	remove(unit: Unit) {
		this._units.splice(this._units.map(x => x.name).indexOf(unit.name), 1);
	}

	getList(): Unit[] {
		return this._units;
	}

	build() {
		//TODO: add to game as game objects?
	}
}