export interface JsonPatchOperation {
  /**
   * The path to copy from for the Move/Copy operation.
   */
  from: string;
  /**
   * The patch operation
   */
  op: Operation;
  /**
   * The path for the operation. In the case of an array, a zero based index can be used to specify the position in the array (e.g. /biscuits/0/name). The "-" character can be used instead of an index to insert at the end of the array (e.g. /biscuits/-).
   */
  path: string;
  /**
   * The value for the operation. This is either a primitive or a JToken.
   */
  value: any;
}

export enum Operation {
  Add = 0,
  Remove = 1,
  Replace = 2,
  Move = 3,
  Copy = 4,
  Test = 5,
}

export enum PackageViews {
  Local = 'local',
  PreRelease = 'Prerelease',
  Release = 'Release',
}

export type Feed = {
  name: string;
  id: string;
  description: string;
  isReadOnly: boolean;
  url: string;
  viewName: string;
  viewId: string;
  defaultViewId: string;
};

export interface ResponseList<T>{
  count: number;
  value: T[];
}