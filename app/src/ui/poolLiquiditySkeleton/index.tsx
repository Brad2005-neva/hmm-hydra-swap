import { Skeleton } from "@mui/material";
import { palette, alpha } from "@utils/palette";

const PoolLiquiditySkeleton = () => (
  <>
    <Skeleton
      sx={{ bgcolor: `${palette.white}${alpha[25]}`, color: "black" }}
      height="20px"
      animation="pulse"
      width="80px"
    />
    <Skeleton
      sx={{ bgcolor: `${palette.white}${alpha[25]}` }}
      animation="wave"
      height="20px"
      width="150px"
    />
  </>
);

export default PoolLiquiditySkeleton;
