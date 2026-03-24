import sys
import os
sys.path.append(os.getcwd())
try:
    import auth
    print("Import successful")
except Exception as e:
    import traceback
    traceback.print_exc()
