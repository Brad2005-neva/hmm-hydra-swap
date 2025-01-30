import React, { FC } from "react";
import { makeStyles } from "@mui/styles";
import { InputBase } from "@mui/material";

import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  searchAsset: {
    border: `1px solid ${palette.white}${alpha[5]}`,
    borderRadius: "6px",
    "& input": {
      color: `${palette.white}${alpha[65]}`,
      fontSize: "14px",
      lineHeight: "17px",
      height: "17px",
      padding: "20px 16px",
    },
  },
});

interface SearchAssetProps {
  value: string;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
  placeholder?: string;
}

export const SearchAsset: FC<SearchAssetProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const classes = useStyles();

  return (
    <InputBase
      className={classes.searchAsset}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      autoFocus
    />
  );
};
