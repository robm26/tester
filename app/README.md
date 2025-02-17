# Charts App

[HOME](../README.md) - [Setup](../setup/README.md) -  [Jobs](../jobs/README.md) -  **Charts**

## Reviewing charts
There are two types of charts, corresponding to two types of demo experiments. 
The default latency test will perform many small 1KB reads or writes to DynamoDB. 

### Latency distribution of many identical requests

The default experiment measures the results of sending many small 1KB reads or writes to a DynamoDB table. The results are plotted on a chart showing each single operation's latency.

A second chart appears below the first, showing the latency distribution, in a histogram format.  You can use this to understand the average and range of latencies that DynamoDB provided.

### Latency as a function of Item Size

A second type of chart is available when you run the Everysize experiment.

For this, a set of 400 write requests is made to DynamoDB, with the first request being 1KB in size, the second request 2KB, all the way up to the final request at 400KB. Jobs may read each of these same items as well. By performing a test against item size, we can chart the trend of latency as a function of item size. The chart will also attempt to best-fit a straight line representing the linear regression of latency versus item size. 


## Summary
You have deployed a benchmark testing tool, run some performance tests, and analyzed the results with a chart dashboard. There are many ways to build new experiments to measure different designs or database features. 


## Roadmap
In a subsequent release of these instructions, you will be guided through the process to take a question (such as: are conditional writes slower than normal writes?) and build a job to answer the question.

