import { PropertyTypes } from './constants';

type CompatibilityEntry = {
  compatible: boolean;
  warnings?: string[];
};

type CompatibilityMatrix = Record<string, Record<string, CompatibilityEntry>>;

type CompatibilityInput = {
  originalType: string;
  allowsUnmappedValues?: boolean | null;
  localType: string;
};

export const buildRemoteTypeKey = (originalType: string, allowsUnmappedValues?: boolean | null) => {
  if (originalType === PropertyTypes.SELECT) {
    return allowsUnmappedValues ? 'SELECT__allows_custom_values' : 'SELECT__not_allows_custom_values';
  }

  if (originalType === PropertyTypes.MULTISELECT) {
    return allowsUnmappedValues ? 'MULTISELECT__allows_custom_values' : 'MULTISELECT__not_allows_custom_values';
  }

  return originalType;
};

const TYPE_COMPATIBILITY: CompatibilityMatrix = {
  [PropertyTypes.INT]: {
    [PropertyTypes.INT]: { compatible: true },
    [PropertyTypes.FLOAT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.integerOnlyNumeric'] },
    [PropertyTypes.TEXT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.integerOnlyText'] },
    [PropertyTypes.DESCRIPTION]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.integerOnlyText'] },
    [PropertyTypes.BOOLEAN]: { compatible: false },
    [PropertyTypes.DATE]: { compatible: false },
    [PropertyTypes.DATETIME]: { compatible: false },
    [PropertyTypes.SELECT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectNumericOnly'] },
    [PropertyTypes.MULTISELECT]: { compatible: false },
  },
  [PropertyTypes.FLOAT]: {
    [PropertyTypes.INT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.decimalsRemoved'] },
    [PropertyTypes.FLOAT]: { compatible: true },
    [PropertyTypes.TEXT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.decimalAsTextOnly'] },
    [PropertyTypes.DESCRIPTION]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.decimalAsTextOnly'] },
    [PropertyTypes.BOOLEAN]: { compatible: false },
    [PropertyTypes.DATE]: { compatible: false },
    [PropertyTypes.DATETIME]: { compatible: false },
    [PropertyTypes.SELECT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectNumericOnly'] },
    [PropertyTypes.MULTISELECT]: { compatible: false },
  },
  [PropertyTypes.TEXT]: {
    [PropertyTypes.INT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.numericOnlyText'] },
    [PropertyTypes.FLOAT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.decimalAsTextOnly'] },
    [PropertyTypes.TEXT]: { compatible: true },
    [PropertyTypes.DESCRIPTION]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.longTextMayBeRejected'] },
    [PropertyTypes.BOOLEAN]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.booleanTextMapping'] },
    [PropertyTypes.DATE]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.dateAsTextIso'] },
    [PropertyTypes.DATETIME]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.datetimeAsTextIso'] },
    [PropertyTypes.SELECT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectLabelAsText'] },
    [PropertyTypes.MULTISELECT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.multiselectAsCommaText'] },
  },
  [PropertyTypes.DESCRIPTION]: {
    [PropertyTypes.INT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.numericOnlyText'] },
    [PropertyTypes.FLOAT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.decimalAsTextOnly'] },
    [PropertyTypes.TEXT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.shortTextToLongField'] },
    [PropertyTypes.DESCRIPTION]: { compatible: true },
    [PropertyTypes.BOOLEAN]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.booleanTextMapping'] },
    [PropertyTypes.DATE]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.dateAsTextIso'] },
    [PropertyTypes.DATETIME]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.datetimeAsTextIso'] },
    [PropertyTypes.SELECT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectLabelAsText'] },
    [PropertyTypes.MULTISELECT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.multiselectAsCommaText'] },
  },
  [PropertyTypes.BOOLEAN]: {
    [PropertyTypes.INT]: { compatible: false },
    [PropertyTypes.FLOAT]: { compatible: false },
    [PropertyTypes.TEXT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.booleanTextMapping'] },
    [PropertyTypes.DESCRIPTION]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.booleanTextMapping'] },
    [PropertyTypes.BOOLEAN]: { compatible: true },
    [PropertyTypes.DATE]: { compatible: false },
    [PropertyTypes.DATETIME]: { compatible: false },
    [PropertyTypes.SELECT]: { compatible: false },
    [PropertyTypes.MULTISELECT]: { compatible: false },
  },
  [PropertyTypes.DATE]: {
    [PropertyTypes.INT]: { compatible: false },
    [PropertyTypes.FLOAT]: { compatible: false },
    [PropertyTypes.TEXT]: { compatible: false },
    [PropertyTypes.DESCRIPTION]: { compatible: false },
    [PropertyTypes.BOOLEAN]: { compatible: false },
    [PropertyTypes.DATE]: { compatible: true },
    [PropertyTypes.DATETIME]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.dateToDatetimeMidnight'] },
    [PropertyTypes.SELECT]: { compatible: false },
    [PropertyTypes.MULTISELECT]: { compatible: false },
  },
  [PropertyTypes.DATETIME]: {
    [PropertyTypes.INT]: { compatible: false },
    [PropertyTypes.FLOAT]: { compatible: false },
    [PropertyTypes.TEXT]: { compatible: false },
    [PropertyTypes.DESCRIPTION]: { compatible: false },
    [PropertyTypes.BOOLEAN]: { compatible: false },
    [PropertyTypes.DATE]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.datetimeToDateDropTime'] },
    [PropertyTypes.DATETIME]: { compatible: true },
    [PropertyTypes.SELECT]: { compatible: false },
    [PropertyTypes.MULTISELECT]: { compatible: false },
  },
  SELECT__allows_custom_values: {
    [PropertyTypes.INT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectCustomNumber'] },
    [PropertyTypes.FLOAT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectCustomNumber'] },
    [PropertyTypes.TEXT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectCustomText'] },
    [PropertyTypes.DESCRIPTION]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectCustomLongText'] },
    [PropertyTypes.BOOLEAN]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectToBooleanMapping'] },
    [PropertyTypes.DATE]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectCustomDate'] },
    [PropertyTypes.DATETIME]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectCustomDatetime'] },
    [PropertyTypes.SELECT]: { compatible: true },
    [PropertyTypes.MULTISELECT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectCustomMultiselect'] },
  },
  SELECT__not_allows_custom_values: {
    [PropertyTypes.INT]: { compatible: false },
    [PropertyTypes.FLOAT]: { compatible: false },
    [PropertyTypes.TEXT]: { compatible: false },
    [PropertyTypes.DESCRIPTION]: { compatible: false },
    [PropertyTypes.BOOLEAN]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectToBooleanMapping'] },
    [PropertyTypes.DATE]: { compatible: false },
    [PropertyTypes.DATETIME]: { compatible: false },
    [PropertyTypes.SELECT]: { compatible: true },
    [PropertyTypes.MULTISELECT]: { compatible: false },
  },
  MULTISELECT__allows_custom_values: {
    [PropertyTypes.INT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.multiselectCustomNumber'] },
    [PropertyTypes.FLOAT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.multiselectCustomNumber'] },
    [PropertyTypes.TEXT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.multiselectCustomText'] },
    [PropertyTypes.DESCRIPTION]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.multiselectCustomLongText'] },
    [PropertyTypes.BOOLEAN]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectToBooleanMapping'] },
    [PropertyTypes.DATE]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.multiselectCustomDate'] },
    [PropertyTypes.DATETIME]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.multiselectCustomDatetime'] },
    [PropertyTypes.SELECT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.multiselectToSelectSingle'] },
    [PropertyTypes.MULTISELECT]: { compatible: true },
  },
  MULTISELECT__not_allows_custom_values: {
    [PropertyTypes.INT]: { compatible: false },
    [PropertyTypes.FLOAT]: { compatible: false },
    [PropertyTypes.TEXT]: { compatible: false },
    [PropertyTypes.DESCRIPTION]: { compatible: false },
    [PropertyTypes.BOOLEAN]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.selectToBooleanMapping'] },
    [PropertyTypes.DATE]: { compatible: false },
    [PropertyTypes.DATETIME]: { compatible: false },
    [PropertyTypes.SELECT]: { compatible: true, warnings: ['integrations.show.mapping.typeCompatibility.warnings.multiselectToSelectSingle'] },
    [PropertyTypes.MULTISELECT]: { compatible: true },
  },
};

export const getTypeCompatibility = ({ originalType, allowsUnmappedValues, localType }: CompatibilityInput) => {
  const remoteKey = buildRemoteTypeKey(originalType, allowsUnmappedValues);
  const match = TYPE_COMPATIBILITY[remoteKey]?.[localType];
  if (!match) {
    return { compatible: false, warnings: [] };
  }
  return {
    compatible: match.compatible,
    warnings: match.warnings ?? [],
  };
};
