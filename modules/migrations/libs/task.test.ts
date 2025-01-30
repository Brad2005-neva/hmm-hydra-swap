import { TaskRunner } from "./task";

it("should run a task each time if there are not preconditions", async () => {
  const taskMock = jest.fn();
  const logger = jest.fn();
  const onError = jest.fn();
  const task = TaskRunner.create(logger, onError);
  task.add("my task", taskMock);
  await task.run();

  expect(taskMock).toHaveBeenCalledTimes(1);
  expect(logger.mock.calls).toEqual([
    [{ label: "my task", status: "running" }],
    [{ label: "my task", status: "done" }],
    [{ label: "1", status: "summary-run" }],
    [{ label: "0", status: "summary-skipped" }],
    [{ label: "0", status: "summary-error" }],
  ]);
});

it("should not run a task if it has already been run", async () => {
  const checkHasBeenRun = async () => true;
  const taskMock = jest.fn();
  const logger = jest.fn();
  const onError = jest.fn();
  const task = TaskRunner.create(logger, onError);
  task.add("my task", taskMock).unless(checkHasBeenRun);
  await task.run();
  expect(taskMock).not.toHaveBeenCalled();
  expect(logger.mock.calls).toEqual([
    [{ label: "my task", status: "running" }],
    [{ label: "my task", status: "skipped" }],
    [{ label: "0", status: "summary-run" }],
    [{ label: "1", status: "summary-skipped" }],
    [{ label: "0", status: "summary-error" }],
  ]);
});

it("should ", () => {
  TaskRunner.STANDARD_LOGGER({ label: "This is finished.", status: "done" });
  TaskRunner.STANDARD_LOGGER({
    label: "Yikes that didn't work",
    status: "error",
    detail: "that really didnt work..",
  });
  TaskRunner.STANDARD_LOGGER({
    label: "Ok let's get going!",
    status: "running",
  });
  TaskRunner.STANDARD_LOGGER({ label: "Better skip this", status: "skipped" });
});
