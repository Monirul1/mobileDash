export class Computer {
  labels: string[] = [];

  constructor(public name: string, public description: string, public idle: boolean,
              public offline: boolean, public tempOffline: boolean, public offlineReason: string) {}

}
