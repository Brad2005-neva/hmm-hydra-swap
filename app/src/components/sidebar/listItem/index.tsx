import { FC, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarListItem from "@ui/sidebar/SidebarListItem";

interface ListItemProps {
  name: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  link?: string;
  onClick?(): void;
}

const ListItem: FC<ListItemProps> = ({
  name,
  icon,
  activeIcon,
  link,
  onClick,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigatePage = () => {
    if (link) {
      navigate(link, { replace: true });
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <SidebarListItem
      name={name}
      icon={location.pathname === link ? activeIcon : icon}
      active={location.pathname === link}
      onClick={navigatePage}
    />
  );
};

export default ListItem;
