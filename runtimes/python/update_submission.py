import os
import requests

def submit_patch_request(api_url, testcases_file, stdout_file):
    # Read the content of testcases.txt
    with open(testcases_file, 'r') as f:
        testcases_content = f.read()

    # Read the content of stdout.txt
    with open(stdout_file, 'r') as f:
        stdout_content = f.read()
        
    # Prepare the request body
    print(stdout_content)
    payload = {
        'testCasesPassed': testcases_content,
        'stdOut': stdout_content
    }

    # Submit PATCH request
    response = requests.patch(api_url, json=payload)

    # Check response status
    if response.status_code == 200:
        print("PATCH request successful.")
    else:
        print("Failed to submit PATCH request. Status code:", response.status_code)
        print("Response:", response.text)

if __name__ == "__main__":
    # Get API URL from environment variable
    api_url = os.getenv("API_URL")+"/submission/"+os.getenv("SUBMISSION_ID")

    if not api_url:
        print("API_URL environment variable is not set.")
        exit(1)

    # Paths to testcases.txt and stdout.txt in the current directory
    testcases_file = "test_cases.txt"
    stdout_file = "std_out.txt"

    # Submit PATCH request
    submit_patch_request(api_url, testcases_file, stdout_file)
