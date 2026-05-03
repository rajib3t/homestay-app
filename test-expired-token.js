// Test script to verify expired token error handling
import { apiClient } from './src/lib/api.js'

// Simulate an expired token scenario
console.log('Testing expired token error handling...')

// Set an expired token (you can use any invalid token)
apiClient.setAuthToken('expired_or_invalid_token_here')

// Try to make a protected request
apiClient.protectedPost('/some-protected-endpoint', { test: 'data' })
  .then(response => {
    console.log('Unexpected success:', response)
  })
  .catch(error => {
    console.log('Error caught successfully:')
    console.log('Message:', error.message)
    console.log('Status:', error.status)
    console.log('Code:', error.code)
    
    // Check if the error message is preserved
    if (error.message.includes('Invalid or expired token') || error.message.includes('expired')) {
      console.log('✅ Test passed: Original error message preserved')
    } else {
      console.log('❌ Test failed: Error message was overridden')
    }
  })
