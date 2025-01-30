import math


def get_delta_y_amm(x0, y0, delta_x):
    k = x0 * y0
    return k / (x0 + delta_x) - k / x0


def get_delta_x_amm(x0, y0, delta_y):
    k = x0 * y0
    return k / (y0 + delta_y) - k / y0


def integral(k, q0, q_new, qi, c):
    if c == 1:
        return k / (qi ** c) * math.log(q0 / q_new)
    else:
        return k / (qi ** c) / (c - 1) * (q0 ** (c - 1) - q_new ** (c - 1))


def get_delta_y(x0, y0, i, c, delta_x):
    k = x0 * y0
    xi = (k / i) ** 0.5
    x_new = x0 + delta_x

    if (delta_x > 0 and x0 >= xi) or (delta_x < 0 and x0 <= xi):
        print("condition 1 amm")
        return get_delta_y_amm(x0, y0, delta_x)
    elif (delta_x > 0 and x_new <= xi) or (delta_x < 0 and x_new >= xi):
        print("condition 2 hmm")
        return integral(k, x0, x_new, xi, c)
    else:
        print("condition 3 hmm")
        return integral(k, x0, xi, xi, c) + k / x_new - k / xi


def get_delta_x(x0, y0, i_, c, delta_y):  # here i_ is actually 1/i
    k = x0 * y0
    yi = (k / i_) ** 0.5
    y_new = y0 + delta_y

    if (delta_y > 0 and y0 >= yi) or (delta_y < 0 and y0 <= yi):
        print("condition 1 amm")
        return get_delta_x_amm(x0, y0, delta_y)
    elif (delta_y > 0 and y_new <= yi) or (delta_y < 0 and y_new >= yi):
        print("condition 2 hmm")
        return integral(k, y0, y_new, yi, c)
    else:
        print("condition 3 hmm")
        return integral(k, y0, yi, yi, c) + k / y_new - k / yi

# original founder code
x0 = 1000
y0 = 1000
i = 0.5
c = 0.5
delta_x = 10
# delta_y = get_delta_y(x0, y0, i, c, delta_x)
# print("delta_y = ", delta_y, get_delta_y_amm(x0, y0, delta_x))
# # print("delta_x = ", get_delta_x(x0, y0, 1/i, c, delta_y), get_delta_x_amm(x0, y0, delta_y))
# print("delta_x = ", get_delta_x(x0, y0, 1/i, c, 8.346417))

# yx
# condition 1
x0 = 565288100.127926
y0 = 853100202.827361589
c = 1.00
i = 0.42000000
print("delta_x = ", get_delta_x(x0, y0, 1/i, c, 541.172676189))

# condition 2
x0 = 565288100.127926
y0 = 853100.827361589
c = 1.00
i = 0.42000000
print("delta_x = ", get_delta_x(x0, y0, 1/i, c, 541.172676189))

# condition 3
x0 = 565288100.127926
y0 = 8531.827361589
c = 1.00
i = 0.42000000
print("delta_x = ", get_delta_x(x0, y0, 1/i, c, 5555541.172676189))

# xy
# condition 1
x0 = 77794362749.127900
x0 = 77794362749.127900
y0 = 68170250.944002900
c = 1.00
i = 0.42000000
print("delta_y = ", get_delta_y(x0, y0, i, c, 5541.020795))

# condition 2
x0 = 777.127900
y0 = 68170250.944002900
c = 1.00
i = 0.42000000
print("delta_y = ", get_delta_y(x0, y0, i, c, 5541.020795))

# condition 3
x0 = 777.127900
y0 = 68170250.944002900
c = 1.00
i = 0.42000000
print("delta_y = ", get_delta_y(x0, y0, i, c, 555541.020795))

# e2e condition 2
x0 = 184.258350462
y0 = 2820.285082
c = 1.00
i = 10.670548
print("delta_y = ", get_delta_y(x0, y0, i, c, 20.758400000))
