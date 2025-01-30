import { Box, Dialog, Typography, IconButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { FC, ReactNode } from "react";
import HydraButton from "../hydraButton";
import cn from "classnames";
import DialogContent from "@mui/material/DialogContent";

import { palette, alpha } from "@utils/palette";
import { Close } from "../icons";

const useStyles = makeStyles({
  title: {
    borderBottom: `1px solid ${palette.white}${alpha[5]}`,
    color: palette.white,
    fontSize: "18px",
    fontWeight: "500",
    lineHeight: "22px",
    padding: "23px 23px 24px",
  },
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "24px 23px",
    "& label, & p": {
      color: `${palette.white}${alpha[65]}`,
      fontSize: "14px",
      lineHeight: "17px",
    },
  },
  subContainer: {
    borderTop: `1px solid ${palette.white}${alpha[5]}`,
    padding: "24px 23px 14px",
  },
  inlineWrapper: {
    display: "flex",
    color: `${palette.white}${alpha[85]}`,
    justifyContent: "space-between",
    marginBottom: "10px",
    "& p": {
      fontSize: "14px",
      lineHeight: "17px",
    },
  },
  inlineEndText: {
    color: palette.white,
    textAlign: "end",
  },
  footer: {
    borderRadius: "0 0 4px 4px",
    color: `1px solid ${palette.white}${alpha[65]}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 23px 23px",
    "& .MuiButton-root": {
      "& > p": {
        textTransform: "uppercase",
      },
    },
  },
  dialog: {
    "& .MuiDialog-container": {
      alignItems: "flex-start",
    },
    "& .MuiDialog-paper": {
      background: `linear-gradient(180deg, ${palette.green.light}${alpha[25]} 0%, ${palette.blue.light}${alpha[0]} 100%)`,
      borderRadius: "6px",
      position: "relative",
      padding: "1px",
      marginTop: "84px",
      marginBottom: "84px",
      width: "420px",
      maxHeight: "calc(100% - 168px)",
      maxWidth: "800px",
      "@media (max-width:600px)": {
        width: "100% !important",
        margin: "80px 10px",
      },
    },
    "&.dialog-large": {
      "& .MuiDialog-paper": {
        width: "800px",
      },
    },
  },
  contentWrapper: {
    background: palette.darkBlue.primary,
    borderRadius: "6px",
    position: "relative",
    height: "100%",
    overflowY: "auto",
  },
  closeButton: {
    padding: "0",
    position: "absolute",
    top: "29px",
    right: "24px",
    "& svg": {
      color: `${palette.white}${alpha[45]}`,
      width: "14px",
      height: "14px",
    },
  },
  dialogContent: {
    padding: "0px",
  },
});

interface ModalProps {
  open: boolean;
  onClose(): void;
  title?: string;
  mainContent: ReactNode;
  subContent?: ReactNode;
  buttonText?: string;
  onConfirm?(): void;
  buttonDisabled?: boolean;
  buttonAriaLabel?: string;
}

interface ModalContainerProps {
  children: ReactNode;
  open: boolean;
  onClose(): void;
  size?: string;
}

export const Title = ({ text }: { text: string }) => {
  const classes = useStyles();

  return <Typography className={classes.title}>{text}</Typography>;
};

export const Button = ({
  buttonText,
  onConfirm,
  disabled,
  ariaLabel,
}: {
  buttonText?: string;
  disabled?: boolean;
  onConfirm?(): void;
  ariaLabel?: string;
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.footer}>
      <HydraButton
        kind="primary"
        size="large"
        fullWidth
        disabled={disabled}
        onClick={onConfirm}
        aria-label={ariaLabel}
      >
        <Typography>{buttonText}</Typography>
      </HydraButton>
    </Box>
  );
};

export const SubContainer = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();

  return <Box className={classes.subContainer}>{children}</Box>;
};

export const MainContainer = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();

  return <Box className={classes.mainContainer}>{children}</Box>;
};

export const ModalContainer: FC<ModalContainerProps> = ({
  children,
  open,
  onClose,
  size,
}) => {
  const classes = useStyles();

  return (
    <Dialog
      className={cn(classes.dialog, { "dialog-large": size === "lg" })}
      open={open}
      onClose={onClose}
    >
      <Box className={classes.contentWrapper}>
        <IconButton
          className={classes.closeButton}
          aria-label="Close"
          onClick={onClose}
        >
          <Close />
        </IconButton>
        <DialogContent className={classes.dialogContent}>
          {children}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export const HydraModal: FC<ModalProps> = ({
  open,
  onClose,
  title,
  mainContent,
  subContent,
  buttonText,
  onConfirm,
  buttonDisabled,
  buttonAriaLabel,
}) => {
  return (
    <ModalContainer open={open} onClose={onClose}>
      {title && <Title text={title} />}
      <MainContainer>{mainContent}</MainContainer>
      {subContent && <SubContainer>{subContent}</SubContainer>}
      {buttonText && (
        <Button
          buttonText={buttonText}
          onConfirm={onConfirm}
          disabled={buttonDisabled}
          ariaLabel={buttonAriaLabel}
        />
      )}
    </ModalContainer>
  );
};
