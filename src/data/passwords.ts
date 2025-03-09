
// User passwords for authentication
export const mockPasswords: Record<string, string> = {
  'admin': 'admin123',
  'kivinga.wambua': 'Wambua123',
  'elizabeth.kadzo': 'Kadzo123',
  'cyrus.wambua': 'Wambua123',
  'dunson.mwandwa': 'Mwandwa123',
  'masha.ngovi': 'Ngovi123',
  'godfrey.mambo': 'Mambo123',
  'firdaus.said': 'Said123',
  'saida.seif': 'Seif123',
  'anna.stephen': 'Stephen123',
  'laura.achieng': 'Achieng123',
  'moses.muyoga': 'Muyoga123',
  'obare.mercy': 'Mercy123',
  'salim.bizi': 'Bizi123',
  'reagan.mutua': 'Mutua123',
  'enly.masinde': 'Masinde123',
  'kenya.nassir': 'Nassir123',
  'said.swaleh': 'Swaleh123',
  'tabitha.ndumi': 'Ndumi123',
  'alice.matano': 'Matano123',
  'mary.shirleen': 'Shirleen123'
};

// Function to associate email-based logins with username passwords
export const generateEmailPasswords = (users: any[]): Record<string, string> => {
  const emailPasswords: Record<string, string> = {};
  
  users.forEach(user => {
    if (user.email && user.username && mockPasswords[user.username]) {
      emailPasswords[user.email] = mockPasswords[user.username];
    }
  });
  
  return emailPasswords;
};
