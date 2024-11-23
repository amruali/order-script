import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
} from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();

        // Flatten the array of validation messages into a single string
        const message =
            Array.isArray(exceptionResponse.message)
                ? exceptionResponse.message.join(', ')
                : exceptionResponse.message;


        response.status(status).json({
            statusCode: status,
            message,
            error: exceptionResponse.error,
        });
    }
}
