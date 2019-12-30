# CAS Scrapper

This is a simple script I made which will check the Consolidated Admin Services website and return the value.

I have it parse as a number in case in the future I wish to monitor based off value. However currently it is just setup to notify me when called.

This script requires three environment variables to run: 
- CAS_USERNAME: The username for Consolidated Admin Services
- CAS_PASSWORD: The password for Consolidated Admin Service
- SLACK_HOOK: The http webhook for Slack to notify yourself (Or another user). 