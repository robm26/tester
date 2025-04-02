# Setup

[HOME](../README.md) - **Setup** - [Jobs](../jobs/README.md) - [Charts](../app/README.md)


## solution components
There are three main components of this solution:
 * **setup**: New table definitions and setup scripts
 * **jobs**: Multi-step job definitions that save request latency details to S3
 * **app**: A custom Next.JS web app that renders charts of experiment results

![spash-image_002](/public/tester_s02.png)

It's recommended to deploy and run the job system within AWS, such as on a Cloudshell terminal session or EC2 host. When jobs are run in AWS in the same region as the DynamoDB table, the lowest latencies will be seen.

It's also recommended to deploy the App onto your laptop, so that you will have easy and personal access to browse job results in the chart dashboard. 

# Setup

## Jobs

### pre-requisites

* Node.JS v18 or higher
* A bash environment such as laptop terminal, AWS Cloudshell session, or EC2 host
* AWS CLI, configured with IAM read/write access to DynamoDB and S3


### environment setup
1. Open the AWS console and set the region to us-east-1 (N. Virginia), or your desired region.
2. Open Cloudshell
3. Within Cloudshell, clone this repository:

 ```
 git clone https://github.com/robm26/tester.git
 ```

4. Locate and run the setup script which will create four DynamoDB tables.
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

5. Create an S3 bucket with a unique name, for example:
```
aws s3api create-bucket --bucket tester-data-17837
```

6. Set this bucket name in the configuration file. From the root folder, open and update the file **config.json** with the name of your new bucket, and click Save.

The server-side component of tester is now set. Let's switch gears and deploy the client App component on your laptop. This webapp, running on localhost:3000, will serve the charts dashboard showing the latency of your tests.

## App
### pre-requisites

* Node.JS v18 or higher
* AWS CLI, configured with IAM read access to S3


1. From your laptop, open a terminal (command) prompt, and clone the project repository again. 

 ```
 git clone https://github.com/robm26/tester.git
 ```
   
2.  Next, we will install the required dependency modules (these listed in the *package.json* file).
```
cd tester
npm install
```

3. Set the S3 bucket name again, this time in the client's configuration file. Open and update the file **config.json** with the name of your new bucket, and click Save.
   
4. Launch the web app. This will run a custom [Next.js](https://nextjs.org/) app from your laptop. 
```
cd app
npm run dev
```

5. Open a browser and navigate to http://localhost:3000

You should see a web app in your browser called **tester**


Congrats, **tester** is ready for action! 

Next, you will run [Jobs](../jobs/README.md)
