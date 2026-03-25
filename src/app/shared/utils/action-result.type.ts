export type ActionResult<TSuccess, TErrorCode extends string> =
  | {
      success: true;
      data: TSuccess;
    }
  | {
      success: false;
      code: TErrorCode;
      message: string;
    };
