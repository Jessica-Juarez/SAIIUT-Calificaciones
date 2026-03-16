import client from "./axiosClient";

export const authService = {
  login: (email, password) => client.post("/login", { email, password }),
};

export const teacherService = {
  // Conecta con teacherContro
  // ller.js: getMyGroups
  getMyGroups: (teacherId) => client.get(`/teachers/${teacherId}/groups`),

  // Conecta con teacherController.js: getGroupStudents
  getGroupStudents: (groupId) =>
    client.get(`/teachers/groups/${groupId}/students`),

  // Conecta con teacherController.js: updateGrade
  updateGrade: (data) => client.post("/teachers/grades", data),
};

export const studentService = {
  // Conecta con studentController.js: getHistory
  getHistory: (studentId) => client.get(`/students/${studentId}/history`),
};

export const adminService = {
  getTeachers: () => client.get("/admin/teachers"),
  getSubjects: () => client.get("/admin/subjects"),
  createGroup: (data) => client.post("/admin/groups", data),
  createUser: (data) => client.post("/admin/users", data),
  getStats: () => client.get('/admin/stats'),
};
