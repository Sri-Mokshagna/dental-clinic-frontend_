// Simple test script to verify backend connectivity
const API_BASE_URL = 'http://localhost:8080/api';

async function testConnectivity() {
  console.log('Testing backend connectivity...');
  
  try {
    // Test 1: Get patients
    console.log('\n1. Testing GET /api/patients');
    const patientsResponse = await fetch(`${API_BASE_URL}/patients`);
    console.log('Status:', patientsResponse.status);
    if (patientsResponse.ok) {
      const patients = await patientsResponse.json();
      console.log('Patients count:', patients.length);
    } else {
      console.log('Error:', await patientsResponse.text());
    }

    // Test 2: Get appointments
    console.log('\n2. Testing GET /api/appointments');
    const appointmentsResponse = await fetch(`${API_BASE_URL}/appointments`);
    console.log('Status:', appointmentsResponse.status);
    if (appointmentsResponse.ok) {
      const appointments = await appointmentsResponse.json();
      console.log('Appointments count:', appointments.length);
    } else {
      console.log('Error:', await appointmentsResponse.text());
    }

    // Test 3: Get expenses
    console.log('\n3. Testing GET /api/expenses');
    const expensesResponse = await fetch(`${API_BASE_URL}/expenses`);
    console.log('Status:', expensesResponse.status);
    if (expensesResponse.ok) {
      const expenses = await expensesResponse.json();
      console.log('Expenses count:', expenses.length);
    } else {
      console.log('Error:', await expensesResponse.text());
    }

    // Test 4: Test registration
    console.log('\n4. Testing POST /api/auth/register');
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpass',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        fullName: 'Test User'
      }),
    });
    console.log('Status:', registerResponse.status);
    if (registerResponse.ok) {
      const result = await registerResponse.json();
      console.log('Registration successful:', result.message);
    } else {
      const error = await registerResponse.json();
      console.log('Registration error:', error.error);
    }

    console.log('\n✅ Connectivity test completed!');
  } catch (error) {
    console.error('❌ Connectivity test failed:', error.message);
    console.log('\nMake sure the Spring Boot backend is running on http://localhost:8080');
  }
}

// Run the test
testConnectivity();
