export type Watch = (
  path: string,
  depth?: number,
  firstWatch?: boolean
) => void;

export type ComputeCallback = (
  getValue: (path: string, depth?: number, firstRun?: boolean) => any,
  change: any
) => any;
