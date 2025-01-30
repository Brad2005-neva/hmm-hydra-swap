import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import { HydraModal } from "@ui/hydraModal";
import WelcomePopupContent from "@ui/welcomePopupContent";
import HydraButton from "@ui/hydraButton";
import { LocationService } from "@hydraprotocol/services";

export function WelcomePopup({
  locationService = LocationService.instance(),
}: {
  locationService?: LocationService;
}) {
  const [openWelcomePopup, setOpenWelcomePopup] = useState(false);
  const isMainnet = useMemo(() => {
    return locationService.isMainnet();
  }, [locationService]);
  const navigate = useNavigate();
  const onClose = () => setOpenWelcomePopup(false);
  const goToFaucets = () => {
    onClose();
    navigate("/faucets");
  };

  useEffect(() => {
    const hasSeen = Cookies.get("hasSeenWelcome");
    if (!hasSeen) {
      Cookies.set("hasSeenWelcome", "1", { expires: 365 });
      setOpenWelcomePopup(true);
    }
  }, []);

  const mainContent = isMainnet ? (
    <WelcomePopupContent
      title="Welcome to Hydraswap 2.0!"
      content="In our preview mode, Hydraswap is still under development, usage is limited and we cannot
      guarantee the safety of any funds you deposit."
      callToAction={
        <HydraButton kind="secondary" onClick={onClose}>
          <span>I understand the risks</span>
        </HydraButton>
      }
    />
  ) : (
    <WelcomePopupContent
      title="Welcome to Hydraswap Devnet 2.0!"
      content="In devnet mode we only support testing tokens that you can access from our
          faucet."
      callToAction={
        <>
          <HydraButton kind="secondary" onClick={() => goToFaucets()}>
            <span>Get test tokens</span>
          </HydraButton>
          <HydraButton kind="secondary" onClick={onClose}>
            <span>Continue to the DEX</span>
          </HydraButton>
        </>
      }
    />
  );

  return (
    <HydraModal
      open={openWelcomePopup}
      onClose={onClose}
      mainContent={mainContent}
    />
  );
}
