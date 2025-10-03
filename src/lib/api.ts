const API_BASE_URL = 'https://dental-clinic-backend-0twz.onrender.com/';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export class ApiService {
  // Auth endpoints
  static async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  }

  static async register(userData: {
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    fullName: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  }

  // Patient OTP endpoints
  static async generatePatientOTP(phoneNumber: string) {
    const response = await fetch(`${API_BASE_URL}/patient-otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });
    return handleResponse(response);
  }

  static async verifyPatientOTP(phoneNumber: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/patient-otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, otp }),
    });
    return handleResponse(response);
  }

  static async logoutPatient(phoneNumber: string) {
    const response = await fetch(`${API_BASE_URL}/patient-otp/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });
    return handleResponse(response);
  }

  // Patient endpoints
  static async getPatients() {
    const response = await fetch(`${API_BASE_URL}/patients`);
    return handleResponse(response);
  }

  static async getPatient(id: string) {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`);
    return handleResponse(response);
  }

  static async createPatient(patientData: any) {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });
    return handleResponse(response);
  }

  static async updatePatient(id: string, patientData: any) {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });
    return handleResponse(response);
  }

  static async deletePatient(id: string) {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }

  // Appointment endpoints
  static async getAppointments() {
    const response = await fetch(`${API_BASE_URL}/appointments`);
    return handleResponse(response);
  }

  static async getAppointment(id: string) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`);
    return handleResponse(response);
  }

  static async createAppointment(appointmentData: any) {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });
    return handleResponse(response);
  }

  static async updateAppointment(id: string, appointmentData: any) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });
    return handleResponse(response);
  }

  static async deleteAppointment(id: string) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }

  // Expense endpoints
  static async getExpenses() {
    const response = await fetch(`${API_BASE_URL}/expenses`);
    return handleResponse(response);
  }

  static async getPendingExpenses() {
    const response = await fetch(`${API_BASE_URL}/expenses/pending`);
    return handleResponse(response);
  }

  static async getExpense(id: string) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`);
    return handleResponse(response);
  }

  static async createExpense(expenseData: any) {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
    return handleResponse(response);
  }

  static async updateExpense(id: string, expenseData: any) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
    return handleResponse(response);
  }

  static async deleteExpense(id: string) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }

  static async approveExpense(id: string) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}/approve`, {
      method: 'POST',
    });
    return handleResponse(response);
  }

  static async rejectExpense(id: string) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}/reject`, {
      method: 'POST',
    });
    return handleResponse(response);
  }

  // User endpoints
  static async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    return handleResponse(response);
  }

  static async getUser(id: string) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return handleResponse(response);
  }

  static async getUsersByRole(role: string) {
    const response = await fetch(`${API_BASE_URL}/users/role/${role}`);
    return handleResponse(response);
  }

  static async createUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  }

  static async updateUser(id: string, userData: any) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  }

  static async deleteUser(id: string) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }

  // Billing endpoints
  static async getBills() {
    const response = await fetch(`${API_BASE_URL}/billing`);
    return handleResponse(response);
  }

  static async getBillsByPatient(patientId: string) {
    const response = await fetch(`${API_BASE_URL}/billing/patient/${patientId}`);
    return handleResponse(response);
  }

  static async getBill(id: string) {
    const response = await fetch(`${API_BASE_URL}/billing/${id}`);
    return handleResponse(response);
  }

  static async createBill(data: any) {
    const response = await fetch(`${API_BASE_URL}/billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  static async updateBill(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/billing/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  static async deleteBill(id: string) {
    const response = await fetch(`${API_BASE_URL}/billing/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }

  // Prescription endpoints
  static async getPrescriptions() {
    const response = await fetch(`${API_BASE_URL}/prescriptions`);
    return handleResponse(response);
  }

  static async getPrescriptionsByPatient(patientId: string) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/patient/${patientId}`);
    return handleResponse(response);
  }

  static async getPrescription(id: string) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`);
    return handleResponse(response);
  }

  static async createPrescription(data: any) {
    const response = await fetch(`${API_BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  static async updatePrescription(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  static async deletePrescription(id: string) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }

  // Settings
  static async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings`);
    return handleResponse(response);
  }

  static async updateSettings(data: any) {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  // Analytics
  static async getAnalyticsSummary(params?: { start?: string; end?: string }) {
    const url = new URL(`${API_BASE_URL}/analytics/summary`);
    if (params?.start) url.searchParams.set('start', params.start);
    if (params?.end) url.searchParams.set('end', params.end);
    const response = await fetch(url.toString());
    return handleResponse(response);
  }

  static async downloadAnalyticsCsv(params?: { start?: string; end?: string }) {
    const url = new URL(`${API_BASE_URL}/analytics/report.csv`);
    if (params?.start) url.searchParams.set('start', params.start);
    if (params?.end) url.searchParams.set('end', params.end);
    const response = await fetch(url.toString());
    if (!response.ok) throw new ApiError(response.status, 'Failed to download CSV');
    const blob = await response.blob();
    return blob;
  }

  // Reports (attachments)
  static async uploadReport(patientId: string, file: File, doctorId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', patientId);
    if (doctorId) formData.append('doctorId', doctorId);
    const response = await fetch(`${API_BASE_URL}/reports/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  }

  static async getReportsByPatient(patientId: string) {
    const response = await fetch(`${API_BASE_URL}/reports/patient/${patientId}`);
    return handleResponse(response);
  }

  static getReportDownloadUrl(reportId: string | number) {
    return `${API_BASE_URL}/reports/${reportId}/download`;
  }

  // Medical Notes endpoints
  static async getMedicalNotesByPatient(patientId: string) {
    const response = await fetch(`${API_BASE_URL}/medical-notes/patient/${patientId}`);
    return handleResponse(response);
  }

  static async createMedicalNote(data: any) {
    const response = await fetch(`${API_BASE_URL}/medical-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  static async updateMedicalNote(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/medical-notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  static async deleteMedicalNote(id: string) {
    const response = await fetch(`${API_BASE_URL}/medical-notes/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }

  // Medication endpoints
  static async getMedications() {
    const response = await fetch(`${API_BASE_URL}/medications`);
    return handleResponse(response);
  }

  static async createMedication(data: any) {
    const response = await fetch(`${API_BASE_URL}/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  static async updateMedication(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  static async deleteMedication(id: string) {
    const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }

  // File upload endpoints
  static async uploadFile(file: File, type: string = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/files/upload/${type}`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  }

  // WhatsApp endpoints
  static async sendFileToWhatsApp(phoneNumber: string, message: string, fileName: string, fileUrl: string) {
    const response = await fetch(`${API_BASE_URL}/whatsapp/send-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, message, fileName, fileUrl }),
    });
    return handleResponse(response);
  }

  static async sendMultipleFilesToWhatsApp(phoneNumber: string, message: string, files: Array<{fileName: string, fileUrl: string}>) {
    const response = await fetch(`${API_BASE_URL}/whatsapp/send-multiple-files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, message, files }),
    });
    return handleResponse(response);
  }

  static async sendBillToWhatsApp(phoneNumber: string, message: string, billData: any) {
    const response = await fetch(`${API_BASE_URL}/whatsapp/send-bill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, message, billData }),
    });
    return handleResponse(response);
  }

  // Patient OTP endpoints
  static async generatePatientOTP(phoneNumber: string) {
    const response = await fetch(`${API_BASE_URL}/patient-otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    return handleResponse(response);
  }

  static async verifyPatientOTP(phoneNumber: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/patient-otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp }),
    });
    return handleResponse(response);
  }

  // Patient portal endpoints
  static async getPatientByPhone(phoneNumber: string) {
    const response = await fetch(`${API_BASE_URL}/patients/phone/${phoneNumber}`);
    return handleResponse(response);
  }

  static async getPatientAppointments(patientId: string) {
    const response = await fetch(`${API_BASE_URL}/appointments/patient/${patientId}`);
    return handleResponse(response);
  }

 

  static async getPatientMedicalNotes(patientId: string) {
    const response = await fetch(`${API_BASE_URL}/prescription-notes/patient/${patientId}`);
    return handleResponse(response);
  }

  static async getPatientReports(patientId: string) {
    const response = await fetch(`${API_BASE_URL}/reports/patient/${patientId}`);
    return handleResponse(response);
  }
  // Notify endpoints
static async sendPatientFileNotification(payload: {
  patientId: number | string;
  title: string;
  fileType: string;
  content?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/notify/send-file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

static async sendAppointmentUpdateNotification(payload: {
  appointmentId: number | string;
  status: string;
}) {
  const response = await fetch(`${API_BASE_URL}/appointments/${payload.appointmentId}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: payload.status }),
  });
  return handleResponse(response);
}

}

export { ApiError };
