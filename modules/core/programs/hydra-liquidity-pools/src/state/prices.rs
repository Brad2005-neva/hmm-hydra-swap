use anchor_lang::prelude::*;
use pyth_sdk_solana::{load_price_feed_from_account_info, PriceFeed, PriceStatus};

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug)]
pub struct Prices {
    pub price_account_x: Pubkey, // 32
    pub price_account_y: Pubkey, // 32
}

impl Prices {
    pub fn set_price_accounts(&mut self, remaining_accounts: &[AccountInfo]) -> Result<()> {
        if remaining_accounts.len() == 2 {
            self.price_account_x = remaining_accounts[0].key();
            self.price_account_y = remaining_accounts[1].key();

            Ok(())
        } else {
            Ok(())
        }
    }

    pub fn get_price_feeds(
        &self,
        remaining_accounts: &[AccountInfo],
    ) -> Option<(PriceFeed, PriceFeed)> {
        let price_account_x = &remaining_accounts[0];
        let price_account_y = &remaining_accounts[1];

        let price_feed_x = load_price_feed_from_account_info(price_account_x).ok()?;
        let price_feed_y = load_price_feed_from_account_info(price_account_y).ok()?;

        if price_feed_x.status == PriceStatus::Trading
            && price_feed_y.status == PriceStatus::Trading
        {
            Some((price_feed_x, price_feed_y))
        } else {
            None
        }
    }

    /// Get the current price of x in a different quote y as oracle price i.
    /// e.g. price of x is BTC/USD and y is ETH/USD then this will return price i of BTC/ETH
    /// Returns `None` if price information is currently unavailable for any reason.
    pub fn get_price_in_quote(
        &self,
        price_feed_x: &PriceFeed,
        price_feed_y: &PriceFeed,
    ) -> Option<(u64, u8)> {
        if let Some(price_x) = price_feed_x.get_current_price() {
            if let Some(price_y) = price_feed_y.get_current_price() {
                price_x
                    .get_price_in_quote(&price_y, -8)
                    .map(|i_price| (i_price.price as u64, i_price.expo.abs() as u8))
            } else {
                None
            }
        } else {
            None
        }
    }

    pub fn get_oracle_price(&mut self, remaining_accounts: &[AccountInfo]) -> Option<(u64, u8)> {
        if remaining_accounts.len() == 2 {
            if let Some((price_feed_x, price_feed_y)) = self.get_price_feeds(remaining_accounts) {
                self.get_price_in_quote(&price_feed_x, &price_feed_y)
            } else {
                None
            }
        } else {
            None
        }
    }
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
#[allow(clippy::inconsistent_digit_grouping)]
mod tests {
    use super::*;
    use pyth_sdk_solana::state::{AccountType, PriceAccount, PriceStatus, MAGIC, VERSION_2};

    fn price_account_all_zero() -> PriceAccount {
        PriceAccount {
            magic: MAGIC,
            ver: VERSION_2,
            atype: AccountType::Price as u32,
            ..Default::default()
        }
    }

    #[test]
    fn test_get_price_in_quote() {
        let prices = Prices::default();
        let mut price_x = price_account_all_zero();
        let price_account_x = Pubkey::new_unique();
        price_x.agg.status = PriceStatus::Trading;
        price_x.expo = -8;

        let mut price_y = price_account_all_zero();
        let price_account_y = Pubkey::new_unique();
        price_y.agg.status = PriceStatus::Trading;
        price_y.expo = -8;

        // when valid prices
        {
            price_x.agg.price = 2284180066227; // BTC.USD $22841.80066227 +- 7.25840839
            price_x.agg.conf = 725840839;

            price_y.agg.price = 3850500000; // SOL.USD $38.505 +- 0.00965000
            price_y.agg.conf = 965000;

            let price_feed_x = price_x.to_price_feed(&price_account_x);
            let price_feed_y = price_y.to_price_feed(&price_account_y);
            let actual = prices
                .get_price_in_quote(&price_feed_x, &price_feed_y)
                .unwrap();

            // 22841.80066227 / 38.505 = 593.21648259
            let expected = (59321648090u64, 8u8);
            assert_eq!(actual, expected);
        }

        // when one price is zero, expect None
        {
            price_x.agg.price = 2284180066227; // BTC.USD $22841.80066227 +- 7.25840839
            price_x.agg.conf = 725840839;

            price_y.agg.price = 0; // SOL.USD $38.505 +- 0.00965000
            price_y.agg.conf = 965000;

            let price_feed_x = price_x.to_price_feed(&price_account_x);
            let price_feed_y = price_y.to_price_feed(&price_account_y);
            let actual = prices.get_price_in_quote(&price_feed_x, &price_feed_y);

            let expected = None;
            assert_eq!(actual, expected);
        }

        // when valid prices but price feed status is not Trading
        {
            price_x.agg.status = PriceStatus::Halted;
            price_x.agg.price = 2284180066227; // BTC.USD $22841.80066227 +- 7.25840839
            price_x.agg.conf = 725840839;

            price_y.agg.price = 3850500000; // SOL.USD $38.505 +- 0.00965000
            price_y.agg.conf = 965000;

            let price_feed_x = price_x.to_price_feed(&price_account_x);
            let price_feed_y = price_y.to_price_feed(&price_account_y);
            let actual = prices.get_price_in_quote(&price_feed_x, &price_feed_y);

            let expected = None;
            assert_eq!(actual, expected);
        }
    }
}
