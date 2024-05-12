#!/bin/bash

cd /javascript

git pull origin main

cp /javascript/testcases-ee/testcases/$PROBLEM_ID.json ./test_cases.json

response=$(curl -s "$CALLBACK_URL/submission/$SUBMISSION_ID")
main_func=$(echo "$response" | jq -r '.code')

echo "$main_func" > ./main_func.js

# Not needed for js as it uses default export
# main_func_name=$(echo "$response" | jq -r '.mainFuncName')
# export MAIN_FUNC=$main_func_name

touch std_out.json

node run_tests.js

exit 0