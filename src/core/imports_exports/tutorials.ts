export type TutorialField = {
  name: string;
  required: string;
  dataType: string;
  meaning: string;
  behavior: string;
};

export type TutorialSection = {
  title: string;
  intro?: string;
  fields: TutorialField[];
};

export type TutorialDefinition = {
  type: string;
  purpose: string;
  minimumRule: string;
  notes?: string[];
  sections: TutorialSection[];
  exampleJson: string;
};

const removeBackendOnlyReferenceFields = (definition: TutorialDefinition): TutorialDefinition => ({
  ...definition,
  sections: definition.sections.map((section) => ({
    ...section,
    fields: section.fields.filter((field) => field.dataType !== 'object/ref'),
  })),
});

const tutorialDefinitions: Record<string, TutorialDefinition> = {
  property: {
    type: 'property',
    purpose: 'Create or update a Property.',
    minimumRule: 'At least one of `name` or `internal_name` is required.',
    sections: [
      {
        title: 'Property fields',
        fields: [
          { name: 'name', required: 'Conditional', dataType: 'string', meaning: 'Human label of the property.', behavior: 'Can create the property even when `internal_name` is missing.' },
          { name: 'internal_name', required: 'Conditional', dataType: 'string', meaning: 'Stable internal key.', behavior: 'Can identify or create the property even when `name` is missing.' },
          { name: 'type', required: 'Optional', dataType: 'string', meaning: 'Property type such as SELECT or TEXT.', behavior: 'Backend can auto-detect when omitted.' },
          { name: 'is_public_information', required: 'Optional', dataType: 'boolean', meaning: 'Whether the property is public-facing.', behavior: 'Saved directly on the property.' },
          { name: 'add_to_filters', required: 'Optional', dataType: 'boolean', meaning: 'Whether the property should appear in filters.', behavior: 'Saved directly on the property.' },
          { name: 'has_image', required: 'Optional', dataType: 'boolean', meaning: 'Whether selectable values may use images.', behavior: 'Saved directly on the property.' },
          { name: 'is_product_type', required: 'Optional', dataType: 'boolean', meaning: 'Marks this property as the product-type property.', behavior: 'Used by rules and configurator logic.' },
          { name: 'translations', required: 'Optional', dataType: 'array', meaning: 'Localized labels.', behavior: 'Each row creates or updates a property translation.' },
        ],
      },
      {
        title: 'translations[]',
        fields: [
          { name: 'language', required: 'Required', dataType: 'string', meaning: 'Language code such as `en`.', behavior: 'Used as the translation key.' },
          { name: 'name', required: 'Required', dataType: 'string', meaning: 'Localized property name.', behavior: 'Saved as a translation row.' },
        ],
      },
    ],
    exampleJson: `{
  "name": "Color",
  "internal_name": "color",
  "type": "SELECT",
  "is_public_information": true,
  "add_to_filters": true,
  "has_image": false,
  "translations": [
    { "language": "en", "name": "Color" },
    { "language": "nl", "name": "Kleur" }
  ]
}`,
  },
  property_select_value: {
    type: 'property_select_value',
    purpose: 'Create or update a selectable value of a property.',
    minimumRule: '`value` is required. For user imports, provide `property_data` so the backend can resolve or create the parent property.',
    sections: [
      {
        title: 'Select value fields',
        fields: [
          { name: 'value', required: 'Required', dataType: 'string', meaning: 'Display value of the option.', behavior: 'Primary value used to create or find the select value.' },
          { name: 'property_data', required: 'Conditional', dataType: 'object', meaning: 'Property payload for the parent property.', behavior: 'Property importer runs first if the property must be created or resolved.' },
          { name: 'translations', required: 'Optional', dataType: 'array', meaning: 'Localized option values.', behavior: 'Each row creates or updates a translation.' },
        ],
      },
      {
        title: 'translations[]',
        fields: [
          { name: 'language', required: 'Required', dataType: 'string', meaning: 'Language code.', behavior: 'Used as translation key.' },
          { name: 'value', required: 'Required', dataType: 'string', meaning: 'Localized select-value text.', behavior: 'Stored as translation text.' },
        ],
      },
    ],
    exampleJson: `{
  "value": "Red",
  "property_data": {
    "name": "Color",
    "internal_name": "color",
    "type": "SELECT"
  },
  "translations": [
    { "language": "en", "value": "Red" },
    { "language": "nl", "value": "Rood" }
  ]
}`,
  },
  property_rule: {
    type: 'property_rule',
    purpose: 'Create or update a ProductPropertiesRule.',
    minimumRule: '`value` is required.',
    notes: [
      'Allowed `items[].type` values: REQUIRED_IN_CONFIGURATOR, OPTIONAL_IN_CONFIGURATOR, REQUIRED, OPTIONAL.',
    ],
    sections: [
      {
        title: 'Rule fields',
        fields: [
          { name: 'value', required: 'Required', dataType: 'string', meaning: 'Product type value such as `T-Shirt`.', behavior: 'Used to resolve or create the rule product type.' },
          { name: 'require_ean_code', required: 'Optional', dataType: 'boolean', meaning: 'Whether products using this rule require EANs.', behavior: 'Saved directly on the rule.' },
          { name: 'items', required: 'Optional', dataType: 'array', meaning: 'Rule items and required properties.', behavior: 'Each row creates or updates a rule item.' },
        ],
      },
      {
        title: 'items[]',
        fields: [
          { name: 'property', required: 'Conditional', dataType: 'object/ref', meaning: 'Existing property reference.', behavior: 'Mostly for internal/backend-oriented flows.' },
          { name: 'property_data', required: 'Conditional', dataType: 'object', meaning: 'Property payload.', behavior: 'Property is resolved or created first.' },
          { name: 'rule', required: 'Conditional', dataType: 'object/ref', meaning: 'Existing rule reference.', behavior: 'Usually internal and not needed in normal JSON.' },
          { name: 'rule_data', required: 'Conditional', dataType: 'object', meaning: 'Rule payload.', behavior: 'Used when no rule object is passed.' },
          { name: 'type', required: 'Optional', dataType: 'string', meaning: 'Rule item type.', behavior: 'Defaults to OPTIONAL when omitted.' },
          { name: 'sort_order', required: 'Optional', dataType: 'number', meaning: 'Ordering within the rule.', behavior: 'Saved directly.' },
        ],
      },
    ],
    exampleJson: `{
  "value": "T-Shirt",
  "require_ean_code": true,
  "items": [
    {
      "property_data": {
        "name": "Color",
        "internal_name": "color",
        "type": "SELECT"
      },
      "type": "REQUIRED_IN_CONFIGURATOR",
      "sort_order": 1
    }
  ]
}`,
  },
  product: {
    type: 'product',
    purpose: 'Create or update a full product with nested content, media, prices, properties, and variation structures.',
    minimumRule: 'For reliable user imports, treat `sku` as required even though the backend can auto-generate one.',
    notes: [
      'If no `sku` is sent, the backend generates a random SKU.',
      'If no translations are sent but `name` exists, the backend creates a default translation.',
      'If `ean_code` is sent, the backend only materializes that EAN automatically for SIMPLE products.',
      '`product_type`, `properties`, `configurator_select_values`, and `skip_rule_item_sync` all influence rule and property synchronization.',
    ],
    sections: [
      {
        title: 'Top-level fields',
        fields: [
          { name: 'name', required: 'Optional', dataType: 'string', meaning: 'Human product name.', behavior: 'Can seed a default translation when translations are omitted.' },
          { name: 'sku', required: 'Required in practice', dataType: 'string', meaning: 'Product identifier.', behavior: 'Backend auto-generates one if omitted.' },
          { name: 'type', required: 'Optional', dataType: 'string', meaning: 'Product type.', behavior: 'Defaults to SIMPLE. Allowed values: SIMPLE, CONFIGURABLE, BUNDLE, ALIAS.' },
          { name: 'active', required: 'Optional', dataType: 'boolean', meaning: 'Product active state.', behavior: 'Saved directly.' },
          { name: 'vat_rate', required: 'Optional', dataType: 'number or string', meaning: 'VAT rate or VAT name.', behavior: 'Interpretation depends on `use_vat_rate_name`.' },
          { name: 'use_vat_rate_name', required: 'Optional', dataType: 'boolean', meaning: 'Interpret `vat_rate` as a VAT name.', behavior: 'Resolves VAT by name instead of numeric rate when true.' },
          { name: 'ean_code', required: 'Optional', dataType: 'string', meaning: 'Product EAN code.', behavior: 'Materialized automatically only for SIMPLE products.' },
          { name: 'allow_backorder', required: 'Optional', dataType: 'boolean', meaning: 'Backorder flag.', behavior: 'Saved directly.' },
          { name: 'alias_parent_sku', required: 'Optional', dataType: 'string', meaning: 'SKU of the alias parent product.', behavior: 'Resolved when type is ALIAS and no object reference is passed.' },
          { name: 'product_type', required: 'Optional', dataType: 'string', meaning: 'Human product type value.', behavior: 'Backend creates or updates a product rule from this value.' },
          { name: 'properties', required: 'Optional', dataType: 'array', meaning: 'Product property values.', behavior: 'Imported after product save.' },
          { name: 'translations', required: 'Optional', dataType: 'array', meaning: 'Localized product content.', behavior: 'Creates or updates product translations.' },
          { name: 'images', required: 'Optional', dataType: 'array', meaning: 'Product images.', behavior: 'Imported and linked through product-media relations.' },
          { name: 'documents', required: 'Optional', dataType: 'array', meaning: 'Product files and documents.', behavior: 'Imported and linked through media relations.' },
          { name: 'prices', required: 'Optional', dataType: 'array', meaning: 'Direct sales prices.', behavior: 'Imported as SalesPrice rows.' },
          { name: 'sales_pricelist_items', required: 'Optional', dataType: 'array', meaning: 'Pricelist-specific prices.', behavior: 'Imported as SalesPriceListItem rows.' },
          { name: 'variations', required: 'Optional', dataType: 'array', meaning: 'Explicit configurable variations.', behavior: 'Only meaningful for CONFIGURABLE products.' },
          { name: 'bundle_variations', required: 'Optional', dataType: 'array', meaning: 'Bundle children and quantities.', behavior: 'Only meaningful for BUNDLE products.' },
          { name: 'alias_variations', required: 'Optional', dataType: 'array', meaning: 'Alias child products.', behavior: 'Creates alias variants beneath the parent.' },
          { name: 'configurator_select_values', required: 'Optional', dataType: 'array', meaning: 'Select values used for auto-generated variations.', behavior: 'Backend auto-generates variation combinations when `variations` are omitted and a rule exists.' },
          { name: 'skip_rule_item_sync', required: 'Optional', dataType: 'boolean', meaning: 'Keep current rule items.', behavior: 'Prevents rebuilding rule items during import when true.' },
          { name: 'configurable_parent_sku', required: 'Optional', dataType: 'string', meaning: 'Existing configurable parent SKU.', behavior: 'Links the saved product as a variation to that parent.' },
          { name: 'bundle_parent_sku', required: 'Optional', dataType: 'string', meaning: 'Existing bundle parent SKU.', behavior: 'Links the saved product to that bundle.' },
        ],
      },
      {
        title: 'translations[]',
        fields: [
          { name: 'name', required: 'Required in practice', dataType: 'string', meaning: 'Product title in this language.', behavior: 'Main translated name.' },
          { name: 'subtitle', required: 'Optional', dataType: 'string', meaning: 'Secondary title.', behavior: 'Saved directly.' },
          { name: 'short_description', required: 'Optional', dataType: 'string', meaning: 'Short description.', behavior: 'Saved directly.' },
          { name: 'description', required: 'Optional', dataType: 'string', meaning: 'Long description.', behavior: 'Saved directly.' },
          { name: 'url_key', required: 'Optional', dataType: 'string', meaning: 'SEO slug.', behavior: 'Backend may retry with null when duplicates conflict.' },
          { name: 'language', required: 'Optional but recommended', dataType: 'string', meaning: 'Language code.', behavior: 'Falls back to the import language when omitted.' },
          { name: 'bullet_points', required: 'Optional', dataType: 'array[string]', meaning: 'Bullet points list.', behavior: 'Existing bullet points are replaced.' },
        ],
      },
      {
        title: 'properties[]',
        fields: [
          { name: 'value', required: 'Required', dataType: 'any', meaning: 'Property value.', behavior: 'Interpretation depends on the property type.' },
          { name: 'value_is_id', required: 'Optional', dataType: 'boolean', meaning: 'Whether the value contains select-value IDs.', behavior: 'Used for SELECT and MULTISELECT properties.' },
          { name: 'property', required: 'Conditional', dataType: 'object/ref', meaning: 'Existing property reference.', behavior: 'Mostly backend-oriented.' },
          { name: 'property_data', required: 'Conditional', dataType: 'object', meaning: 'Property payload.', behavior: 'Property is created or resolved if needed.' },
          { name: 'product', required: 'Conditional', dataType: 'object/ref', meaning: 'Existing product reference.', behavior: 'Usually internal when importing standalone property values.' },
          { name: 'product_data', required: 'Conditional', dataType: 'object', meaning: 'Product payload.', behavior: 'Only needed for standalone product-property imports.' },
          { name: 'translations', required: 'Optional', dataType: 'array', meaning: 'Translated text or description values.', behavior: 'Used for translated property types.' },
        ],
      },
      {
        title: 'properties[].translations[]',
        fields: [
          { name: 'language', required: 'Required', dataType: 'string', meaning: 'Language code for the translated property value.', behavior: 'Used as the translation key.' },
          { name: 'value', required: 'Conditional', dataType: 'string', meaning: 'Translated short text value.', behavior: 'Used for text-like translated property values.' },
          { name: 'description', required: 'Conditional', dataType: 'string', meaning: 'Translated long description value.', behavior: 'Used for description-like translated property values.' },
        ],
      },
      {
        title: 'images[]',
        fields: [
          { name: 'image_url', required: 'Conditional', dataType: 'string', meaning: 'HTTPS image URL.', behavior: 'Used when `image_content` is not present.' },
          { name: 'image_content', required: 'Conditional', dataType: 'string', meaning: 'Base64 file content.', behavior: 'Takes priority over `image_url`.' },
          { name: 'type', required: 'Optional', dataType: 'string', meaning: 'Image type.', behavior: 'Defaults to PACK.' },
          { name: 'title', required: 'Optional', dataType: 'string', meaning: 'Image title.', behavior: 'Saved on media.' },
          { name: 'description', required: 'Optional', dataType: 'string', meaning: 'Image description.', behavior: 'Saved on media.' },
          { name: 'is_main_image', required: 'Optional', dataType: 'boolean', meaning: 'Main image flag.', behavior: 'Defaults to false.' },
          { name: 'sort_order', required: 'Optional', dataType: 'number', meaning: 'Display order.', behavior: 'Defaults to 10.' },
        ],
      },
      {
        title: 'documents[]',
        fields: [
          { name: 'document_url', required: 'Required', dataType: 'string', meaning: 'HTTPS document URL.', behavior: 'Backend downloads the file and validates its extension.' },
          { name: 'title', required: 'Optional', dataType: 'string', meaning: 'Document title.', behavior: 'Saved on media.' },
          { name: 'description', required: 'Optional', dataType: 'string', meaning: 'Document description.', behavior: 'Saved on media.' },
          { name: 'document_type', required: 'Optional', dataType: 'string', meaning: 'Document type code or name.', behavior: 'Resolved by code or name and created if missing.' },
          { name: 'document_language', required: 'Optional', dataType: 'string', meaning: 'Language code.', behavior: 'Saved directly.' },
          { name: 'product_data', required: 'Optional', dataType: 'object', meaning: 'Product payload.', behavior: 'Only used when importing documents standalone.' },
          { name: 'sort_order', required: 'Optional', dataType: 'number', meaning: 'Order within product documents.', behavior: 'Defaults to 10.' },
        ],
      },
      {
        title: 'prices[]',
        fields: [
          { name: 'rrp', required: 'Conditional', dataType: 'number', meaning: 'Recommended retail price.', behavior: 'One of `rrp` or `price` is required.' },
          { name: 'price', required: 'Conditional', dataType: 'number', meaning: 'Sale price.', behavior: 'One of `rrp` or `price` is required.' },
          { name: 'currency', required: 'Required', dataType: 'string', meaning: 'ISO currency code.', behavior: 'Must be a supported currency.' },
          { name: 'product_data', required: 'Optional', dataType: 'object (product payload)', meaning: 'Product payload.', behavior: 'Only used for standalone price imports.' },
        ],
      },
      {
        title: 'sales_pricelist_items[]',
        fields: [
          { name: 'salespricelist', required: 'Conditional', dataType: 'object/ref', meaning: 'Existing pricelist reference.', behavior: 'Mostly backend-oriented.' },
          { name: 'salespricelist_data', required: 'Conditional', dataType: 'object', meaning: 'Pricelist payload.', behavior: 'Pricelist is created or resolved first.' },
          { name: 'product', required: 'Conditional', dataType: 'object/ref', meaning: 'Existing product reference.', behavior: 'Mostly backend-oriented.' },
          { name: 'product_data', required: 'Conditional', dataType: 'object', meaning: 'Product payload.', behavior: 'Only needed when importing standalone.' },
          { name: 'price_auto', required: 'Optional', dataType: 'number', meaning: 'Auto-calculated price.', behavior: 'Saved directly.' },
          { name: 'discount_auto', required: 'Optional', dataType: 'number', meaning: 'Auto-calculated discount.', behavior: 'Saved directly.' },
          { name: 'price_override', required: 'Optional', dataType: 'number', meaning: 'Manual override price.', behavior: 'Saved directly.' },
          { name: 'discount_override', required: 'Optional', dataType: 'number', meaning: 'Manual override discount.', behavior: 'Saved directly.' },
          { name: 'disable_auto_update', required: 'Optional', dataType: 'boolean', meaning: 'Disable automatic update behavior during import.', behavior: 'Advanced but valid user-facing field.' },
        ],
      },
      {
        title: 'configurator_select_values[]',
        intro: 'Use this array when the product type is CONFIGURABLE and you want the backend to generate the variation combinations for you.',
        fields: [
          { name: 'property_data', required: 'Required', dataType: 'object', meaning: 'Property payload for the configurator property.', behavior: 'The backend resolves or creates the select property first.' },
          { name: 'value', required: 'Required', dataType: 'string', meaning: 'Select value label.', behavior: 'The backend resolves the matching select value and uses it for variation generation.' },
        ],
      },
      {
        title: 'variations[] / bundle_variations[] / alias_variations[]',
        intro: 'Nested variation arrays are type-specific: use `variations` for CONFIGURABLE, `bundle_variations` for BUNDLE, and `alias_variations` for ALIAS parents.',
        fields: [
          { name: 'variation_data', required: 'Conditional', dataType: 'object', meaning: 'Child product payload.', behavior: 'Child product is created or resolved first.' },
          { name: 'variation_product', required: 'Conditional', dataType: 'object/ref', meaning: 'Existing child product reference.', behavior: 'Lets the backend attach an existing child.' },
          { name: 'quantity / qty', required: 'Optional', dataType: 'number', meaning: 'Bundle child quantity.', behavior: 'Defaults to 1 when omitted.' },
          { name: 'alias_copy_images / alias_copy_product_properties / alias_copy_content', required: 'Optional', dataType: 'boolean', meaning: 'Alias copy flags.', behavior: 'Only affect newly created alias products.' },
        ],
      },
    ],
    exampleJson: `{
  "name": "Plain T-Shirt",
  "sku": "plain-ts",
  "type": "SIMPLE",
  "active": true,
  "vat_rate": 19,
  "use_vat_rate_name": false,
  "ean_code": "1234567890123",
  "allow_backorder": false,
  "product_type": "T-Shirt",
  "skip_rule_item_sync": false,
  "translations": [
    {
      "language": "en",
      "name": "Plain T-Shirt",
      "subtitle": "Soft cotton basic",
      "short_description": "Very nice T-Shirt",
      "description": "Long description",
      "url_key": "plain-t-shirt",
      "bullet_points": ["100% cotton", "Machine washable"]
    }
  ],
  "properties": [
    {
      "property_data": {
        "name": "Color",
        "internal_name": "color",
        "type": "SELECT"
      },
      "value": "Red"
    }
  ],
  "images": [
    {
      "image_url": "https://example.com/image.jpg",
      "type": "PACK",
      "title": "Front",
      "description": "Front image",
      "is_main_image": true,
      "sort_order": 10
    }
  ],
  "documents": [
    {
      "document_url": "https://example.com/manual.pdf",
      "title": "Manual",
      "description": "Product manual",
      "document_type": "MANUAL",
      "document_language": "en",
      "sort_order": 10
    }
  ],
  "prices": [
    {
      "price": 49.99,
      "rrp": 59.99,
      "currency": "EUR"
    }
  ],
  "sales_pricelist_items": [
    {
      "salespricelist_data": {
        "name": "Wholesale EUR",
        "currency": "EUR"
      },
      "price_override": 39.99
    }
  ]
}`,
  },
  ean_code: {
    type: 'ean_code',
    purpose: 'Create or update a standalone EAN code row.',
    minimumRule: '`ean_code` is required. Provide `product_sku` or `product_data` so the backend can resolve the product.',
    notes: [
      'If the backend cannot resolve the product by SKU, the row is skipped.',
      'This import type is safe for bulk EAN mapping files.',
    ],
    sections: [
      {
        title: 'EAN code fields',
        fields: [
          { name: 'ean_code', required: 'Required', dataType: 'string', meaning: 'EAN value.', behavior: 'Main EAN code.' },
          { name: 'product_sku', required: 'Conditional', dataType: 'string', meaning: 'Product SKU.', behavior: 'Used to resolve the product.' },
          { name: 'product_data', required: 'Conditional', dataType: 'object', meaning: 'Product payload.', behavior: 'Backend extracts the SKU from it.' },
          { name: 'product', required: 'Conditional', dataType: 'object/ref', meaning: 'Existing product object reference.', behavior: 'Mostly backend-oriented.' },
          { name: 'internal', required: 'Optional', dataType: 'boolean', meaning: 'Internal EAN flag.', behavior: 'Defaults to false.' },
          { name: 'already_used', required: 'Optional', dataType: 'boolean', meaning: 'Already-used flag.', behavior: 'Defaults to true.' },
        ],
      },
    ],
    exampleJson: `{
  "ean_code": "1234567890123",
  "product_sku": "plain-ts",
  "internal": false,
  "already_used": true
}`,
  },
};

export const mappedImportTutorials: Record<string, TutorialDefinition> = Object.fromEntries(
  Object.entries(tutorialDefinitions).map(([key, definition]) => [key, removeBackendOnlyReferenceFields(definition)]),
) as Record<string, TutorialDefinition>;
