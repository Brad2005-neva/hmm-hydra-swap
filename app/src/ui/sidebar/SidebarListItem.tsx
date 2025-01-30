import { FC, ReactNode, useCallback } from "react";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

interface SidebarListItemProps {
  name: string;
  icon: ReactNode;
  active: boolean;
  onClick(): void;
}

const SidebarListItem: FC<SidebarListItemProps> = ({
  name,
  icon,
  active,
  onClick,
}) => {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <ListItemButton onClick={handleClick} aria-label={name}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText className={active ? "active" : ""} primary={name} />
    </ListItemButton>
  );
};

export default SidebarListItem;
