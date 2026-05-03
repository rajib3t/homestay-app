// Test script to verify POST request retry after token refresh
import { apiClient } from './src/lib/api.js'

console.log('Testing POST request retry after token refresh...')

// Set an expired token to trigger the refresh flow
apiClient.setAuthToken('expired_token_here')

// Test data for POST request
const testData = { name: 'Test User', email: 'test@example.com' }

// Make a POST request that should trigger token refresh and retry
apiClient.protectedPost('/api/v1/users/', testData)
  .then(response => {
    console.log('✅ POST request succeeded after retry:')
    console.log('Response:', response.data)
  })
  .catch(error => {
    console.log('❌ POST request failed:')
    console.log('Error message:', error.message)
    console.log('Error status:', error.status)
    console.log('Error code:', error.code)
    
    // Check if this is the expected expired token error
    if (error.message.includes('Invalid or expired token')) {
      console.log('Note: Got expected token error - retry mechanism should have been triggered')
    }
  })
