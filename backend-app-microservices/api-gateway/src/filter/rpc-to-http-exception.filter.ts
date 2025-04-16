import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { status } from '@grpc/grpc-js';

@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception && typeof exception === 'object' && 'code' in exception) {
      const grpcCode = exception.code;
      message = exception.details || message;

      switch (grpcCode) {
        case status.OK:
          httpStatus = HttpStatus.OK;
          break;
        case status.CANCELLED:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = exception.details || 'Request was cancelled';
          break;
        case status.UNKNOWN:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          message = exception.details || 'Unknown error occurred';
          break;
        case status.INVALID_ARGUMENT:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = exception.details || 'Invalid argument';
          break;
        case status.DEADLINE_EXCEEDED:
          httpStatus = HttpStatus.GATEWAY_TIMEOUT;
          message = exception.details || 'Deadline exceeded';
          break;
        case status.NOT_FOUND:
          httpStatus = HttpStatus.NOT_FOUND;
          message = exception.details || 'Resource not found';
          break;
        case status.ALREADY_EXISTS:
          httpStatus = HttpStatus.CONFLICT;
          message = exception.details || 'Resource already exists';
          break;
        case status.PERMISSION_DENIED:
          httpStatus = HttpStatus.FORBIDDEN;
          message = exception.details || 'Permission denied';
          break;
        case status.UNAUTHENTICATED:
          httpStatus = HttpStatus.UNAUTHORIZED;
          message = exception.details || 'Unauthenticated';
          break;
        case status.RESOURCE_EXHAUSTED:
          httpStatus = HttpStatus.TOO_MANY_REQUESTS;
          message = exception.details || 'Resource exhausted';
          break;
        case status.FAILED_PRECONDITION:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = exception.details || 'Failed precondition';
          break;
        case status.ABORTED:
          httpStatus = HttpStatus.CONFLICT;
          message = exception.details || 'Operation aborted';
          break;
        case status.OUT_OF_RANGE:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = exception.details || 'Out of range';
          break;
        case status.UNIMPLEMENTED:
          httpStatus = HttpStatus.NOT_IMPLEMENTED;
          message = exception.details || 'Operation not implemented';
          break;
        case status.INTERNAL:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          message = exception.details || 'Internal gRPC error';
          break;
        case status.UNAVAILABLE:
          httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
          message = exception.details || 'Service unavailable';
          break;
        case status.DATA_LOSS:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          message = exception.details || 'Data loss';
          break;
        default:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          message = exception.details || 'Unhandled gRPC error';
          break;
      }
    } else {
      message = exception.message || message;
      httpStatus = exception.status || HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(httpStatus).json({
      statusCode: httpStatus,
      message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
