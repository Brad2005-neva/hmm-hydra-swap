import { useEffect, useState } from "react";
import { useNetworkProvider } from "@hydraprotocol/services";
import { ClusterConnectionView } from "@ui/clusterConnection";

function ClusterConnection() {
  const { meta } = useNetworkProvider();
  const [rpcStatus, setRpcStatus] = useState(true);

  const checkPoll = () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);

    fetch(meta.endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth",
      }),
      signal: controller.signal,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        throw new Error("Connection Lost");
      })
      .then((_response) => {
        setRpcStatus(true);
      })
      .catch((_error) => {
        setRpcStatus(false);
      });
  };

  useEffect(() => {
    const timer: NodeJS.Timeout = setInterval(checkPoll, 10000);
    return () => clearInterval(timer);
  });

  return <>{!rpcStatus && <ClusterConnectionView />}</>;
}

export default ClusterConnection;
