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
        print(f"CPU_USAGE:{func.__name__}: {cpu_usage:.6f} seconds")
        return result
    return wrapper

# CPU Usage: 0.000000 seconds
@capture_cpu_usage

def foo():
    print("foo")

class Bar:
    # CPU Usage: 1.156250 seconds
    @capture_cpu_usage

    def baz():
        for i in range(100000000):
            pass
        print("baz")
    foo()
    baz()
