/**
 * Coordinates asynchronous panel runs without trusting webview request IDs.
 * Output side effects are serialised so clipboard/editor/document writes cannot
 * overlap or complete out of order.
 */
export class PipelineRunCoordinator {
  private generation = 0;
  private deliveryTail: Promise<void> = Promise.resolve();

  beginRun(): number {
    this.generation += 1;
    return this.generation;
  }

  invalidate(): void {
    this.generation += 1;
  }

  isCurrent(generation: number): boolean {
    return generation === this.generation;
  }

  async deliverIfCurrent(
    generation: number,
    deliver: () => Promise<void>,
  ): Promise<boolean> {
    const pending = this.deliveryTail.then(async () => {
      if (!this.isCurrent(generation)) return false;
      await deliver();
      return true;
    });
    this.deliveryTail = pending.then(
      () => undefined,
      () => undefined,
    );
    return pending;
  }
}
