#!/bin/bash
echo "Restarting Chronos app..."
cd /workspace/development/bench
bench restart
echo "Clearing cache..."
bench --site axe.localhost clear-cache
echo "Done! Chronos app has been restarted." 