#!/bin/bash

# Create workdir directory if it doesn't exist
if [ ! -d "workdir" ]; then
    mkdir -p workdir
fi

cp /cpp/main_function_executor ./workdir/main_function_executor
cp /cpp/update_submission ./workdir/update_submission

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
echo "$main_func" > workdir/main_function.cpp

std_in=$(echo "$response" | jq -r '.stdin')

if [ "$std_in" != "null" ]; then
    formatted_std_in=""
    for row in $(echo "${std_in}"); do
        formatted_std_in+=$(echo "${row}")
    done
    echo "$formatted_std_in" > workdir/std_in.txt
    ./workdir/main_function_executor workdir/main_function.cpp workdir/std_in.txt > workdir/std_out.txt
    ./workdir/update_submission
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
    echo "$formatted_test_cases" > workdir/test_cases.txt
    ./workdir/main_function_executor workdir/main_function.cpp workdir/test_cases.txt > workdir/std_out.txt
    ./workdir/update_submission
    exit
fi
