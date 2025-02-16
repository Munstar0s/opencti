import { expect, describe, it } from 'vitest';
import { isRelationConsistent } from '../../../src/utils/modelConsistency';
import { RELATION_CONTENT } from '../../../src/schema/stixCyberObservableRelationship';
import {
  RELATION_CREATED_BY,
  RELATION_EXTERNAL_REFERENCE,
  RELATION_KILL_CHAIN_PHASE,
  RELATION_OBJECT,
  RELATION_OBJECT_LABEL,
  RELATION_OBJECT_MARKING
} from '../../../src/schema/stixMetaRelationship';
import {
  ENTITY_HASHED_OBSERVABLE_ARTIFACT,
  ENTITY_HASHED_OBSERVABLE_STIX_FILE,
  ENTITY_SOFTWARE
} from '../../../src/schema/stixCyberObservable';
import {
  ENTITY_TYPE_ATTACK_PATTERN,
  ENTITY_TYPE_CAMPAIGN,
  ENTITY_TYPE_CONTAINER_NOTE,
  ENTITY_TYPE_CONTAINER_OBSERVED_DATA,
  ENTITY_TYPE_CONTAINER_OPINION,
  ENTITY_TYPE_COURSE_OF_ACTION,
  ENTITY_TYPE_IDENTITY_ORGANIZATION,
  ENTITY_TYPE_INCIDENT,
  ENTITY_TYPE_INDICATOR,
  ENTITY_TYPE_MALWARE,
  ENTITY_TYPE_TOOL,
  ENTITY_TYPE_VULNERABILITY
} from '../../../src/schema/stixDomainObject';
import { ENTITY_TYPE_LABEL, ENTITY_TYPE_MARKING_DEFINITION } from '../../../src/schema/stixMetaObject';
import {
  isStixCoreRelationship,
  RELATION_DERIVED_FROM,
  RELATION_INDICATES,
  RELATION_PART_OF,
  RELATION_RELATED_TO,
  RELATION_USES
} from '../../../src/schema/stixCoreRelationship';
import { ENTITY_TYPE_IDENTITY } from '../../../src/schema/general';

import '../../../src/modules/index';
import { ADMIN_USER, testContext } from '../../utils/testQuery';
import {
  isDateNumericOrBooleanAttribute,
  isJsonAttribute, isMultipleAttribute,
  schemaAttributesDefinition
} from '../../../src/schema/schema-attributes'; // Need to import registration files

describe('Testing relation consistency', () => {
  it.concurrent.each([
    // CREATED_BY
    [RELATION_CREATED_BY, ENTITY_HASHED_OBSERVABLE_STIX_FILE, ENTITY_TYPE_IDENTITY_ORGANIZATION, true],
    [RELATION_CREATED_BY, ENTITY_HASHED_OBSERVABLE_STIX_FILE, ENTITY_HASHED_OBSERVABLE_STIX_FILE, false],
    [RELATION_CREATED_BY, ENTITY_TYPE_COURSE_OF_ACTION, ENTITY_TYPE_CAMPAIGN, false],
    // EXTERNAL_REF
    [RELATION_EXTERNAL_REFERENCE, ENTITY_HASHED_OBSERVABLE_STIX_FILE, ENTITY_TYPE_IDENTITY_ORGANIZATION, false],
    // LABEL
    [RELATION_OBJECT_LABEL, ENTITY_HASHED_OBSERVABLE_STIX_FILE, ENTITY_TYPE_LABEL, true],
    // MARKING
    [RELATION_OBJECT_MARKING, ENTITY_HASHED_OBSERVABLE_STIX_FILE, ENTITY_TYPE_MARKING_DEFINITION, true],
    [RELATION_OBJECT_MARKING, ENTITY_TYPE_CONTAINER_NOTE, ENTITY_TYPE_MALWARE, false],
    [RELATION_OBJECT_MARKING, ENTITY_TYPE_CONTAINER_OPINION, ENTITY_TYPE_MALWARE, false],
    // OBS_CONTENT
    [RELATION_CONTENT, ENTITY_SOFTWARE, ENTITY_HASHED_OBSERVABLE_STIX_FILE, false],
    [RELATION_CONTENT, ENTITY_HASHED_OBSERVABLE_STIX_FILE, ENTITY_HASHED_OBSERVABLE_ARTIFACT, true],
    [RELATION_CONTENT, ENTITY_HASHED_OBSERVABLE_STIX_FILE, ENTITY_HASHED_OBSERVABLE_ARTIFACT, true],
    [RELATION_CONTENT, ENTITY_TYPE_CONTAINER_OBSERVED_DATA, ENTITY_HASHED_OBSERVABLE_STIX_FILE, false],
    // KILL_CHAIN
    [RELATION_KILL_CHAIN_PHASE, ENTITY_HASHED_OBSERVABLE_STIX_FILE, ENTITY_HASHED_OBSERVABLE_ARTIFACT, false],
    // OBJECT_REF
    [RELATION_OBJECT, ENTITY_TYPE_CONTAINER_OPINION, [
      ENTITY_TYPE_MALWARE,
      ENTITY_TYPE_CONTAINER_NOTE,
      ENTITY_TYPE_INCIDENT,
      ENTITY_TYPE_CONTAINER_OBSERVED_DATA,
    ], true],
    [RELATION_OBJECT, ENTITY_HASHED_OBSERVABLE_STIX_FILE, [
      ENTITY_TYPE_MALWARE,
      ENTITY_TYPE_CONTAINER_NOTE,
      ENTITY_TYPE_INCIDENT,
      ENTITY_TYPE_CONTAINER_OBSERVED_DATA,
    ], false],
    // MODULE
    // TODO This should work someday when we find a way of importing modules without breaking testing
    // [RELATION_BELONGS_TO, ENTITY_TYPE_CHANNEL, ENTITY_TYPE_IDENTITY_ORGANIZATION, false],
    // RELATIONSHIPS
    [RELATION_USES, ENTITY_TYPE_CAMPAIGN, ENTITY_TYPE_ATTACK_PATTERN, true],
    [RELATION_USES, ENTITY_TYPE_CAMPAIGN, ENTITY_TYPE_MALWARE, true],
    [RELATION_INDICATES, ENTITY_TYPE_INDICATOR, ENTITY_TYPE_MALWARE, true],
    [RELATION_DERIVED_FROM, ENTITY_TYPE_INDICATOR, ENTITY_TYPE_INDICATOR, true],
    [RELATION_RELATED_TO, ENTITY_TYPE_TOOL, ENTITY_TYPE_VULNERABILITY, true],
    [RELATION_USES, ENTITY_TYPE_INDICATOR, ENTITY_TYPE_MALWARE, false],
    [RELATION_USES, ENTITY_TYPE_CAMPAIGN, ENTITY_TYPE_VULNERABILITY, false],
    [RELATION_PART_OF, ENTITY_TYPE_IDENTITY, ENTITY_TYPE_IDENTITY, false],
    // TODO THIS SHOULD BE SUPPORTED
    [RELATION_DERIVED_FROM, ENTITY_TYPE_TOOL, ENTITY_TYPE_VULNERABILITY, false],
  ])(
    'Trying to create a relation of type %s from %s to %s',
    async (relType, fromType, toType, expected) => {
      const relationConsistency = await isRelationConsistent(
        testContext,
        ADMIN_USER,
        relType,
        { entity_type: fromType },
        Array.isArray(toType) ? toType.map((t) => ({ entity_type: t })) : { entity_type: toType }
      );
      expect(relationConsistency).toBe(expected);
    }
  );
});

describe('Testing schema definition', () => {
  it('Attributes type testing', () => {
    expect(isJsonAttribute('revoked')).toBe(false);
    expect(isJsonAttribute('bookmarks')).toBe(true);
    expect(isDateNumericOrBooleanAttribute('bookmarks')).toBe(false);
    expect(isDateNumericOrBooleanAttribute('attribute_order')).toBe(true);
    expect(isDateNumericOrBooleanAttribute('start_time')).toBe(true);
    expect(isDateNumericOrBooleanAttribute('platform_hidden_type')).toBe(true);
    expect(isMultipleAttribute('platform_hidden_type')).toBe(false);
    expect(isMultipleAttribute('channel_types')).toBe(true);
  });
  it('Attributes upsert testing', () => {
    const availableAttributes = schemaAttributesDefinition.getAttributes('Report');
    const upsertAttributes = availableAttributes.filter((f) => f.upsert).map((f) => f.name).sort();
    const reportUpsertAttributes = schemaAttributesDefinition.getUpsertAttributeNames('Report').sort();
    expect(upsertAttributes).toStrictEqual(reportUpsertAttributes);
  });
  it('Attributes ref testing', () => {
    expect(isStixCoreRelationship('Report'), false);
    expect(isStixCoreRelationship('stix-core-relationship'), true);
    expect(isStixCoreRelationship('detects'), true);
    expect(isStixCoreRelationship('detects-false'), false);
  });
});
