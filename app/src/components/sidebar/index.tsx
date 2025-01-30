import React, { FC, useState, useEffect } from "react";

import {
  Trading,
  ActiveTrading,
  Swap,
  ActiveSwap,
  Pools,
  ActivePools,
  Faucets,
  ActiveFaucets,
  Network,
  Doc,
  Bars,
} from "@ui/icons";
import Config from "../../config";
import { useNetworkProvider } from "@hydraprotocol/services";
import { useNetworkSwitcher } from "../networkSwitcher";
import { SideBarItem } from "@types";
import { SidebarView } from "@ui/sidebar";
import { WalletButton } from "../wallet";
import ListItem from "./listItem";

export const Sidebar: FC = () => {
  const { meta, mainnetMode } = useNetworkProvider();
  const [open, setOpen] = useState(true);
  const [mobile, setMobile] = useState(false);
  const networkSwitcher = useNetworkSwitcher();

  const sidebarItems: SideBarItem[] = [
    {
      name: "Trading",
      icon: <Trading />,
      activeIcon: <ActiveTrading />,
      link: "#",
      isActive: Config.trading_enabled,
    },
    {
      name: "Swap",
      icon: <Swap />,
      activeIcon: <ActiveSwap />,
      link: "/swap",
      isActive: Config.swap_enabled,
    },
    {
      name: "Pools",
      icon: <Pools />,
      activeIcon: <ActivePools />,
      link: "/pools",
      isActive: Config.pools_enabled,
    },
    {
      name: "Faucets",
      icon: <Faucets />,
      activeIcon: <ActiveFaucets />,
      link: "/faucets",
      isActive:
        Config.faucet_enabled &&
        (meta.network === "localnet" || meta.network === "devnet"),
    },
  ];

  useEffect(() => {
    // Windows Resize Handler
    function handleResize() {
      setOpen(window.innerWidth > 900 || window.innerWidth <= 600);
      setMobile(window.innerWidth <= 600);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDrawer = () => {
    setOpen(!open);
  };

  return (
    <SidebarView
      handleDrawer={handleDrawer}
      launchNetworkSwitcher={networkSwitcher.launch}
      networkName={meta.name}
      mainnetMode={mainnetMode}
      mobile={mobile}
      open={open}
      sidebarItems={sidebarItems.map((item, index) => {
        if (item.isActive)
          return (
            <ListItem
              icon={item.icon}
              activeIcon={item.activeIcon}
              name={item.name}
              link={item.link}
              key={index}
            />
          );

        return <React.Fragment key={index}></React.Fragment>;
      })}
      utilItems={[
        <ListItem
          icon={<Network />}
          name={meta.name}
          onClick={networkSwitcher.launch}
        />,
        <ListItem icon={<Doc />} name="Test Guide" />,
        <ListItem icon={<Bars />} name="Docs" />,
      ]}
      walletButton={<WalletButton mobile={mobile} />}
    />
  );
};
