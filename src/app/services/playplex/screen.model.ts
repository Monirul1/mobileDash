export class Screen {
  dataSource: string;
  dataSourceTimestamp: number;

  constructor(public id: string, public type: string, public url: string, public urlTimestamp: number) {}

}
