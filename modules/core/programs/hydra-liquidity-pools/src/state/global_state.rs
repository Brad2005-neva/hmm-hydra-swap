use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};

#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub enum FeatureType {
    Swap,
    AddLiquidity,
    RemoveLiquidity,
    CreatePublicPools,
    All,
}

#[account]
#[derive(Default, Debug)]
pub struct GlobalState {
    pub admin: Pubkey,                      // 32
    pub prices_owner: Pubkey,               // 32
    pub pool_count: u32,                    // 4
    pub global_state_bump: u8,              // 1
    pub swap_disabled: bool,                // 1
    pub add_liquidity_disabled: bool,       // 1
    pub remove_liquidity_disabled: bool,    // 1
    pub create_public_pools_disabled: bool, // 1
}

impl GlobalState {
    pub const LEN: usize = 8 + 32 + 32 + 4 + 1 + 1 + 1 + 1 + 1;

    pub fn is_admin(&self, address: &Pubkey) -> bool {
        self.admin.eq(address)
    }

    pub fn is_enabled_swap(&self) -> bool {
        !self.swap_disabled
    }

    pub fn is_enabled_add_liquidity(&self) -> bool {
        !self.add_liquidity_disabled
    }

    pub fn is_enabled_remove_liquidity(&self) -> bool {
        !self.remove_liquidity_disabled
    }

    pub fn is_enabled_create_public_pools(&self) -> bool {
        !self.create_public_pools_disabled
    }
}
