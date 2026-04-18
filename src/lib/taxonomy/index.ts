/**
 * Canonical Taxonomy — single source of truth
 *
 * Re-exports the four pillars used everywhere in the app:
 *
 *   • SERVICE_CATEGORIES   — ILO C102 + ISSA SQ aligned service taxonomy
 *   • CHANNELS             — UN E-Gov OSI aligned channel typology
 *   • PRODUCT_TIERS        — ILO R202 Social Protection Floors aligned tiers
 *   • LABOR_SEGMENTS       — ILO labor-market segmentation
 *
 * Every dashboard page (Atlas, Services, Products, Delivery, Benchmarking,
 * Data & Sources / RAG library) and every research agent prompt MUST read
 * from these constants — never hard-code categories anywhere else.
 */

export * from "./services";
export * from "./channels";
export * from "./products";
export * from "./segments";
