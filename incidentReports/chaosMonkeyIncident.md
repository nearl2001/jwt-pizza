# Incident: 2024-12-03 16-58-00

## Summary

Around 12 PM, the Chaos Monkey caused the Pizza Factory to begin throwing 500 errors when pizza orders came in, cauing the order functionality to fail on our website. This error 
was detected using Grafana logs of pizza Order failures, and the failure caused around 4 hours of downtime. I was able to resolve the problem at around 4PM once I became available.
This problem was resolved by calling a Get request to the URL given by the error body from the Pizza Factory.

## Detection

This incident was detected when the Order Failures peak alert was triggered and the Jwt-Pizza team in OnCall (Nik Earl & team) were paged.
Nik was unable to respond to the call, so it rang 1 more time. Ultimately, he was able to respond about 4 hours after the initial call came through OnCall, 
and he was able to get on the computer and resolve the problem. 

For future reference, we have learned that it is crucial to be actually on-call when you agree to be 'on-call'. The alert came in right when Nik needed to go to
a choir dress rehearsal and concert before he would be able to resolve the error, and this problem led users to have roughly 4 hours of downtime. If Nik was actually
on-call when the alert occurred, this Incident would've been resolved in roughly 15 minutes (about the time it took to discover and use the callback after noticing the
alert)

## Impact

For roughly 4 hours between 11:45 MDT and 16:08 MDT on 12/03/2024, users weren't able to retrieve their order or successfully make an order with the Pizza Factory. This 
incident affected 1 fake DDos customer (my raspberryPi spamming simulated user interaction roughly 100 HTTP calls per minute) and 1 test user (Nik on his phone). 100% of
clients appear to have experienced this outage since the whole Pizza Factory was down and no pizza sales were present at the time. All users experienced the same 500 Server
error http response from attempting to call the Pizza-service /order route with a Post method.

2 OnCall alert groups were notified of this incident by an automated system checking for high Order Failure scenarios.

## Timeline

All times are MST.
- _11:45_ - Pizza Factory goes offline due to Chaos Monkey stopping 200 traffic
- _11:50_ - First OnCall Alert Issued
- _11:55_ - Second OnCall Alert Issued
- _12:16_ - Nik opens alert with phone
- _12:18_ - Nik verifies site is down
- _15:52_ - Nik begins troubleshooting
- _15:58_ - Nik finds callback URL with logs in Grafana and chrome dev tools
- _16:05_ - Nik calls the callback URL, resolving the error with the Chaos Monkey
- _16:08_ - Nik reboots simulated traffic and pushes update to pizza-service
- _16:15_ - Simulated traffic resumes, confirming resolution on the error


## Response

After receiving an alert from Grafana OnCall about a spike in Order Failures, Nik responded by noting a consistent error in both Grafana dashboard logs and via the Grafana Promethius data.
Nik did not have full availability or his Laptop on hand to troubleshoot the error due to schedling conflicts with his on-call calendar, so he responded roughly 4 hours after the first alert.

# Root cause

Chaos Monkey. Nuff Said.
In all seriousness, the Pizza Factory was returning 500 server error HTTP responses, causing the Pizza Service to likewise return 500 responses when users try to order pizza.

## Resolution

Using Grafana Promethius data and logs on the Dashboard for the Pizza Service, Nik found that the error body coming back from calls to the Pizza Factory contained a callback
address that contained a 'fixme' string in it, leading him to call the address with a Get request. This request reset the Pizza Factory to get rid of the Chaos 
Monkey, which worked to get the Pizza Factory running again. 

# Prevention

No similar Root Causes known. The Chaos Monkey has made his first appearance.

# Action items

Describe the corrective action ordered to prevent this class of incident in the future. Note who is responsible and when they have to complete the work and where that work is being tracked.

1. OnCall alert updated to fire on less failures than the simulated traffic would automatically hit with 404 calls
2. Pizza Shop was verified to be fully functional after outage
3. Monkeys of Chaos were appeased by this outage, reducing likelihood of future events.
