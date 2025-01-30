import { table, getBorderCharacters } from "table";

type Table = unknown[][];
type Str = string;
type Obj = Record<string, any>;
type List = unknown[];

function isTable(value: any): value is Table {
  return Array.isArray(value) && Array.isArray(value[0]);
}

function isList(value: any): value is List {
  return Array.isArray(value) && !Array.isArray(value[0]);
}

function isObj(value: any): value is Obj {
  return !isTable(value) && !isList(value) && typeof value === "object";
}

function withHeader(table: Table, header: string[] = []) {
  if (header.length === 0) return table;
  if (table[0].length !== header.length)
    throw new Error("wrong number of header columns!");

  return [header, ...table];
}

function printTable(data: Table, headers: string[] = [], log = console.log) {
  const hasHeader = headers.length > 0;
  const config = {
    border: {
      ...getBorderCharacters("void"),
      joinBody: `─`,
      joinJoin: ` `,
    },
    columnDefault: hasHeader
      ? undefined
      : {
          paddingLeft: 0,
          paddingRight: 1,
        },
    drawHorizontalLine: hasHeader ? (i: number) => i === 1 : () => false,
  };

  log(table(withHeader(data, headers), config));
}

// TODO: Enable json mode based on --json flag
export function render(
  input: Str | Table | List | Obj,
  columns: string[] = [],
  log = console.log
) {
  if (typeof input === "string") {
    log(input);
    return;
  }
  if (isTable(input)) {
    printTable(input, columns, log);
    return;
  }

  if (isList(input)) {
    const listAsTable = input.map((item: unknown) => [item]) as Table;
    printTable(listAsTable, undefined, log);
    return;
  }

  if (isObj(input)) {
    const objAsTable = renderEntry(input);
    printTable(objAsTable, undefined, log);
    return;
  }

  throw new Error("cannot identify input");
}

export function renderEntry(obj: any, path: string = ""): [string, any][] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = `${[path, k].filter((p) => p !== "").join(".")}`;
    if (`${v}` === "[object Object]") {
      return renderEntry(v, key);
    }
    return [[key, v]];
  });
}
