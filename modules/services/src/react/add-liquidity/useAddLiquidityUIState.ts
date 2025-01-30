import { assign, createMachine } from "xstate";
import { useMachine } from "@xstate/react";
import { useCallback } from "react";
import { TxSuccessFn, TxFailureFn } from "../../services/types";

export type AddLiquidityUIState = ReturnType<
  typeof useAddLiquidityUIState
>["state"];

export const addLiquidityMachine = createMachine({
  tsTypes: {} as import("./useAddLiquidityUIState.typegen").Typegen0,
  id: "add_liquidity_flow",
  schema: {
    events: {} as
      | { type: "SUBMIT" }
      | { type: "CANCEL" }
      | { type: "error.platform"; data: string }
      | { type: "done.invoke.addLiquidity"; data: string },
    context: {} as {
      error?: string;
      hash?: string;
    },
    services: {} as {
      addLiquidity: {
        // The data that gets returned from the service
        data: string | undefined;
      };
    },
  },
  initial: "edit",
  context: {
    hash: undefined,
    error: undefined,
  },
  states: {
    edit: {
      on: {
        SUBMIT: "preview",
      },
    },
    preview: {
      on: {
        SUBMIT: "process",
        CANCEL: "edit",
      },
    },
    process: {
      invoke: {
        id: "addLiquidity",
        src: "addLiquidity",
        onDone: "done",
        onError: "error",
      },
    },
    error: {
      entry: ["saveError", "onFailure"],
      on: {
        CANCEL: "edit",
      },
    },
    done: {
      entry: ["saveHash", "onSuccess"],
      on: {
        CANCEL: "edit",
      },
    },
  },
});

// take commands and return controls for a statemachine that represents the flow of the UI
export function useAddLiquidityUIState(
  addLiquidity: () => Promise<string | undefined>,
  onSuccess: TxSuccessFn,
  onFailure: TxFailureFn
) {
  const [state, send] = useMachine(addLiquidityMachine, {
    services: {
      addLiquidity,
    },
    actions: {
      onSuccess: ({ hash }) => hash && onSuccess(hash),
      onFailure: ({ error }) => error && onFailure(error),
      saveError: assign((_, event) => ({
        error: `${event.data}`,
      })),
      saveHash: assign((_, event) => ({
        hash: event.data,
      })),
    },
  });

  const onSendSubmit = useCallback(() => {
    send("SUBMIT");
  }, [send]);

  const onSendCancel = useCallback(() => {
    send("CANCEL");
  }, [send]);

  return {
    onSendCancel,
    onSendSubmit,
    state,
  };
}
