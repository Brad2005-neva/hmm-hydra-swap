import chalk from "chalk";

export type Task = {
  name: string;
  task: () => Promise<void>;
  unlessFn: () => Promise<boolean>;
};

type LogEvent = {
  label: string;
  status:
    | "willrun"
    | "dryrun"
    | "running"
    | "done"
    | "skipped"
    | "error"
    | "summary-run"
    | "summary-skipped"
    | "summary-error";
  detail?: any;
};

const TEMPLATES = {
  skipped(label: string) {
    return `${chalk.bgCyanBright(
      chalk.bold(" • ")
    )} SKIPPING: ${chalk.cyanBright(label)} ${chalk.bgCyanBright(
      chalk.bold(" • ")
    )}`;
  },
  done(label: string) {
    return `${chalk.bgGreen(chalk.black(chalk.bold(" ✓ ")))} ${chalk.green(
      label
    )} ${chalk.bgGreen(chalk.black(chalk.bold(" ✓ ")))}\n`;
  },
  error(label: string) {
    return `${chalk.bgRedBright(chalk.bold(" ! "))} ${chalk.redBright(
      label
    )} ${chalk.redBright("x")}`;
  },
  running(label: string) {
    return `\n\n${chalk.yellow(chalk.bold("❱❱❱"))} ${chalk.white(label)} 🏃 `;
  },
  dryrun(label: string) {
    return `\n\n${chalk.yellow(chalk.bold("❰o❱"))} ${chalk.white(label)} 🏃 `;
  },
  willrun(label: string) {
    return `${chalk.bgGrey(chalk.black(chalk.bold(" ✓ ")))} ${chalk.black(
      label
    )} ${chalk.bgGrey(chalk.black(chalk.bold(" ✓ ")))}\n`;
  },
  summaryRun(label: string) {
    return `\n\n${chalk.green(label)}${chalk.green("\trun(s)")}`;
  },
  summarySkipped(label: string) {
    return `${chalk.yellow(label)}${chalk.yellow("\tskipped")}`;
  },
  summaryError(label: string) {
    return `${chalk.red(label)}${chalk.red("\terror(s)")}`;
  },
};

function getTemplate(event: LogEvent) {
  switch (event.status) {
    case "done":
      return TEMPLATES.done;
    case "dryrun":
      return TEMPLATES.dryrun;
    case "error":
      return TEMPLATES.error;
    case "running":
      return TEMPLATES.running;
    case "skipped":
      return TEMPLATES.skipped;
    case "summary-error":
      return TEMPLATES.summaryError;
    case "summary-skipped":
      return TEMPLATES.summarySkipped;
    case "summary-run":
    default:
      return TEMPLATES.summaryRun;
  }
}

export const standardLogger = (event: LogEvent) => {
  const template = getTemplate(event);
  console.log(template(event.label));
};

function quit(err: any) {
  console.log(err);
  process.exit(1);
}

export class TaskRunner {
  private tasks: Task[] = [];

  constructor(
    private log = standardLogger,
    private onError = (err: any) => {
      console.log(err);
    }
  ) {}

  add = (name: string, task: () => Promise<any>) => {
    const tasks = this.tasks;
    const len = tasks.push({
      name,
      task,
      unlessFn: async () => false,
    });
    return {
      unless(unlessFn = async () => false) {
        tasks[len - 1].unlessFn = unlessFn;
      },
    };
  };

  run = async (dryRun = false) => {
    let runcount = 0;
    let skipcount = 0;
    let errorcount = 0;

    for (const task of this.tasks) {
      try {
        if (!dryRun) {
          this.log({ label: task.name, status: "running" });
        } else {
          this.log({ label: task.name, status: "dryrun" });
        }

        if (await task.unlessFn()) {
          this.log({ label: task.name, status: "skipped" });
          skipcount++;
          continue;
        }

        if (!dryRun) {
          await task.task();
          this.log({ label: task.name, status: "done" });
        } else {
          this.log({ label: task.name, status: "willrun" });
        }
        runcount++;
      } catch (err) {
        this.log({ label: task.name, status: "error", detail: err });
        errorcount++;
        this.onError(err);
      }
    }

    this.log({ label: `${runcount}`, status: "summary-run" });
    this.log({ label: `${skipcount}`, status: "summary-skipped" });
    this.log({ label: `${errorcount}`, status: "summary-error" });
  };
  static create = (
    logger = standardLogger,
    error = (err: any) => {
      console.error(err);
    }
  ) => new TaskRunner(logger, error);

  static STANDARD_LOGGER = standardLogger;
  static QUIT_ON_ERROR = quit;
}
