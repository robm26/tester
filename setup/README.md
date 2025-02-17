# Setup

[HOME](../README.md) - **Setup** - [Jobs](../jobs/README.md) - [Charts](../app/README.md)

To setup this project, you will need a few DynamoDB tables as targets for the demo benchmark.

## pre-requisites

* Node.JS v18 or higher
* A bash environment such as laptop terminal, AWS Cloudshell session, or EC2 host
* An AWS account
* AWS CLI, configured with IAM read/write access to DynamoDB and S3


### environment setup
1. Open the AWS console and set the region to us-east-1 (N. Virginia)
2. Open Cloudshell

Set the default region as follows:
3. Run ```aws configure``` 
4. Click enter twice. On the third prompt for region, enter ```us-east-1```
5. Click enter again on the final prompt. 

## tester setup

The two main components, Jobs and App, may be installed in separate locations. Running Jobs from an EC2 host, Cloudshell or Cloud9 session is recommended. You can also run jobs directly from your laptop, however the latency measurements would include a significant delay for the request to make it across the Internet to the AWS resource. 


1. Within Cloudshell, clone this repository:

 ```
 git clone https://github.com/robm26/tester.git
 ```

2. Locate and run the setup script which will create four DynamoDB tables.
```
   cd tester/setup
   chmod +x ./setup.sh
   ./setup.sh
```

   *Each table has a key schema of PK and SK, and is in On Demand capacity mode. The final two tables are Global Tables.*

   * mytable
   * everysize
   * MREC
   * MRSC

3. Create an S3 bucket with a unique name, for example:
```
aws s3api create-bucket --bucket tester-data-17837
```

4. Set this bucket name in the configuration file. From the root folder, update the file **config.json** with the name of your new bucket, and click Save.


5. Install the chart dashboard web app to your laptop. Open a terminal (command) prompt and clone the project repository again. 

 ```
 git clone https://github.com/robm26/tester.git
 ```

6.  Next, we will install the required dependency modules (these listed in the *package.json* file).
```
cd tester
npm install
```

7. Launch the web app. This will run a custom [Next.js](https://nextjs.org/) app from your laptop. 
```
cd app
npm run dev
```
8. Open a browser and navigate to http://localhost:3000

You should see a web app in your browser called **tester**


Congrats, **tester** is ready for action! 

Next, you will run [Jobs](../jobs/README.md)
