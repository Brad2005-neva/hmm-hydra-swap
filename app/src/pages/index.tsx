import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import RoutesWrapper from "@ui/routesWrapper";
import FallbackProgressbar from "@ui/progressbar/fallbackProgressbar";
import Config from "../config";

const Swap = lazy(() => import("./swap"));
const Pools = lazy(() => import("./pools"));
const Faucets = lazy(() => import("./faucets"));

const PageRoutes = () => {
  return (
    <RoutesWrapper>
      <Routes>
        {Config.swap_enabled && (
          <Route
            path="/swap"
            element={
              <Suspense fallback={<FallbackProgressbar />}>
                <Swap />
              </Suspense>
            }
          />
        )}
        {Config.pools_enabled && (
          <Route
            path="/pools"
            element={
              <Suspense fallback={<FallbackProgressbar />}>
                <Pools />
              </Suspense>
            }
          />
        )}
        {Config.faucet_enabled && (
          <Route
            path="/faucets"
            element={
              <Suspense fallback={<FallbackProgressbar />}>
                <Faucets />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<Navigate replace to="/swap" />} />
      </Routes>
    </RoutesWrapper>
  );
};

export default PageRoutes;
