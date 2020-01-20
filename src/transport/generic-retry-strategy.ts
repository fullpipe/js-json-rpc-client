import { throwError, Observable, timer } from "rxjs";
import { mergeMap } from "rxjs/operators";

export interface RetryConfig {
  maxRetryAttempts?: number;
  scalingDuration?: number;
  excludedStatusCodes?: number[];
}

export const genericRetryStrategy = ({
  maxRetryAttempts = 10,
  scalingDuration = 500,
  excludedStatusCodes = []
}: RetryConfig = {}) => (errors: Observable<any>) => {
  return errors.pipe(
    mergeMap((error, i) => {
      const retryAttempt = i + 1;

      if (
        retryAttempt > maxRetryAttempts ||
        excludedStatusCodes.find(e => e === error.status)
      ) {
        return throwError(error);
      }

      let delay =
        retryAttempt * scalingDuration +
        Math.random() * scalingDuration -
        scalingDuration / 2;

      return timer(delay);
    })
  );
};
