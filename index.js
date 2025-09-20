
const axios = require('axios');

async function Log(stack, level, packageName, message) {
  try {
    if (!isValidStack(stack)) {
      throw new Error(`Invalid stack value: ${stack}. Must be 'backend' or 'frontend'`);
    }

    if (!isValidLevel(level)) {
      throw new Error(`Invalid log level: ${level}. Must be 'debug', 'info', 'warn', 'error', or 'fatal'`);
    }

    if (!isValidPackage(packageName, stack)) {
      throw new Error(`Invalid package name: ${packageName} for stack: ${stack}`);
    }

    const payload = {
      stack,
      level,
      package: packageName,
      message
    };

    const response = await axios.post(
      'http://20.244.56.144/evaluation-service/logs',
      payload
    );

    return response.data;
  } catch (error) {
    console.error('Logging service error:', error);
    throw error;
  }
}


function isValidStack(stack) {
  return ['backend', 'frontend'].includes(stack.toLowerCase());
}

function isValidLevel(level) {
  return ['debug', 'info', 'warn', 'error', 'fatal'].includes(level.toLowerCase());
}

function isValidPackage(packageName, stack) {
  const backendPackages = [
    'cache', 'controller', 'cron_job', 'db', 'domain', 
    'handler', 'repository', 'route', 'service',
    'auth', 'config', 'middleware', 'utils'
  ];
  
  const frontendPackages = [
    'api', 'component', 'hook', 'page', 'state', 'style',
    'auth', 'config', 'middleware', 'utils'
  ];

  const normalizedPackage = packageName.toLowerCase();
  
  if (stack.toLowerCase() === 'backend') {
    return backendPackages.includes(normalizedPackage);
  } else if (stack.toLowerCase() === 'frontend') {
    return frontendPackages.includes(normalizedPackage);
  }
  
  return false;
}

module.exports = Log;
