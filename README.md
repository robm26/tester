## Tester 
**HOME** - [Setup](./setup/README.md) - [Jobs](./jobs/README.md) - [Charts](./app/README.md)

Take Amazon DynamoDB for a test drive with this benchmarking solution. Run custom jobs from your application host, review latency summary statistics, and explore performance data via interactive charts.

Compare the results from two similar experiments to see the impact of design choices, such as whether to use DynamoDB 
[Global Tables](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html) with 
[Multi-Region Strong Consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/multi-region-strong-consistency-gt.html).


![spash-image](/public/tester_1.png)

## Scenario
You, as a database developer, have just taken a new role within a large engineering team. The team has been researching DynamoDB to learn more about its characteristics, and wants to know whether it would meet their application's strict performance requrements, for a possible database migration.

After orientation, your new manager opens their laptop and shows you what they have discovered in the AWS Console's DynamoDB section. A Monitoring tab shows a dashboard of charts that plot the read and write latencies some recent database testing the team had done. 

You both agree the Cloudwatch charts work well, but it seems they aren't able to show the full latency picture as experienced by the application. This would include the network hop delay, and delay for any retries required, in addition to the DynamoDB request latency.

### Questions
 * How can we see the full round-trip latency an application running on EC2 would observe when making DynamoDB requests across the network?

 * How can we see results with per-second or per-request granularity?

 * How could we see the normal distribution of all latencies to understand average and tail latency?

 * How could we see, in a single chart, the relative performance of various features, request types, request sizes, and regions? 

Example questions when considering DynamoDB Global Tables Multi-Region Strong Consistency:

 * What would be the average latency for an application to perform a 25 KB strongly consistent read?

 * What would be the write latency difference between us-east-1 and us-west-2 when using GT MRSC?
 
 * Are conditional writes slower than regular MRSC writes?


![spash-image_001](/public/tester_s01.png)

## Testing framework: 
This testing framework will allow you to:
1. Create and run benchmark test routines, such as:
   * 5000 reads requests
   * 5000 write requests 

2. Collect request latencies in a CSV file, and save to an S3 bucket folder
3. Perform analysis showing average latency, latency distributions
4. Run and view charts via custom  web app
5. See results of multiple tests side by side



Ready? Head over to the [Setup](./setup/README.md) page.
