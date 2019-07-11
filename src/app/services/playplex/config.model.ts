import {Screen} from './screen.model';

export class Config {
  configId: string;
  imageServer: string;
  logoImage: string;
  screens: Screen[] = [];
}
