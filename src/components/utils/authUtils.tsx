// En src/utils/authUtils.ts u otro lugar apropiado
export const wasExplicitLogout = (gracePeriodMinutes = 10): boolean => {
  const explicitLogout = localStorage.getItem('explicit_logout') === 'true';
  const logoutTimeStr = localStorage.getItem('explicit_logout_time');
  
  if (explicitLogout && logoutTimeStr) {
    const logoutTime = new Date(logoutTimeStr);
    const now = new Date();
    const minutesSinceLogout = (now.getTime() - logoutTime.getTime()) / (1000 * 60);
    
    return minutesSinceLogout < gracePeriodMinutes;
  }
  
  return false;
};