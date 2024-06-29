# CPU Usage: 0.000000 seconds
# CPU Usage: 0.000000 seconds
def foo():
    print("foo")

class Bar:
    # CPU Usage: 1.156250 seconds
    # CPU Usage: 1.218750 seconds
    def baz():
        for i in range(100000000):
            pass
        print("baz")
    foo()
    baz()
