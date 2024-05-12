import os
import json
import requests
import main_func

def read_json(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

def run_test_cases():
    test_cases = read_json('./test_cases.json')
    result = []
    print(test_cases)
    try:
        for test_case in test_cases:
            function = getattr(main_func, os.environ.get("MAIN_FUNC"))
            output = function(*test_case['inputs'])
            if output == test_case['expectedOutput']:
                result.append(test_case['id'])
    except Exception as e:
        return {"status":"Error","stdOut":str(e)}
    
    return {"status":"Successful","testCasesPassed":result}

def update_submission(result):
    CALLBACK_URL = os.environ.get("CALLBACK_URL")
    SUBMISSION_ID = os.environ.get("SUBMISSION_ID")
    SUBMISSION_URL = CALLBACK_URL+"/submission/"+SUBMISSION_ID
    head = {"Content-Type":"application/json"}
    respose = requests.patch(SUBMISSION_URL, json=result, headers=head)
    return respose
    
result = run_test_cases()
response = update_submission(result=result)
print(response)