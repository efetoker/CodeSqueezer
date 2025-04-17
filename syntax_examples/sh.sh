#!/bin/bash
# Simple Shell Script Example for CodeSqueezer testing

# Define a function to greet
greet() {
  # Takes one argument: the name to greet
  local name="$1"
  echo "Hello, $name from Bash!" # Print greeting
}

# Main part of the script execution
USER_NAME="Shell User"
greet "$USER_NAME" # Call the function with the user name

exit 0
# End of script