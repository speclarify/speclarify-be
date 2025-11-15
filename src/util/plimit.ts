import { AsyncResource } from 'async_hooks';
import { Queue } from './queue';

export type LimitFunction = {
  readonly activeCount: number;
  readonly pendingCount: number;
  clearQueue: () => void;
  <Arguments extends unknown[], ReturnType>(
    fn: (...arguments_: Arguments) => PromiseLike<ReturnType> | ReturnType,
    ...arguments_: Arguments
  ): Promise<ReturnType>;
};

export function pLimit(concurrency: number): LimitFunction {
  if (
    !(
      (Number.isInteger(concurrency) ||
        concurrency === Number.POSITIVE_INFINITY) &&
      concurrency > 0
    )
  ) {
    throw new TypeError('Expected `concurrency` to be a number from 1 and up');
  }

  const queue = new Queue<any>();
  let activeCount = 0;

  function next(): void {
    activeCount--;

    if (queue.size > 0) {
      queue.dequeue()();
    }
  }

  const run = async (function_: any, resolve: any, arguments_: any) => {
    activeCount++;

    const result = (async () => function_(...arguments_))();

    resolve(result);

    try {
      await result;
    } catch {}

    next();
  };

  const enqueue = (function_: any, resolve: any, arguments_: any) => {
    queue.enqueue(
      AsyncResource.bind(run.bind(undefined, function_, resolve, arguments_)),
    );

    (async () => {
      await Promise.resolve();

      if (activeCount < concurrency && queue.size > 0) {
        queue.dequeue()();
      }
    })();
  };

  function generator(function_: any, ...arguments_: any[]): any {
    return new Promise((resolve) => {
      enqueue(function_, resolve, arguments_);
    });
  }

  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount,
    },
    pendingCount: {
      get: () => queue.size,
    },
    clearQueue: {
      value() {
        queue.clear();
      },
    },
  });

  return generator as LimitFunction;
}
