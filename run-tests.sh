#!/bin/bash
bunx playwright test
REPORT="playwright-report/report.json"
if [ -f "$REPORT" ]; then
  cat "$REPORT"
else
  echo "ERROR: $REPORT not found — tests may have failed to run."
  exit 1
fi
