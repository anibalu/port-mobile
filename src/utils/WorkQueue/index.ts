/**
 * For two co-dependent communication channels to communicate with each
 * other asynchronously, we set up message queues to pass information between them.
 * These queues need to support atomic enqueue and dequeues, which is why we use
 * async-mutex.
 */

import {Mutex} from 'async-mutex';

/**
 * Work queue that supports asynchronously atomic opeerations.
 */
export default class WorkQueue<T> {
  private queue: T[];
  private lock: Mutex;
  constructor() {
    this.queue = [];
    this.lock = new Mutex();
  }

  /**
   * Add an entity to the qowk queue
   * @param value An entitiy to add to the queue
   */
  async enqueue(value: T): Promise<void> {
    await this.lock.acquire();
    this.queue.push(value);
    await this.lock.release();
  }

  /**
   * Get an element from the work queue to process
   * @returns an entity from the queue to process, or null if empty
   */
  async dequeue(): Promise<T | null> {
    await this.lock.acquire();
    let val: T | null;
    if (this.queue.length === 0) {
      val = null;
    } else {
      val = this.queue[0];
      this.queue = this.queue.slice(1);
    }
    await this.lock.release();
    return val;
  }

  /**
   * Empty the queue
   */
  async flush(): Promise<void> {
    await this.lock.acquire();
    this.queue = [];
    await this.lock.release();
  }
}
