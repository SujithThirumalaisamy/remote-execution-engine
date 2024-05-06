#!/bin/bash

# Create workdir directory if it doesn't exist
if [ ! -d "workdir" ]; then
    mkdir -p workdir
fi

cp ./run_tests.py ./workdir/run_tests.py
cp ./update_submission.py ./workdir/update_submission.py

if [ -z "$CALLBACK_URL" ] || [ -z "$SUBMISSION_ID" ]; then
    echo "Error: CALLBACK_URL or SUBMISSION_ID not provided."
    exit 1
fi

# Make the curl request and store the response
response=$(curl -s "$CALLBACK_URL/submission/$SUBMISSION_ID")
echo $response
# Check if curl request was successful
if [ $? -ne 0 ]; then
    echo "Error: Curl request failed."
    exit 1
fi

main_func=$(echo "$response" | jq -r '.code')
echo "$main_func" > workdir/main_func.py

# Parse the response
std_in=$(echo "$response" | jq -r '.stdin')

if [ "$std_in" != "null" ]; then
    formatted_std_in=""
    for row in $(echo "${std_in}"); do
        formatted_std_in+=$(echo "${row}")
    done
    cd workdir
    echo "$formatted_std_in" > std_in.txt
    python run_tests.py -f main_func.main_function -o std_out.txt -i std_in.txt
    python update_submission.py
    exit
else
    test_cases=$(echo "$response" | jq -r '.testCases')
    formatted_test_cases=()
    formatted_test_cases+="["
    for row in $(echo "${test_cases}" | jq -c '.[]'); do
        input=$(echo "${row}" | jq -r '.inputs[0]')
        expected_output=$(echo "${row}" | jq -r '.expectedOutput')
        formatted_test_cases+="((${input},), ${expected_output})"","
    done
    formatted_test_cases+="]"
    cd workdir
    echo "$formatted_test_cases" > test_cases.txt
    python run_tests.py -f main_func.main_function -o std_out.txt -t test_cases.txt
    python update_submission.py
    exit
fi
