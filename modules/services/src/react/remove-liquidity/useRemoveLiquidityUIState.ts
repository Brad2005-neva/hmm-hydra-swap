import { assign, createMachine } from "xstate";
import { useMachine } from "@xstate/react";
import { useCallback } from "react";
import { TxSuccessFn, TxFailureFn } from "../../services/types";

export type RemoveLiquidityUIState = ReturnType<
  typeof useRemoveLiquidityUIState
>["state"];

export const removeLiquidityMachine = createMachine({
  tsTypes: {} as import("./useRemoveLiquidityUIState.typegen").Typegen0,
  id: "remove_liquidity_flow",
  schema: {
    context: {} as {
      error?: string;
      hash?: string;
    },
    events: {} as
      | { type: "SUBMIT" }
      | { type: "CANCEL" }
      | { type: "error.platform"; data: string }
      | { type: "done.invoke.removeLiquidity"; data: string },
    services: {} as {
      removeLiquidity: {
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
        id: "removeLiquidity",
        src: "removeLiquidity",
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
export function useRemoveLiquidityUIState(
  removeLiquidity: () => Promise<string | undefined>,
  onSuccess: TxSuccessFn,
  onFailure: TxFailureFn
) {
  const [state, send] = useMachine(removeLiquidityMachine, {
    services: {
      removeLiquidity,
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
