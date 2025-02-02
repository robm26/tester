# tester

### scenario
The hardest part of a database developer's job may be deciding which set of data structures, access patterns, and database features should be used in order to meet performance and efficiency requirements. A testing framework can help measure how certain parts of a database solution will perform. Like a scientist, a developer can craft and run experiment routines, to quantify the impact of a particular design decison.


This testing framework will allow you to:
1. Create and run benchmark test routines, such as:
   * 1000 reads requests
   * 1000 write requests 
2. Gather latency statistics from each routine  
3. Perform analysis showing average and p99 latency 
4. Compare the results of tests side by side 

## components
There are three main components of this solution:
 * A set of job scripts you can run from an bash shell
 * An S3 bucket to store the performance stats from each job
 * A report with charts summarizing the experiment results

## pre-requisites
* An AWS account
* A bash environment such as laptop terminal, AWS Cloudshell session, or EC2 host
* Bash configured to access to DynamoDB and S3

## setup

1. Clone this repository to your laptop or an AWS Cloudshell terminal.
2. Navigate to the /setup folder and run 
## jobs


Each test routine writes test results into a **data.csv** file stored in the /public/experiments folder. 

# charts
A web app will allow you to browse the 

To install the charting app, 