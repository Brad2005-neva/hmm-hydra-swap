import { ReactNode } from "react";
import { HydraPageContainer, HydraPageHeader } from "./pageContainer";

const HydraPage = ({
  icon,
  title,
  description,
  content,
}: {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  content: ReactNode;
}) => {
  return (
    <HydraPageContainer>
      <HydraPageHeader icon={icon} title={title} description={description} />
      {content}
    </HydraPageContainer>
  );
};

export default HydraPage;
