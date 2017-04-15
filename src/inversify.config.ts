import "reflect-metadata";

export abstract class ContainerKeys {
	static CTRL_TITLE: string = 'TitleControllers';
	static CTRL_GAME: string = 'GameControllers';
	static MAP_BUILDER: string = 'IMapBuilder';
	static AI_FACTORY: string = 'IArmyCommandStrategyFactory';
	static CONFIG: string = 'config';
}

import {Container, interfaces} from 'inversify';
import {UnitController} from "./controllers/game/unit/controller";
import {GridController} from "./controllers/game/grid/controller";
import {ContextMenuController} from "./controllers/game/contextmenu/controller";
import {GameController} from "./controllers/game/controller";
import {InputController} from "./controllers/shared/input/controller";
import {BaseController} from "./controllers/base";
import {GameConfig, getConfig} from "./config";
import {IMapBuilder} from "./services/map_builder/interface";
import {MapBuilder} from "./services/map_builder/service";
import Factory = interfaces.Factory;
import {ArmyCommandStrategyFactory} from "./services/army_command_strategy/factory/service";
import {IArmyCommandStrategyFactory} from "./services/army_command_strategy/factory/interface";
import {GameSubject} from "./services/subject/game";
import {InputSubject} from "./services/subject/input";
import {AIController} from "./controllers/game/ai/controller";
import {SystemController} from "./controllers/shared/system/controller";
import {SystemSubject} from "./services/subject/system";

let container = new Container();

container.bind<GameConfig>('config').toConstantValue(getConfig());

// controllers (order here determines order of lifecycle fn calls)
container.bind<BaseController>(ContainerKeys.CTRL_TITLE).to(InputController).inSingletonScope();
container.bind<BaseController>(ContainerKeys.CTRL_TITLE).to(SystemController).inSingletonScope();

container.bind<BaseController>(ContainerKeys.CTRL_GAME).to(InputController).inSingletonScope();
container.bind<BaseController>(ContainerKeys.CTRL_GAME).to(SystemController).inSingletonScope();
container.bind<BaseController>(ContainerKeys.CTRL_GAME).to(GameController).inSingletonScope();
container.bind<BaseController>(ContainerKeys.CTRL_GAME).to(ContextMenuController).inSingletonScope();
container.bind<BaseController>(ContainerKeys.CTRL_GAME).to(GridController).inSingletonScope();
container.bind<BaseController>(ContainerKeys.CTRL_GAME).to(UnitController).inSingletonScope();
container.bind<BaseController>(ContainerKeys.CTRL_GAME).to(AIController).inSingletonScope();

// subjects
container.bind<GameSubject>(GameSubject).toSelf().inSingletonScope();
container.bind<InputSubject>(InputSubject).toSelf().inSingletonScope();
container.bind<SystemSubject>(SystemSubject).toSelf().inSingletonScope();

// other services
container.bind<IMapBuilder>(ContainerKeys.MAP_BUILDER).to(MapBuilder).inSingletonScope();
container.bind<IArmyCommandStrategyFactory>(ContainerKeys.AI_FACTORY).to(ArmyCommandStrategyFactory).inSingletonScope();

export default container;