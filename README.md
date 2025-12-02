# CSP Report API

A serverless API endpoint for receiving and logging Content Security Policy (CSP) violation reports to AWS CloudWatch Logs.

## Project Summary

This project implements a lightweight CSP reporting endpoint using AWS Lambda and API Gateway. When browsers detect CSP violations, they send reports to this endpoint, which logs them to CloudWatch for monitoring and analysis. The handler preserves all special characters including emoji, Unicode, and control characters in the logs.

**Key Features:**
- Serverless architecture (AWS Lambda + API Gateway HTTP API)
- Structured JSON logging to CloudWatch
- Handles empty bodies and invalid JSON gracefully
- CORS enabled for cross-origin requests
- Minimal memory footprint (128MB)

## Deployment Guide

### Prerequisites

- Node.js 24.x or later
- AWS CLI configured with appropriate credentials
- Serverless Framework v3

### Install Dependencies

```bash
npm install
```

### Deploy to Development

```bash
npm run deploy:dev
```

### Deploy to Production

```bash
npm run deploy:production
```

After deployment, the Serverless Framework will output your API endpoint URL:

```
endpoint: POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/report-to
```

## Usage

### POST Request Example

Send CSP violation reports to the `/report-to` endpoint:

```bash
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/report-to \
  -H "Content-Type: application/csp-report" \
  -d '{
    "age": 0,
    "body": {
      "blockedURL": "https://evil.example.com/malicious.js",
      "disposition": "enforce",
      "documentURL": "https://example.com/page",
      "effectiveDirective": "script-src",
      "originalPolicy": "default-src '\''self'\''; script-src '\''self'\''",
      "statusCode": 200,
      "violatedDirective": "script-src"
    },
    "type": "csp-violation",
    "url": "https://example.com/page",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }'
```

### Response

```json
{
  "message": "Report received successfully"
}
```

## CloudWatch Logs Insights

### Query Syntax

Access CloudWatch Logs Insights in the AWS Console and use these queries to analyze CSP violations:

#### View All CSP Reports

```
fields @timestamp, report.body.blockedURL, report.body.violatedDirective, sourceIp
| filter ispresent(report)
| sort @timestamp desc
| limit 100
```

#### Count Violations by Blocked URL

```
fields report.body.blockedURL as blockedURL
| filter ispresent(report)
| stats count() by blockedURL
| sort count() desc
```

#### Find Violations by Directive

```
fields @timestamp, report.body.blockedURL, report.body.documentURL, sourceIp
| filter report.body.violatedDirective = "script-src"
| sort @timestamp desc
```

#### Group by Source IP

```
fields sourceIp, report.body.blockedURL
| filter ispresent(report)
| stats count() by sourceIp
| sort count() desc
```

#### View Error Logs Only

```
fields @timestamp, level, message, error
| filter level = "ERROR"
| sort @timestamp desc
```

#### Search for Specific Domain

```
fields @timestamp, report.body.blockedURL, report.body.documentURL
| filter report.body.blockedURL like /evil.example.com/
| sort @timestamp desc
```

## Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## License

MIT
