import sys
import argparse
import io

parser = argparse.ArgumentParser()

class ExecutionEngine:
    @staticmethod
    def execute_function(func, *args):
        try:
            # Redirect stdout to a buffer
            stdout_buffer = io.StringIO()
            sys.stdout = stdout_buffer
            
            # Call the function with the provided arguments
            func(*args)
            
            # Get the output from the buffer
            output = stdout_buffer.getvalue()
            
            # Reset stdout
            sys.stdout = sys.__stdout__
            
            return output, None
        except Exception as e:
            return None, str(e)

    @staticmethod
    def run_test_cases(func, test_cases):
        results = []
        for i, (input_data, expected_output) in enumerate(test_cases, 1):
            output, error = func(*input_data), None
            if error:
                results.append((f"Test case {i}: Failed - {error}", False))
            elif output == expected_output:
                results.append((f"Test case {i}: Passed", True))
            else:
                results.append((f"Test case {i}: Failed - Expected: {expected_output}, Got: {output}", False))
        return results

parser.add_argument("-f", "--main_func", help="Input Function")
parser.add_argument("-t", "--test_cases", help="Test Cases")
parser.add_argument("-i", "--std_in", help="Std Input")
parser.add_argument("-o", "--std_out", help="Std Output")

args = parser.parse_args()

# Check if both std_in and test_cases are provided
if args.std_in and args.test_cases:
    print("Error: Cannot provide both std_in and test_cases.")
    sys.exit(1)

# Import the code from the provided Python file
try:
    sys.path.append('.')  # Add current directory to module search path
    module_name = args.main_func.split('.')[0]
    function_name = args.main_func.split('.')[1]
    module = __import__(module_name)
    input_function = getattr(module, function_name)
except Exception as e:
    print(f"Error importing function from file: {e}")
    sys.exit(1)

# Read test cases from the provided file or from std_in
if args.test_cases:
    try:
        with open(args.test_cases, 'r') as file:
            test_cases = eval(file.read())
    except Exception as e:
        print(f"Error reading test cases from file: {e}")
        sys.exit(1)
elif args.std_in:
    try:
        with open(args.std_in, 'r') as file:
            input_data = eval(file.read())
    except Exception as e:
        print(f"Error reading input data from file: {e}")
        sys.exit(1)
else:
    print("Error: Either std_in or test_cases must be provided.")
    sys.exit(1)
if args.std_in:
    output, _ = ExecutionEngine.execute_function(input_function, *input_data)
    try:
        with open(args.std_out, 'w') as file:
            file.write(str(output))
    except Exception as e:
        print(f"Error writing output to file: {e}")
        sys.exit(1)
else:
    results = ExecutionEngine.run_test_cases(input_function, test_cases)
    try:
        with open(args.std_out, 'w') as file:
            for result, _ in results:
                file.write(result + '\n')
    except Exception as e:
        print(f"Error writing results to file: {e}")
        sys.exit(1)