//! Swap Result storage

#[derive(Default, Builder, Debug, PartialEq)]
/// Encodes all results of swapping from a source token to a destination token
pub struct SwapResult {
    /// Amount of base token swapped expressed as delta_x
    pub delta_x: u64,
    /// Amount of quote token swapped expressed as delta_x
    pub delta_y: u64,
}

impl From<Vec<u64>> for SwapResult {
    fn from(vector: Vec<u64>) -> Self {
        SwapResult {
            delta_x: vector[0],
            delta_y: vector[1],
        }
    }
}

impl From<SwapResult> for Vec<u64> {
    fn from(swap_result: SwapResult) -> Vec<u64> {
        vec![swap_result.delta_x, swap_result.delta_y]
    }
}
