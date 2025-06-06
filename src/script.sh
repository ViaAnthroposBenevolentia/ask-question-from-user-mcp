#!/bin/bash

question=$1

# Use osascript to show a dialog and capture the user's input.
# The result is returned to stdout.
# By providing a default answer with newlines, we can create a multiline input field.
osascript <<EOD
tell application "System Events"
    activate
    set a to display dialog "$question" with title "Question" default answer "
"
    return text returned of a
end tell
EOD 