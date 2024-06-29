import time
import os
import psutil
def capture_cpu_usage(func):
    def wrapper(*args, **kwargs):
        process = psutil.Process(os.getpid())
        start_cpu_times = process.cpu_times()
        result = func(*args, **kwargs)
        end_cpu_times = process.cpu_times()
        user_time = end_cpu_times.user - start_cpu_times.user
        system_time = end_cpu_times.system - start_cpu_times.system
        cpu_usage = user_time + system_time
        energy = cpu_usage * 1.6
        print(f"ENERGY_CONSUMPTION:{func.__name__}: {energy:.6f} J")
        return result
    return wrapper

@capture_cpu_usage
def foo():
    for i in range(100000000):
        pass
    print("foo")

class Bar:
    @capture_cpu_usage

    def baz():
        for i in range(100000000):
            pass
        print("baz")
    foo()
    baz()
