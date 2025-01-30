from decimal import *

getcontext().prec = 64
getcontext().rounding = ROUND_FLOOR


class Curve:
    """
  Python model of HMM token swap math.
  """

    def __init__(self, x0, y0, c, i, scale):
        """
    x0: current token x balance in pool
    y0: current token y balance in pool
    c: compensation coefficient
    i: oracle price
    scale: decimal places
    """
        self.x0 = Decimal(x0)
        self.y0 = Decimal(y0)
        self.c = Decimal(c)
        self.i = Decimal(i)
        self.scale = scale

    def to_int_signed(self, decimal, rounding=ROUND_FLOOR):
        is_signed = decimal.is_signed()
        return (int((decimal.copy_abs() * Decimal(10 ** self.scale)).to_integral_value(rounding)), decimal.is_signed())

    def to_int(self, decimal, rounding=ROUND_FLOOR):
        return int((decimal.copy_abs() * Decimal(10 ** self.scale)).to_integral_value(rounding))

    def k(self):
        k = self.x0 * self.y0
        return k

    def xi(self):
        k = self.k()
        return (k / self.i).sqrt()

    def yi(self):
        """
    Yᵢ = √(K/(1/i))
    """
        k = self.k()
        return (k / (1 / self.i)).sqrt()

    def integ(self, k, q0, q_new, qi, c):
        if c == 1:
            return k / (qi ** c) * (q0 / q_new).ln()
        else:
            return k / (qi ** c) / (c - 1) * (q0 ** (c - 1) - q_new ** (c - 1))

    def delta_y_amm(self, delta_x):
        k = self.k()
        return k / (self.x0 + delta_x) - k / self.x0

    def delta_x_amm(self, delta_y):
        k = self.k()
        return k / (self.y0 + delta_y) - k / self.y0

    def delta_y_hmm(self, delta_x):
        k = self.k()
        xi = self.xi()
        x_new = self.x0 + delta_x

        if (delta_x > 0 and self.x0 >= xi) or (delta_x < 0 and self.x0 <= xi):
            return self.delta_y_amm(delta_x)
        elif (delta_x > 0 and x_new <= xi) or (delta_x < 0 and x_new >= xi):
            return self.integ(k, self.x0, x_new, xi, self.c)
        else:
            lhs = self.integ(k, self.x0, xi, xi, self.c)
            rhs = k / x_new - k / xi
            return lhs + rhs

    def delta_x_hmm(self, delta_y):
        k = self.k()
        yi = self.yi()
        y_new = self.y0 + delta_y

        if (delta_y > 0 and self.y0 >= yi) or (delta_y < 0 and self.y0 <= yi):
            return self.delta_x_amm(delta_y)
        elif (delta_y > 0 and y_new <= yi) or (delta_y < 0 and y_new >= yi):
            return self.integ(k, self.y0, y_new, yi, self.c)
        else:
            lhs = self.integ(k, self.y0, yi, yi, self.c)
            rhs = k / y_new - k / yi
            return lhs + rhs

    def add_liquidity(self, x_amount, y_amount, x_reserve, y_reserve, liquidity_total):
        if liquidity_total == 0:
            liquidity = (x_amount * y_amount).sqrt - 100
            x_reserve += x_amount
            y_reserve += y_amount
            liquidity_total += liquidity
            return liquidity
        else:
            liquidity = min(x_amount * liquidity_total / x_reserve, y_amount * liquidity_total / y_reserve)
            x_amount = min(x_amount, liquidity/liquidity_total * x_reserve)
            y_amount = min(y_amount, liquidity/liquidity_total * y_reserve)
            liquidity_total += liquidity
            return liquidity

    def sim_delta_x_amm(self, delta_y):
        return self.to_int_signed(self.delta_x_amm(Decimal(delta_y)))

    def sim_delta_x_hmm(self, delta_y):
        return self.to_int_signed(self.delta_x_hmm(Decimal(delta_y)))

    def sim_delta_y_amm(self, delta_x):
        return self.to_int_signed(self.delta_y_amm(Decimal(delta_x)))

    def sim_delta_y_hmm(self, delta_x):
        return self.to_int_signed(self.delta_y_hmm(Decimal(delta_x)))

    def sim_add_liquidity(self, x_amount, y_amount, x_reserve, y_reserve, liquidity_total):
        return self.to_int_signed(self.add_liquidity(Decimal(x_amount), Decimal(y_amount), Decimal(x_reserve), Decimal(y_reserve), Decimal(liquidity_total)))
