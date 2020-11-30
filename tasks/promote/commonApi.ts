
// eslint-disable-next-line no-shadow
export enum JsonPatchOperationTypeEnum {
  add = 0,
  remove = 1,
  replace = 2,
  move = 3,
  copy = 4,
  test = 5,
}

export interface JsonPatchOperation {
  /**
   * The path to copy from for the Move/Copy operation.
   */
  from: string;
  /**
   * The patch operation
   */
  op: JsonPatchOperationTypeEnum;
  /**
   * The path for the operation. In the case of an array, a zero based index can be used to specify the position in the array (e.g. /biscuits/0/name). The "-" character can be used instead of an index to insert at the end of the array (e.g. /biscuits/-).
   */
  path: string;
  /**
   * The value for the operation. This is either a primitive or a JToken.
   */
  value: any;
}

// eslint-disable-next-line no-shadow
export enum PackageViews {
  local = 'local',
  preRelease = 'Prerelease',
  release = 'Release',
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