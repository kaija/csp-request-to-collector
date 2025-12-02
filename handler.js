/**
 * Lambda Handler for CSP Report-to API
 * Receives CSP violation reports and logs them to CloudWatch
 */

/**
 * Structured logging function for CloudWatch
 * Outputs JSON formatted logs with all required metadata fields
 * 
 * Note: JSON.stringify() correctly handles Unicode characters including:
 * - Emoji (😀, 🎉, etc.)
 * - Multi-byte Unicode characters (中文, 日本語, etc.)
 * - Control characters (\n, \t, etc.)
 * - Special symbols (©, ®, ™, etc.)
 * 
 * All special characters are preserved in the JSON output and will be
 * correctly stored in CloudWatch Logs.
 * 
 * @param {Object} logData - Log data object
 * @param {string} logData.timestamp - ISO 8601 timestamp
 * @param {string} logData.requestId - Request ID from API Gateway
 * @param {string} logData.sourceIp - Source IP address
 * @param {string} logData.userAgent - User-Agent header
 * @param {string} logData.contentType - Content-Type header
 * @param {Object} [logData.report] - CSP report object (optional)
 * @param {string} [logData.level] - Log level (optional)
 * @param {string} [logData.message] - Log message (optional)
 * @param {Object} [logData.error] - Error details (optional)
 * @param {string} [logData.rawBody] - Raw request body (optional)
 */
function logToCloudWatch(logData) {
  // JSON.stringify() preserves Unicode characters correctly
  // No special encoding or escaping is needed for special characters
  const logEntry = JSON.stringify(logData);
  console.log(logEntry);
}

/**
 * Creates a structured log entry with all required metadata fields
 * @param {Object} metadata - Metadata extracted from the event
 * @param {string} metadata.timestamp - ISO 8601 timestamp
 * @param {string} metadata.requestId - Request ID
 * @param {string} metadata.sourceIp - Source IP address
 * @param {string} metadata.userAgent - User-Agent header
 * @param {string} metadata.contentType - Content-Type header
 * @param {Object} additionalData - Additional data to include in the log
 * @returns {Object} Structured log entry
 */
function createLogEntry(metadata, additionalData = {}) {
  return {
    timestamp: metadata.timestamp,
    requestId: metadata.requestId,
    sourceIp: metadata.sourceIp,
    userAgent: metadata.userAgent,
    contentType: metadata.contentType,
    ...additionalData
  };
}

/**
 * Main handler function for processing CSP reports
 * @param {Object} event - API Gateway HTTP API event
 * @returns {Object} HTTP response object
 */
exports.reportHandler = async (event) => {
  try {
    // Extract metadata from event.requestContext
    const requestId = event.requestContext?.requestId || 'unknown';
    const sourceIp = event.requestContext?.http?.sourceIp || 'unknown';
    
    // Extract headers
    const userAgent = event.headers?.['user-agent'] || event.headers?.['User-Agent'] || 'unknown';
    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || 'unknown';
    
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Create metadata object for logging
    const metadata = {
      timestamp,
      requestId,
      sourceIp,
      userAgent,
      contentType
    };
    
    // Parse request body
    const body = event.body || '';
    
    // Handle empty body
    if (!body || body.trim() === '') {
      const warningLog = createLogEntry(metadata, {
        level: 'WARNING',
        message: 'Received empty request body'
      });
      logToCloudWatch(warningLog);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Report received (empty body)' })
      };
    }
    
    // Parse JSON body
    // JSON.parse() correctly handles all Unicode characters including emoji,
    // multi-byte characters, and control characters
    let report;
    try {
      report = JSON.parse(body);
    } catch (parseError) {
      // Handle invalid JSON
      // Even for invalid JSON, we preserve the raw body with all special characters
      const errorLog = createLogEntry(metadata, {
        level: 'ERROR',
        message: 'Failed to parse JSON',
        error: parseError.message,
        rawBody: body
      });
      logToCloudWatch(errorLog);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Report received (invalid JSON)' })
      };
    }
    
    // Log structured CSP report to CloudWatch
    const logEntry = createLogEntry(metadata, { report });
    logToCloudWatch(logEntry);
    
    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Report received successfully' })
    };
    
  } catch (error) {
    // Handle internal errors
    const metadata = {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId || 'unknown',
      sourceIp: event.requestContext?.http?.sourceIp || 'unknown',
      userAgent: event.headers?.['user-agent'] || event.headers?.['User-Agent'] || 'unknown',
      contentType: event.headers?.['content-type'] || event.headers?.['Content-Type'] || 'unknown'
    };
    
    const errorLog = createLogEntry(metadata, {
      level: 'ERROR',
      message: 'Internal error processing request',
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    logToCloudWatch(errorLog);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
