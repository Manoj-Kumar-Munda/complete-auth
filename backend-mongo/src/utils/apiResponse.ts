import { StatusCode } from "./constants";

class ApiResponse {
  statusCode: StatusCode;
  data: any;
  message: string;
  success: boolean;
  /**
   * Constructs an ApiResponse object.
   * @param {StatusCode} statusCode - The HTTP status code for the response.
   * @param {any} data - The data to be included in the response.
   * @param {string} [message="Success"] - An optional message for the response.
   */
  constructor(statusCode: StatusCode, data: any, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
