import {Status} from '../model/status.enum';

export class StyleUtils {

  static getBgColor(status: Status) {
    if (status === Status.GOOD) {
      return 'rgb(55, 155, 55)'; // green
    } else if (status === Status.WARNING) {
      return 'rgb(219, 123, 43)'; // orange
    } else if (status === Status.ERROR) {
      return 'rgb(210, 0, 20)'; // red;
    } else if (status === Status.RUNNING) {
      return 'rgb(219, 123, 43)'; // orange
    } else if (status === Status.IDLE) {
      return 'rgb(55, 155, 55)'; // green
    } else {
      return 'darkgray';
    }
  }

}
