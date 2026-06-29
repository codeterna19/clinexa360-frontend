export const hasFeatureAccess = (user, featureName) => {
  // If no user or they are SuperAdmin, they bypass feature checks
  if (!user || user.role === 'SuperAdmin') return true;

  // If there's no clinic bound to the user (edge case), return false
  if (!user.clinic_id) return false;

  const planFeatures = user.clinic_id.subscriptionPlan?.features || [];
  const customFeatures = user.clinic_id.customFeatures || [];

  const allFeatures = [...planFeatures, ...customFeatures];
  
  // Case-insensitive match for the required feature
  return allFeatures.some(f => f.name?.toLowerCase() === featureName.toLowerCase());
};
