export const SYSTEM_PROMPT = `You are an intent classifier for a scientific research workspace. Your job is to classify the user's intent by what they want to DO, not what the input is ABOUT. Scientific domain language (biology, metagenomics, ecology) appears across all categories.

## Categories

- **sql**: The user wants to EXECUTE a database query against data sources. Look for: SQL syntax, data retrieval verbs (SELECT, JOIN, GROUP BY), references to tables/columns, imperative data commands.
- **python**: The user wants to RUN code in a sandbox. Look for: Python syntax, import statements, function calls, variable assignments, data manipulation code.
- **literature**: The user wants to SEARCH scientific literature. Look for: references to "papers", "studies", "publications", "recent research", questions about what has been published.
- **hypothesis**: The user wants to STRUCTURE a testable claim. Look for: declarative statements about correlations, predictions, causal relationships, "I think", "I predict", conditional claims.
- **note**: The user wants to STORE a free-text annotation. Look for: personal reminders, task items, "remember to", "TODO", observations, meeting notes, informal text.
- **data_ingest**: The user wants to LOAD or PARSE a file. Look for: file paths, "load", "import", "upload", CSV/TSV/FASTA references, file format mentions.

## Disambiguation Rules

- Imperative sentence + data verb (select, query, count, group) = sql
- Declarative claim about correlation or causation = hypothesis
- Mentions "papers", "studies", "publications", "literature" = literature
- Personal/task language ("remember", "note to self", "TODO") = note
- Code syntax (imports, assignments, function calls) = python
- File paths or "load"/"upload"/"import" + file format = data_ingest

## Output

Return ONLY valid JSON matching this schema:
{"type": "<category>", "confidence": <0.0-1.0>, "alternatives": [{"type": "<category>", "confidence": <0.0-1.0>}]}

Where category is one of: sql, python, literature, hypothesis, note, data_ingest`;

export const FEW_SHOT_EXAMPLES = [
  // SQL examples
  { input: "SELECT * FROM biosample WHERE ecosystem_type = 'Soil'", output: { type: 'sql', confidence: 0.95, alternatives: [{ type: 'python', confidence: 0.03 }] } },
  { input: "Count all metagenomes grouped by biome", output: { type: 'sql', confidence: 0.88, alternatives: [{ type: 'python', confidence: 0.08 }] } },
  { input: "Join biosample with study on study_id", output: { type: 'sql', confidence: 0.92, alternatives: [{ type: 'python', confidence: 0.05 }] } },
  { input: "How many samples have pH below 5?", output: { type: 'sql', confidence: 0.82, alternatives: [{ type: 'literature', confidence: 0.10 }] } },
  { input: "Get the top 10 organisms by abundance in freshwater samples", output: { type: 'sql', confidence: 0.85, alternatives: [{ type: 'python', confidence: 0.10 }] } },

  // Python examples
  { input: "import pandas as pd; df.groupby('phylum').count()", output: { type: 'python', confidence: 0.96, alternatives: [{ type: 'sql', confidence: 0.02 }] } },
  { input: "Plot a histogram of sample pH values", output: { type: 'python', confidence: 0.85, alternatives: [{ type: 'sql', confidence: 0.10 }] } },
  { input: "def calculate_diversity(samples): return shannon_index(samples)", output: { type: 'python', confidence: 0.95, alternatives: [] } },
  { input: "Run a PCA on the abundance matrix", output: { type: 'python', confidence: 0.82, alternatives: [{ type: 'sql', confidence: 0.12 }] } },
  { input: "Filter the dataframe where depth > 100 and plot results", output: { type: 'python', confidence: 0.88, alternatives: [{ type: 'sql', confidence: 0.08 }] } },

  // Literature examples
  { input: "Recent papers on CRISPR-Cas9 in methanotrophs", output: { type: 'literature', confidence: 0.95, alternatives: [{ type: 'hypothesis', confidence: 0.03 }] } },
  { input: "What studies have examined soil microbiome response to drought?", output: { type: 'literature', confidence: 0.92, alternatives: [{ type: 'hypothesis', confidence: 0.05 }] } },
  { input: "Find publications about nitrogen cycling in wetlands", output: { type: 'literature', confidence: 0.94, alternatives: [] } },
  { input: "Has anyone published on viral diversity in deep sea vents?", output: { type: 'literature', confidence: 0.90, alternatives: [{ type: 'hypothesis', confidence: 0.06 }] } },
  { input: "Search for reviews on horizontal gene transfer in archaea", output: { type: 'literature', confidence: 0.93, alternatives: [] } },

  // Hypothesis examples
  { input: "Acidobacteria abundance correlates with soil pH below 5.5", output: { type: 'hypothesis', confidence: 0.92, alternatives: [{ type: 'literature', confidence: 0.05 }] } },
  { input: "I predict that fungal diversity increases with elevation up to 3000m", output: { type: 'hypothesis', confidence: 0.90, alternatives: [{ type: 'note', confidence: 0.07 }] } },
  { input: "Methane flux should decrease when water table drops below 20cm", output: { type: 'hypothesis', confidence: 0.88, alternatives: [{ type: 'literature', confidence: 0.08 }] } },
  { input: "If we sequence deeper, we should find more rare taxa", output: { type: 'hypothesis', confidence: 0.85, alternatives: [{ type: 'note', confidence: 0.10 }] } },
  { input: "Temperature is the primary driver of community composition in arctic soils", output: { type: 'hypothesis', confidence: 0.87, alternatives: [{ type: 'literature', confidence: 0.08 }] } },

  // Note examples
  { input: "Remember to check the QC flags on JGI run 3045", output: { type: 'note', confidence: 0.94, alternatives: [] } },
  { input: "TODO: rerun the analysis after excluding contaminated samples", output: { type: 'note', confidence: 0.92, alternatives: [{ type: 'python', confidence: 0.05 }] } },
  { input: "Meeting with Sarah next week to discuss sample collection", output: { type: 'note', confidence: 0.90, alternatives: [] } },
  { input: "The extraction protocol seems to work better at room temperature", output: { type: 'note', confidence: 0.78, alternatives: [{ type: 'hypothesis', confidence: 0.18 }] } },
  { input: "Lab results came back for batch 42, looks clean", output: { type: 'note', confidence: 0.88, alternatives: [] } },

  // Data Ingest examples
  { input: "Load the CSV from /uploads/soil_samples_2024.csv", output: { type: 'data_ingest', confidence: 0.95, alternatives: [] } },
  { input: "Import the FASTA file for genome assembly GCA_000001", output: { type: 'data_ingest', confidence: 0.93, alternatives: [] } },
  { input: "Upload the Excel spreadsheet with field measurements", output: { type: 'data_ingest', confidence: 0.91, alternatives: [] } },
  { input: "Parse the TSV metadata table from NCBI", output: { type: 'data_ingest', confidence: 0.89, alternatives: [{ type: 'python', confidence: 0.08 }] } },
  { input: "Load my sequencing results from the shared drive", output: { type: 'data_ingest', confidence: 0.87, alternatives: [{ type: 'note', confidence: 0.08 }] } },
];

/**
 * Builds the full prompt for classification.
 */
export function buildClassificationPrompt(userInput: string): string {
  const examplesText = FEW_SHOT_EXAMPLES.map(
    (ex) => `Input: "${ex.input}"\nOutput: ${JSON.stringify(ex.output)}`
  ).join('\n\n');

  return `${SYSTEM_PROMPT}

## Examples

${examplesText}

Now classify this input:
Input: "${userInput}"
Output: /no_think`;
}

/**
 * Builds a simpler prompt for API fallback (without /no_think).
 */
export function buildApiPrompt(userInput: string): string {
  const examplesText = FEW_SHOT_EXAMPLES.map(
    (ex) => `Input: "${ex.input}"\nOutput: ${JSON.stringify(ex.output)}`
  ).join('\n\n');

  return `${SYSTEM_PROMPT}

## Examples

${examplesText}

Now classify this input:
Input: "${userInput}"
Output:`;
}
