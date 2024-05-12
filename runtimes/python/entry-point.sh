#!/bin/bash

cd /python

git pull origin main

cp /python/testcases-ee/testcases/$PROBLEM_ID.json ./test_cases.json

response=$(curl -s "$CALLBACK_URL/submission/$SUBMISSION_ID")
main_func=$(echo "$response" | jq -r '.code')
main_func_name=$(echo "$response" | jq -r '.mainFuncName')

echo "$main_func" > ./main_func.py
export MAIN_FUNC=$main_func_name


touch std_out.json

python run_tests.py

exit 0