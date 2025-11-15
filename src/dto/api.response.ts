export class ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode?: string;

  constructor(
    success: boolean,
    message: string,
    data: T | null = null,
    errorCode?: string,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errorCode = errorCode;
  }

  public static success<T>(
    data: T | null = null,
    message: string = 'Request successful',
  ): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data);
  }

  public static error<T>(message: string, errorCode?: string): ApiResponse<T> {
    return new ApiResponse<T>(false, message, null, errorCode);
  }
}
