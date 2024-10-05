const hasFeature = ({ feature, currentPlan, count = 0 }) => {
  // Helper function to evaluate the feature based on its type
  const evaluateFeature = (_feature, count = 0) => {
    if (_feature.type === "boolean") {
      // If the feature is a boolean, return its value
      return _feature.value;
    } else if (_feature.type === "limit") {
      // If the feature is a limit, check if the count is within the limit
      return count < _feature.value || _feature.value === -1;
    }
    // Default to false if the feature type is not recognized
    return false;
  };

  // Check if the current plan has the specified feature
  for (const key in currentPlan.features) {
    if (key === feature) {
      // Evaluate the feature with the given count
      return evaluateFeature(currentPlan.features[key], count);
    }
  }
  // Return false if the feature is not found in the current plan
  return false;
};

const featureAllowance = (customer, feature) => {
  if (customer === undefined || customer === null) {
    return null;
  }

  const currentPlan = searchPlanWithName(customer, getCurrentPlan(customer));
  if (!currentPlan) {
    return null;
  }

  for (const key in currentPlan.features) {
    if (key === feature) {
      const featureDetails = currentPlan.features[key];

      if (featureDetails.type === "limit") {
        const currentUsage = getCurrentPlanFeatureUsage(customer, feature);
        if (featureDetails.value === -1) {
          // Unlimited usage
          return Infinity;
        } else {
          // Return the remaining allowance
          return Math.max(0, featureDetails.value - currentUsage);
        }
      } else if (featureDetails.type === "boolean") {
        // For boolean features, return 1 if allowed, 0 if not
        return featureDetails.value ? 1 : 0;
      }
    }
  }

  // Feature not found in the current plan
  return 0;
};

const isFeatureAllowed = (customer, feature) => {
  if (customer === undefined || customer === null) {
    return null;
  }

  const currentPlan = searchPlanWithName(customer, getCurrentPlan(customer));
  const count = getCurrentPlanFeatureUsage(customer, feature);

  return hasFeature({ feature, currentPlan, count });
};

const getCurrentPlan = (customer) => {
  return customer.subscription ? customer.subscription.plan.name : "Free";
};

const getCurrentPlanFeatureUsage = (customer, feature) => {
  const usage = searchUsageByEventName(customer, feature);
  if (!usage) {
    return 0;
  }
  return usage.currentValue !== undefined
    ? usage.currentValue
    : usage.allTimeValue;
};

const searchPlanWithName = (customer, planName) => {
  for (const plan of customer.plans) {
    if (plan.name === planName) {
      return plan;
    }
  }

  return null;
};

const searchUsageByEventName = (customer, eventName) => {
  if (!customer || !customer.usage) {
    return null;
  }

  for (const [key, value] of Object.entries(customer.usage)) {
    if (value.eventName === eventName) {
      return value;
    }
  }

  return null;
};

export { isFeatureAllowed, featureAllowance };
