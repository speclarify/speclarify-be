class Node<T> {
  value: T;
  next: Node<T>;

  constructor(value: T) {
    this.value = value;
  }
}

export class Queue<T> {
  #head: Node<T> | undefined;
  #tail: Node<T> | undefined;
  #size: number;

  constructor() {
    this.clear();
  }

  public get size(): number {
    return this.#size;
  }

  public enqueue(value: T): void {
    const node = new Node(value);

    if (this.#head) {
      this.#tail!.next = node;
      this.#tail = node;
    } else {
      this.#head = node;
      this.#tail = node;
    }

    this.#size++;
  }

  public dequeue(): T | undefined {
    const current = this.#head;
    if (!current) {
      return;
    }

    this.#head = this.#head!.next;
    this.#size--;
    return current.value;
  }

  public clear(): void {
    this.#head = undefined;
    this.#tail = undefined;
    this.#size = 0;
  }

  public *[Symbol.iterator]() {
    let current = this.#head;

    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}
