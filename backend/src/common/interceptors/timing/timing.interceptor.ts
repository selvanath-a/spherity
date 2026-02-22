import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, finalize } from 'rxjs';
import type { Request } from 'express';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const start = Date.now();

    return next.handle().pipe(
      finalize(() => {
        const reqDuration = Date.now() - start;
        const req = context.switchToHttp().getRequest<Request>();
        console.log(`${req.method} ${req.url} - ${reqDuration}ms`);
      }),
    );
  }
}
