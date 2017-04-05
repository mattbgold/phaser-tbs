export interface IStateManager {
	get(key: string): any;
	set(key: string, obj: any): void;
	subscribe(event: number, callback: Function): void;
	dispatch(event: number, payload?: any): void;
}