# jobs are run in reverse order than presented in the charts app job list

node exec Writes.js 200
node exec Reads.js 200
node exec WritesReads.js 200
node exec Everysize.js 400 


# example format

# node invoke WritesReads.js 200
# node exec WritesReads.js 200 


# node Conditional_writes_MRSC
# node Conditional_writes

# node MRSC_region
# node MRSC_MREC
# node Everysize 400 write
# node Everysize 400 read
# node WritesReads 200
# node Writes 200
# node Reads 200
