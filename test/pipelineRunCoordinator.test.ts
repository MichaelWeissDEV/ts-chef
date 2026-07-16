import { PipelineRunCoordinator } from "../src/panels/pipelineRunCoordinator";

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("PipelineRunCoordinator", () => {
  test("does not start a queued delivery after its run was invalidated", async () => {
    const coordinator = new PipelineRunCoordinator();
    const generation = coordinator.beginRun();
    const delivery = jest.fn(async () => undefined);
    const pending = coordinator.deliverIfCurrent(generation, delivery);
    coordinator.invalidate();

    await expect(pending).resolves.toBe(false);
    expect(delivery).not.toHaveBeenCalled();
  });

  test("serialises deferred side effects so they cannot complete out of order", async () => {
    const coordinator = new PipelineRunCoordinator();
    const firstGate = deferred();
    const order: string[] = [];
    const firstGeneration = coordinator.beginRun();
    const first = coordinator.deliverIfCurrent(firstGeneration, async () => {
      order.push("first:start");
      await firstGate.promise;
      order.push("first:end");
    });

    await Promise.resolve();
    const secondGeneration = coordinator.beginRun();
    const second = coordinator.deliverIfCurrent(secondGeneration, async () => {
      order.push("second:start");
      order.push("second:end");
    });
    await Promise.resolve();
    expect(order).toEqual(["first:start"]);

    firstGate.resolve();
    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
    expect(order).toEqual([
      "first:start",
      "first:end",
      "second:start",
      "second:end",
    ]);
  });
});
