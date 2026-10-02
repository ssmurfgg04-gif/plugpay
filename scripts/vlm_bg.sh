#!/bin/bash
# Loop until all 8 VLM rounds complete, tolerating rate limits
cd /home/z/my-project
for i in $(seq 1 40); do
  node scripts/vlm_rounds.js >> /home/z/my-project/vlm_bg.log 2>&1
  COUNT=$(ls vlm_findings/*.md 2>/dev/null | wc -l)
  echo "--- pass $i done, $COUNT/8 rounds ---" >> /home/z/my-project/vlm_bg.log
  if [ "$COUNT" -ge 8 ]; then break; fi
  sleep 60
done
echo "VLM COMPLETE" >> /home/z/my-project/vlm_bg.log
