import { Typography } from "@mui/material";
import { FC, ReactNode } from "react";

export const LabeledText: FC<{
  label: string;
  content: string | ReactNode;
}> = ({ label, content }) => {
  return <Typography aria-label={label}>{content}</Typography>;
};

export default LabeledText;
