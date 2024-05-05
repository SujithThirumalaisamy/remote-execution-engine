#!/bin/bash

# Create workdir directory if it doesn't exist
if [ ! -d "workdir" ]; then
    mkdir -p workdir
fi

cp ./python/run_tests.py ./workdir/run_tests.py
cp ./python/update_submission.py ./workdir/update_submission.py

if [ -z "$API_URL" ] || [ -z "$SUBMISSION_ID" ]; then
    echo "Error: API_URL or SUBMISSION_ID not provided."
    exit 1
fi

# Make the curl request and store the response
response=$(curl -s "$API_URL/submission/$SUBMISSION_ID")

# Check if curl request was successful
if [ $? -ne 0 ]; then
    echo "Error: Curl request failed."
    exit 1
fi
# Parse the response
std_in=$(echo "$response" | jq -r '.stdIn')
main_func=$(echo "$response" | jq -r '.code')
test_cases=$(echo "$response" | jq -r '.executionTestCase')

formatted_test_cases=()
formatted_test_cases+="["
for row in $(echo "${test_cases}" | jq -c '.[]'); do
    input=$(echo "${row}" | jq -r '.inputs[0]')
    expected_output=$(echo "${row}" | jq -r '.expectedOutput')
    formatted_test_cases+="((${input},), ${expected_output})"","
done
formatted_test_cases+="]"

# Check if response is empty
if { [ -z "$std_in" ] || [ -z "$test_cases" ]; } && [ -z "$main_func" ]; then
    echo "Error: Response is empty or missing required fields."
    exit 1
fi

echo "$main_func" > workdir/main_func.py
echo "$formatted_test_cases" > workdir/test_cases.txt

cd workdir

if [ -n "$std_in" ]; then
    echo "$std_in" > std_in.txt
    python run_tests.py -f main_func.main_function -o std_out.txt -i std_in.txt
fi

python run_tests.py -f main_func.main_function -o std_out.txt -t test_cases.txt

python update_submission.py