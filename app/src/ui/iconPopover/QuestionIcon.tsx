import { Question } from "../icons";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  smIcon: {
    width: "15px",
    height: "15px",
  },
});

const QuestionIcon = ({
  size,
  color,
}: {
  size?: "small" | "medium" | "large";
  color?: string;
}) => {
  const classes = useStyles();

  return (
    <>
      {size === "small" ? (
        <Question
          className={classes.smIcon}
          style={{ fill: color ?? "currentColor" }}
        />
      ) : (
        <Question style={{ fill: color ?? "currentColor" }} />
      )}
    </>
  );
};

export default QuestionIcon;
