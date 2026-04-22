/**
 * Definition of a property for a component
 */
export interface PropDef {
    /** The type of the property value */
    type: 'string' | 'number' | 'boolean' | 'ReactNode' | 'function';
    /** Whether the property is required */
    required: boolean;
    /** Optional default value for the property */
    defaultValue?: unknown;
}

/**
 * Represents a node in the generated component tree
 */
export interface ComponentNode {
    /** Unique identifier for the component */
    id: string;
    /** Human-readable name of the component */
    name: string;
    /** The structural role of the component */
    type: 'page' | 'layout' | 'section' | 'component' | 'atom';
    /** Brief description of what this component does */
    description: string;
    /** Map of property names to their definitions */
    props: Record<string, PropDef>;
    /** Nested child components */
    children: ComponentNode[];
    /** List of Tailwind CSS classes applied to this component */
    tailwindClasses: string[];
    /** External library dependencies required by this component */
    dependencies: string[];
    /** The generated source code for this component */
    code: string;
}

/**
 * Input format for the PRD content to be processed
 */
export interface PrdInput {
    /** The raw text content of the Product Requirement Document */
    rawText: string;
    /** Optional filename if the input came from a file */
    fileName?: string;
}

/**
 * Configuration options for the generation process
 */
export interface GenerationConfig {
    /** The AI model to use for generation */
    model: 'llama-3.3-70b-versatile' | 'gemini-2.5-flash' | 'gemini-3.1-flash-lite-preview';
    /** Desired detail level of the generated components */
    complexity: 'minimal' | 'standard' | 'detailed';
    /** The visual and functional feel of the generated UI */
    tone: 'corporate' | 'startup' | 'playful';
    /** Whether to include Framer Motion or CSS animations */
    includeAnimations: boolean;
    /** The design system or component library to base the UI on */
    designSystem: 'none' | 'shadcn' | 'custom';
}

/**
 * The final output of a successful generation
 */
export interface GenerationResult {
    /** The root of the generated component tree */
    tree: ComponentNode;
    /** Summary statistics and operational metadata */
    metadata: {
        totalComponents: number;
        estimatedTokens: number;
        screens: string[];
    };
    /** The final prompt that was sent to the AI model */
    rawPrompt: string;
}

/**
 * A discrete chunk of data in a streaming generation response
 */
export interface StreamChunk {
    /** The category of data contained in this chunk */
    type: 'tree' | 'code' | 'error' | 'done';
    /** The actual data payload, matching the type specified */
    payload: unknown;
}

/**
 * A specific functional feature of the application
 */
export interface Feature {
    /** Name of the feature */
    name: string;
    /** Description of how the feature works */
    description: string;
}

/**
 * A data entity or model in the application
 */
export interface Entity {
    /** Name of the entity */
    name: string;
    /** List of fields or attributes of the entity */
    fields: string[];
}

/**
 * Structured representation of a parsed Product Requirement Document
 */
export interface ParsedPrd {
    /** Name of the application */
    appName: string;
    /** List of screens/pages identified in the PRD */
    screens: string[];
    /** Identified user roles or personas */
    roles: string[];
    /** Core functional features extracted from the PRD */
    features: Feature[];
    /** Data entities and their structures extracted from the PRD */
    entities: Entity[];
}
