import time
import os
import psutil
def capture_cpu_usage(func):
    def wrapper(*args, **kwargs):
        process = psutil.Process(os.getpid())
        start_cpu_times = process.cpu_times()
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        end_cpu_times = process.cpu_times()
        user_time = end_cpu_times.user - start_cpu_times.user
        system_time = end_cpu_times.system - start_cpu_times.system
        cpu_usage = user_time + system_time
        print(f"CPU_USAGE:{func.__name__}: {cpu_usage:.6f} seconds")
        return result
    return wrapper

@capture_cpu_usage
def foo():
    return "foo"

class Bar:
    @capture_cpu_usage

    def baz(self):
        return "baz"
