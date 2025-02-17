## tester 
**HOME** - [Setup](./setup/README.md) - [Jobs](./jobs/README.md) - [Charts](./app/README.md)

Take DynamoDB for a test drive with this benchmark test suite. Review results in a chart dashboard.

![spash-image](/public/tester_1.png)

## scenario
You have just been hired as a DynamoDB database developer, congratulations! Your first project will will be to measure the latency of the database with various configurations and access patterns.


## tester: 
This testing framework will allow you to:
1. Create and run benchmark test routines, such as:
   * 5000 reads requests
   * 5000 write requests 

2. Collect request latencies in a CSV file, and save to an S3 bucket folder
3. Perform analysis showing average latency, latency distributions
4. Run and view charts via custom  web app
5. See results of multiple tests side by side

## components
There are three main components of this solution:
 * **setup**: New table definitions and setup scripts
 * **jobs**: Multi-step job definitions that save request latency details to S3
 * **app**: A custom web app that renders charts of experiment results


Ready? Head over to the [Setup](./setup/README.md) page.
