import axios from 'axios';

const DEV_MODE = false; 

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

    if (DEV_MODE) {
      console.log(`[${level.toUpperCase()}][${stack}][${packageName}] ${message}`);
      return {
        logID: `mock-${Date.now()}`,
        message: "log created successfully (mock)"
      };
    }

    try {
      const response = await axios.post(
        'http://20.244.56.144/evaluation-service/logs',
        payload,
        {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEwMDAwMTgzNDFAZGl0LmVkdS5pbiIsIm5hbWUiOiJBbnVzaGthIEd1cHRhIiwicm9sbE5vIjoiMjIwMTAyMzE1IiwiYWNjZXNzQ29kZSI6IlNrbW5ldyIsImNsaWVudElEIjoiNmJlNDhkZGYtOTM4Ny00ZTNjLTk1ZGEtOWJlMjc1OWE4OTRhIiwiY2xpZW50U2VjcmV0IjoiTXdwdWRWTk1VWWRFQ2oiLCJpYXQiOjE3MTczNTY4MzUsImV4cCI6MTc1ODM1NjgzNX0.Bj7hD82bMiMxHQj-BDkG_LM',
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (networkError) {
      console.warn('Logging service unavailable, using fallback logging:', networkError.message);
      return {
        logID: `fallback-${Date.now()}`,
        message: "log created successfully (fallback)"
      };
    }
  } catch (error) {
    console.error('Logging validation error:', error.message);
    return {
      logID: `error-${Date.now()}`,
      message: `Log validation error: ${error.message}`
    };
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

export default Log;
