# ENERGY CONSUMPTION: 2.050000 J
def foo():
    for i in range(100000000):
        pass
    print("foo")

class Bar:
    # ENERGY CONSUMPTION: 2.500000 J

    def baz():
        for i in range(100000000):
            pass
        print("baz")
    foo()
    baz()
