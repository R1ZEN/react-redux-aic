export const validateParamsConsistency = (
  collectorParams: Record<string, any>,
  currentParams: Record<string, any>
) => {
  let error = false;
  const keysCurrent = Object.keys(currentParams);
  const keysCollector = Object.keys(collectorParams);

  if (keysCollector.length !== keysCurrent.length) {
    error = true;
  } else {
    for (const key of keysCurrent) {
      if (collectorParams[key] !== currentParams[key]) {
        error = true;
        break;
      }
    }
  }

  if (error) {
    throw new Error(
      `useAicSelector: Consistency error. Params ${JSON.stringify(
        currentParams
      )} is not equal ${JSON.stringify(collectorParams)}`
    );
  }
};
