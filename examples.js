
const Log = require('./index');


async function exampleBackendError() {
  try {
    
    const user = { isActive: "true" }; 
    if (user.isActive !== true) {
      throw new Error("Type mismatch");
    }
  } catch (error) {
    
    try {
      const response = await Log('backend', 'error', 'handler', 'received string, expected bool');
      console.log('Log created:', response);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}


async function exampleDatabaseFailure() {
  try {
    const response = await Log('backend', 'fatal', 'db', 'Critical database connection failure.');
    console.log('Log created:', response);
  } catch (error) {
    console.error('Failed to log database failure:', error);
  }
}

async function exampleFrontendInfo() {
  try {
    const response = await Log('frontend', 'info', 'component', 'User profile updated successfully');
    console.log('Log created:', response);
  } catch (error) {
    console.error('Failed to log frontend info:', error);
  }
}


async function exampleDebugLog() {
  try {
    const response = await Log('backend', 'debug', 'utils', 'Cache refresh initiated at ' + new Date().toISOString());
    console.log('Log created:', response);
  } catch (error) {
    console.error('Failed to log debug info:', error);
  }
}


async function exampleWarningLog() {
  try {
    const response = await Log('frontend', 'warn', 'api', 'API rate limit approaching threshold (80%)');
    console.log('Log created:', response);
  } catch (error) {
    console.error('Failed to log warning:', error);
  }
}


async function runExamples() {
  console.log('Running logging middleware examples:');
  console.log('-----------------------------------');
  
  console.log('\nExample 1: Backend Error Log');
  await exampleBackendError();
  
  console.log('\nExample 2: Database Failure Log');
  await exampleDatabaseFailure();
  
  console.log('\nExample 3: Frontend Info Log');
  await exampleFrontendInfo();
  
  console.log('\nExample 4: Debug Log');
  await exampleDebugLog();
  
  console.log('\nExample 5: Warning Log');
  await exampleWarningLog();
}


if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  exampleBackendError,
  exampleDatabaseFailure,
  exampleFrontendInfo,
  exampleDebugLog,
  exampleWarningLog,
  runExamples
};
