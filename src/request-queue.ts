import { shallowEqual } from 'react-redux';
import { aicStore, updateAicInProgress } from './utils/aic-store';

const MAX_CYCLES = 10000;

export class RequestQueue {
  collectorMap = new Map();
  progressRequests = new Map();
  promiseQueue = Promise.resolve();
  inProgress = false;

  addCallback(callback, callbackParam) {
    if (callbackParam === undefined) {
      return;
    }

    // if callback comes with same params prevent adding in queue
    if (this.progressRequests.has(callback)) {
      if (shallowEqual(this.progressRequests.get(callback), callbackParam)) {
        return;
      }
    }

    if (this.collectorMap.has(callback)) {
      const params: unknown[] = this.collectorMap.get(callback);

      if (params.findIndex((param) => shallowEqual(param, callbackParam)) === -1) {
        params.push(callbackParam);
      }
    } else {
      this.collectorMap.set(callback, [callbackParam]);
    }
  }

  removeCallback(callback) {
    if (this.collectorMap.has(callback)) {
      this.collectorMap.delete(callback);
      this.progressRequests.delete(callback);
    }
  }

  getPromisesFromCollector() {
    return Promise.all(Array.from(this.collectorMap).map(
      ([callback, [firstParam]]) => {
        if (this.progressRequests.has(callback)) {
          return;
        }

        const newParams: unknown[] = this.collectorMap
          .get(callback)
          .filter((param) => param !== firstParam);

        if (!newParams.length) {
          this.collectorMap.delete(callback);
        } else {
          this.collectorMap.set(callback, newParams);
        }

        this.progressRequests.set(callback, firstParam);

        return Promise.resolve(callback(firstParam)).finally(() => {
          this.progressRequests.delete(callback);
        });
      }
    ));
  }

  async runRequests() {
    if (!this.collectorMap.size) {
      return;
    }

    aicStore.dispatch(updateAicInProgress(true));
    this.inProgress = true;
    let cycleCounter = 0;

    while (this.collectorMap.size || this.progressRequests.size) {
      // Prevent infinity loops
      if (cycleCounter === MAX_CYCLES) {
        break;
      }

      cycleCounter += 1;

      if (this.collectorMap.size) {
        this.promiseQueue.then(() => this.getPromisesFromCollector());
      } else if (!this.collectorMap.size && this.progressRequests.size) {
        // Interrupt cycle with async task
        this.promiseQueue.then(() => new Promise((resolve) => setTimeout(resolve, 1)));
      }

      await this.promiseQueue;
    }

    this.inProgress = false;
    aicStore.dispatch(updateAicInProgress(false));
  }
};


