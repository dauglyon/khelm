# RSH-008: File Handling and Ingest for Scientific Data

**Date:** 2026-03-21 | **Status:** Completed

## Question

How should The Helm handle file uploads and ingest for scientific data (CSV, TSV, FASTQ, FASTA, JSON, Excel -- potentially multi-GB), including resumable upload protocols, client-side parsing for schema preview, automatic type inference, and drag-and-drop reception?

## Context

The Helm is a scientific exploration interface for DOE BER systems biology data. Scientists upload large data files that the system must detect, parse, preview, and ultimately make queryable. Vignette 3 describes: drag a file onto the workspace, the system detects type, infers schema, creates a preview card, and data becomes queryable. This requires a pipeline from drag-and-drop reception through upload protocol, client-side parsing, schema inference, and preview generation.

Key constraints:
- Files can be multi-GB (FASTQ/FASTA genome sequences)
- Network reliability varies (field stations, institutional networks)
- Schema preview should happen client-side before full upload completes
- Must support CSV, TSV, FASTQ, FASTA, JSON, and potentially Excel formats
- React 18+ / TypeScript / Vite stack

---

## Findings

### 1. Upload Protocols

#### Protocol Comparison

| Feature | tus.io (Resumable) | S3 Presigned Multipart | Standard Multipart (XHR) |
|---|---|---|---|
| **Resumability** | Full -- resume from exact byte offset after interruption | Partial -- resume from last completed part (min 5 MB parts) | None -- restart from beginning |
| **Chunk flexibility** | Any chunk size | 5 MB minimum per part (except last), max 5 GB per part, max 10,000 parts | Single request |
| **Max file size** | Unlimited (protocol-level) | ~50 TB (10,000 x 5 GB) | Server-configured (often 1-10 GB) |
| **Server requirement** | tus server (tusd reference impl in Go, or middleware) | S3-compatible storage + signing endpoint | Any HTTP server |
| **Throughput** | Up to 4.75 Gb/s reported | Parallel part uploads improve throughput; up to 61% faster than single-request for 100 MB+ files | Single-stream, server-limited |
| **Client library** | tus-js-client (~10 KB gzipped) | AWS SDK or custom fetch | XMLHttpRequest / fetch |
| **Standardization** | IETF draft-ietf-httpbis-resumable-upload (draft-10, Oct 2025) progressing toward RFC | AWS proprietary API, S3-compatible ecosystem | HTTP/1.1 multipart/form-data (RFC 7578) |
| **Backend storage** | Local disk, S3 (via tusd s3store), GCS | S3 / S3-compatible (MinIO, R2) | Application-managed |

Sources:
- [tus.io - Resumable File Uploads](https://tus.io/)
- [tus resumable upload protocol specification](https://tus.io/protocols/resumable-upload)
- [IETF draft-ietf-httpbis-resumable-upload-10](https://datatracker.ietf.org/doc/draft-ietf-httpbis-resumable-upload/)
- [AWS S3 Multipart Upload Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)
- [Uploading large objects to S3 using multipart upload](https://aws.amazon.com/blogs/compute/uploading-large-objects-to-amazon-s3-using-multipart-upload-and-transfer-acceleration/)
- [tus S3 backend blog post](https://tus.io/blog/2016/03/07/tus-s3-backend)

#### tus + S3 Hybrid Architecture

tusd (the reference tus server) natively supports S3 as a storage backend via its `s3store` package. This combines tus's resumability semantics with S3's storage durability. Key details:

- Each PATCH request creates a new S3 multipart upload part
- Temporary disk buffering ensures S3's 5 MB minimum part size is met
- `PreferredPartSize` is configurable between `MinPartSize` and `MaxPartSize`
- `MaxBufferedParts` controls how many parts can buffer locally while one uploads to S3, improving throughput
- Consistency caveat: S3 eventual consistency requires distributed locking (e.g., DynamoDB, Redis) for concurrent access to the same upload

Sources:
- [tusd S3 store source](https://github.com/tus/tusd/blob/main/pkg/s3store/s3store.go)
- [tusd S3 backend documentation](https://tus.github.io/tusd/storage-backends/aws-s3/)
- [tusd GitHub repository](https://github.com/tus/tusd)

#### Uppy as Upload Orchestrator

Uppy is a modular JavaScript file uploader that wraps tus-js-client, S3 multipart, and XHR upload behind a unified API. It provides React components and hooks.

| Feature | Uppy |
|---|---|
| **React integration** | `@uppy/react` with `UppyContextProvider`, `Dashboard`, `DragDrop`, `useUppyState` hook |
| **Upload backends** | `@uppy/tus`, `@uppy/aws-s3` (multipart + non-multipart), `@uppy/xhr-upload` |
| **Retry logic** | Exponential backoff with configurable intervals; respects HTTP 429 |
| **File restrictions** | Type, size, count limits via configuration |
| **Progress tracking** | Per-file and total progress via hooks |
| **TypeScript** | Full type definitions included |
| **Bundle size** | Core + tus plugin: moderate; Dashboard UI adds more weight |
| **Remote sources** | Google Drive, Dropbox, Instagram, URL, webcam (optional plugins) |
| **Framework support** | React, Vue, Svelte, Angular, Next.js |

Uppy's `@uppy/tus` plugin (v5.1.1 current) wraps tus-js-client and provides automatic retry, chunk management, and progress reporting. For pure file reception without upload management, react-dropzone is lighter weight.

Sources:
- [Uppy documentation](https://uppy.io/)
- [Uppy tus plugin](https://uppy.io/docs/tus/)
- [Uppy React integration](https://uppy.io/docs/react/)
- [Uppy comparison of uploaders](https://uppy.io/docs/comparison/)
- [Choosing the uploader you need (Uppy)](https://uppy.io/docs/guides/choosing-uploader/)
- [@uppy/tus on npm](https://www.npmjs.com/package/@uppy/tus)

---

### 2. Client-Side Parsing

#### CSV/TSV: Papa Parse

Papa Parse is the fastest JavaScript CSV parser for the browser, supporting streaming, web workers, and multi-GB files.

| Feature | Details |
|---|---|
| **Streaming** | `step` callback for row-by-row processing; `chunk` callback for chunk-level processing |
| **Web Workers** | `worker: true` offloads parsing to background thread |
| **Preview** | `preview: N` parses only the first N rows -- ideal for schema detection |
| **Header detection** | `header: true` uses first row as field names, returns objects keyed by column |
| **Type conversion** | `dynamicTyping: true` converts numeric/boolean strings to native types |
| **Delimiter detection** | Auto-detects from `[',', '\t', '\|', ';']` or custom `delimitersToGuess` |
| **Large files** | Streams via File API; does not load entire file into memory |
| **Error handling** | Returns `errors` array with type, code, message, and row index |
| **Dependencies** | Zero |
| **RFC compliance** | RFC 4180 |

For schema preview, the recommended approach is:
1. Use `File.slice(0, N)` to read only the first N bytes (e.g., 64 KB)
2. Parse with Papa Parse using `preview: 100` to get the first 100 rows
3. Use `header: true` and `dynamicTyping: true` for automatic header and type detection
4. This runs entirely client-side, before any upload begins

**Benchmark results** (from LeanyLabs comparison): Papa Parse was the fastest parser across both non-quoted and quoted CSV test scenarios, tested with files from 1 MB (10K rows) to 140 MB (100K rows x 100 columns). It outperformed csv-parse, csv-parser, fast-csv, and dekkai.

Sources:
- [Papa Parse homepage](https://www.papaparse.com/)
- [Papa Parse documentation](https://www.papaparse.com/docs)
- [Papa Parse GitHub](https://github.com/mholt/PapaParse)
- [JavaScript CSV Parsers Comparison / Benchmarks (LeanyLabs)](https://leanylabs.com/blog/js-csv-parsers-benchmarks/)
- [papaparse on npm](https://www.npmjs.com/package/papaparse)

#### Excel: SheetJS

SheetJS (xlsx) parses Excel files (XLSX, XLS, ODS, and more) entirely client-side.

| Feature | Details |
|---|---|
| **Formats** | XLSX, XLSB, XLS, ODS, CSV, and more |
| **Client-side** | Full parsing in browser via FileReader + ArrayBuffer |
| **React integration** | `XLSX.read()` + `XLSX.utils.sheet_to_json()` for state updates |
| **Output** | Arrays of objects (like Papa Parse with headers) |
| **License** | Community Edition (Apache 2.0) with Pro tier for advanced features |

Sources:
- [SheetJS React integration docs](https://docs.sheetjs.com/docs/demos/frontend/react/)
- [SheetJS import tutorial](https://docs.sheetjs.com/docs/getting-started/examples/import/)
- [xlsx on npm](https://www.npmjs.com/package/xlsx)

#### FASTA/FASTQ: Custom + Existing Libraries

FASTA and FASTQ are simple line-oriented formats. Several JavaScript parsers exist but the ecosystem is less mature than CSV tooling.

| Library | Format | Browser Support | Notes |
|---|---|---|---|
| **bionode/fasta-parser** | FASTA | Yes (browser bundle available) | Buffer stream parser, FASTA to JSON |
| **FASTQA-JS** | FASTQ | Yes (client-side only) | Processes FASTQ in-browser; file never leaves client machine |
| **bioinformatics-parser** | FASTA + FASTQ | Node.js (adaptable) | Simple parser for both formats |
| **seqparse** | FASTA, GenBank, SnapGene, SBOL | Yes | Recommended by SeqViz; multi-format |
| **biojs-io-fasta** | FASTA | Yes | BioJS ecosystem; reads via URL or direct data |
| **Custom parser** | Both | Yes | FASTA/FASTQ are simple enough to parse with ~50 lines of streaming code |

For schema preview of sequence files, parsing the first few records (via `File.slice()`) is sufficient to detect format and show sequence count, average length, and quality score distribution (FASTQ).

Sources:
- [bionode fasta-parser](https://github.com/bionode/fasta-parser)
- [FASTQA-JS](http://gregoryzynda.com/fastq/javascript/2014/05/29/fastqa-js.html)
- [bioinformatics-parser](https://github.com/romgrk/bioinformatics-parser)
- [seqparse / SeqViz](https://github.com/Lattice-Automation/seqviz)
- [biojs-io-fasta](https://github.com/biojs-io/biojs-io-fasta)

#### Browser File API for Partial Reads

The `File.slice(start, end)` method (inherited from `Blob`) enables reading only the first N bytes of a file without loading it entirely into memory. Combined with `FileReader` or `ReadableStream`, this enables instant header detection and format sniffing for files of any size.

The Web Streams API (`File.stream()`) provides a `ReadableStream` for progressive chunk-by-chunk processing. Combined with `TransformStream`, this enables on-the-fly parsing, compression, or encryption in the browser.

Sources:
- [Streams API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Parsing Large Files in the Browser Using JavaScript Streams API](https://medium.com/@AlexanderObregon/parsing-large-files-in-the-browser-using-javascript-streams-api-78cb88f30d23)
- [File.slice() tutorial](https://riptutorial.com/javascript/example/16626/slice-a-file)

---

### 3. Schema Inference

#### Approaches to Auto-Detecting Column Types

| Approach | Description | Pros | Cons |
|---|---|---|---|
| **Papa Parse `dynamicTyping`** | Converts string values to number/boolean during parse | Zero-config; built into parsing step | Limited types (number, boolean, string); no date detection |
| **@datatables/type-detector** | Dedicated type detection library; detects numbers, dates, HTML, strings with format info | Fast (~10-20 ms for 10K values); detects date formats and number formats like `$100,000.50` | Complex date formats slower (~400 ms); limited to built-in types |
| **tableschema-js (Frictionless Data)** | Full Table Schema inference per Frictionless Data spec; async `table.infer()` | Standards-based; supports integer, number, boolean, date, time, datetime, string, etc. | Heavier dependency; designed for Node.js (adaptable to browser) |
| **Custom heuristic sampling** | Sample N rows, test each value against regex/parse patterns, track type frequency per column, promote on conflict | Full control over type hierarchy; can add domain-specific types (e.g., gene ID, NCBI accession) | Must implement and maintain; edge cases with mixed types |
| **Perspective (FINOS)** | WebAssembly-powered schema inference from CSV/JSON; compiled from C++ | Extremely fast; supports integer, float, string, boolean, date, datetime | Heavy WebAssembly binary; inference is opaque (not customizable) |

#### Recommended Heuristic Pipeline

For The Helm's use case, a practical approach:

1. **Parse header row** -- Papa Parse with `preview: 1, header: true`
2. **Sample data rows** -- Papa Parse with `preview: 100, dynamicTyping: true`
3. **Per-column inference** -- For each column, iterate sample values:
   - Try `parseInt` / `parseFloat` (distinguish integer vs float)
   - Try `new Date(value)` or regex for ISO 8601, common date formats
   - Check for boolean patterns (`true/false`, `yes/no`, `0/1`)
   - Check for categorical (few unique values relative to row count)
   - Fall back to string
4. **Confidence scoring** -- Track what percentage of non-null values matched each type; promote to string if below threshold (e.g., 90%)
5. **Present to user** -- Show inferred schema with ability to override per column

Sources:
- [@datatables/type-detector on npm](https://www.npmjs.com/package/@datatables/type-detector)
- [DataTables Type Detection Library blog post](https://datatables.net/blog/2021/type-detection-library)
- [tableschema-js (Frictionless Data)](https://github.com/frictionlessdata/tableschema-js)
- [Perspective schema and column types](https://perspective.finos.org/guide/explanation/table/schema.html)
- [Semi-automatic Column Type Inference for CSV Table Understanding (Springer)](https://link.springer.com/chapter/10.1007/978-3-030-67731-2_39)
- [csv-schema-inference (Wittline)](https://github.com/Wittline/csv-schema-inference)
- [Building an Automatic Schema Generator (Datograde)](https://datograde.com/blog/autogenerate-schemas)

---

### 4. Drag-and-Drop File Reception

#### react-dropzone vs Native HTML5 API vs Uppy DragDrop

| Feature | react-dropzone | Native HTML5 DnD | Uppy DragDrop/Dashboard |
|---|---|---|---|
| **API style** | `useDropzone` hook returning `getRootProps`, `getInputProps` | `onDragOver`, `onDrop` event handlers on DOM elements | Uppy plugin with React component wrappers |
| **File type filtering** | `accept` prop with MIME types + extensions | Manual checking in `onDrop` handler | Uppy-level `restrictions.allowedFileTypes` |
| **Multiple files** | `multiple` prop | Built-in | Built-in |
| **Directory upload** | Supported | Requires `webkitdirectory` attribute | Supported |
| **Drag state** | `isDragActive`, `isDragAccept`, `isDragReject` | Manual state tracking | Internal state |
| **Custom validation** | `validator` prop for custom file validation | Manual | `onBeforeFileAdded` hook |
| **Bundle size** | ~11 KB gzipped, zero dependencies (8M+ weekly npm downloads) | 0 KB (built-in) | Larger (includes core + plugin) |
| **Upload integration** | None -- reception only | None -- reception only | Full upload pipeline (tus, S3, XHR) |
| **Accessibility** | Built-in ARIA attributes | Manual | Built-in |
| **MIME detection caveat** | CSV reported as `text/plain` (macOS) vs `application/vnd.ms-excel` (Windows) | Same caveat | Same caveat |

**Key consideration for The Helm:** react-dropzone handles file reception only (not upload). If using Uppy for upload, Uppy's built-in DragDrop or Dashboard component may be preferable for a unified pipeline. If you want maximum control over the drop zone UI (e.g., workspace-integrated drag targets per Vignette 3), react-dropzone's hook-based API provides more flexibility while Uppy handles the upload separately.

Sources:
- [react-dropzone documentation](https://react-dropzone.js.org/)
- [react-dropzone GitHub](https://github.com/react-dropzone/react-dropzone)
- [react-dropzone on npm](https://www.npmjs.com/package/react-dropzone)
- [Uppy Drag & Drop plugin](https://uppy.io/docs/drag-drop/)
- [Uppy Dashboard plugin](https://uppy.io/docs/dashboard/)
- [Implementing Drag & Drop File Uploads in React Without External Libraries](https://dev.to/hexshift/implementing-drag-drop-file-uploads-in-react-without-external-libraries-1d31)
- [Drag-and-Drop File Upload Component with React and TypeScript](https://claritydev.net/blog/react-typescript-drag-drop-file-upload-guide)

---

### 5. Prior Art: Scientific Data Platforms

#### Galaxy Project

Galaxy is the most directly relevant prior art -- an open-source bioinformatics platform supporting 9,000+ tools and 400+ data types.

| Aspect | Galaxy's Approach |
|---|---|
| **Upload protocol** | tus (via tusd) for resumable uploads; WSGI middleware fallback |
| **Architecture** | External tusd process on port 1080, proxied via Nginx with `proxy_request_buffering off` |
| **Large files** | FTP fallback for files too large for browser upload |
| **Type detection** | Server-side auto-detection of 400+ data types |
| **Data organization** | Histories (ordered lists of datasets); datasets have metadata and provenance |
| **Why tus** | Offloads upload processing from main Galaxy server; survives server restarts |

Galaxy's adoption of tus is significant validation for scientific data platforms. Their architecture -- tusd as a separate process proxied through Nginx -- is a proven pattern for handling large bioinformatics files.

Sources:
- [Galaxy Project: Performant Uploads with TUS tutorial](https://training.galaxyproject.org/training-material/topics/admin/tutorials/tus/tutorial.html)
- [Galaxy 2024 update (Nucleic Acids Research)](https://academic.oup.com/nar/article/52/W1/W83/7676834)
- [Galaxy loading data documentation](https://galaxyproject.org/support/loading-data/)
- [Galaxy Community Hub](https://galaxyproject.org)
- [galaxy-upload package](https://galaxy-upload.readthedocs.io/en/latest/)

#### Terra.bio

Terra is the Broad Institute's cloud platform for genomic analysis, built on Google Cloud.

| Aspect | Terra's Approach |
|---|---|
| **Upload protocol** | Direct GCS upload via Data Uploader tool; gsutil/gcloud CLI for large files |
| **Storage** | Google Cloud Storage (GCS) bucket per workspace |
| **Data organization** | Data tables with metadata; file paths stored as `gs://` URLs |
| **Type handling** | Metadata templates; manual schema definition |
| **Large files** | CLI-based upload (gsutil) for large genomic files; no browser-based resumable upload |
| **Checksums** | MD5 required on all files before ingestion into Terra Data Repository |

Terra's approach is cloud-native (GCS-first) rather than browser-upload-first. For The Helm, this is less directly applicable but their data table model (metadata + file references) is relevant for the queryable-data aspect.

Sources:
- [Terra architecture documentation](https://support.terra.bio/hc/en-us/articles/360058163311-Terra-architecture-where-your-data-and-tools-live)
- [Terra data upload documentation](https://support.terra.bio/hc/en-us/articles/4419428208411-Upload-data-and-populate-the-table-with-linked-file-paths)
- [Understanding data in the Cloud (Terra)](https://support.terra.bio/hc/en-us/articles/360034335332-Understanding-data-in-the-Cloud)
- [New in Terra: Uploading and organizing data (blog)](https://terra.bio/new-in-terra-uploading-and-organizing-data-just-got-easier/)

#### JupyterLab

JupyterLab is relevant as a widely-used scientific computing interface with file management.

| Aspect | JupyterLab's Approach |
|---|---|
| **Upload protocol** | Chunked HTTP PUT to Contents API; `LargeFileManager` for files > 15 MB |
| **Chunk implementation** | Sequential chunk numbers in PUT requests (1, 2, ..., -1 for last) |
| **Size limits** | 100 MB practical browser limit; larger files require external transfer (OBS, SDK) |
| **Resumability** | No true resumability -- chunk failure requires restart |
| **UI** | Drag-and-drop onto file browser; progress bar during upload |
| **File handling** | Server-side file system; no schema inference |

JupyterLab's chunked upload is simpler than tus but lacks resumability. Their 100 MB practical limit for browser uploads underscores the need for a proper resumable protocol for multi-GB scientific files.

Sources:
- [JupyterLab PR #4224: Allow larger file uploads](https://github.com/jupyterlab/jupyterlab/pull/4224)
- [JupyterLab issue #5705: Uploading large files through contents API](https://github.com/jupyter/notebook/issues/5705)
- [JupyterLab issue #12197: Write large files in chunks](https://github.com/jupyterlab/jupyterlab/issues/12197)
- [ipyuploads package](https://pypi.org/project/ipyuploads/)

---

## Conclusions

### Upload Protocol: tus via Uppy

**Recommendation: Use tus protocol with Uppy as the client-side orchestrator, tusd with S3 backend on the server.**

- tus provides true byte-level resumability, which is critical for multi-GB scientific files over unreliable networks
- Galaxy Project's adoption of tus validates this choice for bioinformatics data
- tusd's S3 backend provides durable storage without custom infrastructure
- Uppy wraps tus-js-client with React components, progress tracking, retry logic, and file restrictions
- The IETF is standardizing tus-based resumable uploads (draft-10 as of Oct 2025), indicating long-term protocol viability
- For the Vignette 3 workspace interaction, use react-dropzone for the custom drag-drop surface, feeding files into an Uppy instance configured with the tus plugin

### Client-Side Parsing: Papa Parse + Format-Specific Parsers

**Recommendation: Papa Parse for CSV/TSV, SheetJS for Excel, custom lightweight parsers for FASTA/FASTQ.**

- Papa Parse is the proven choice: fastest benchmarks, streaming support, web workers, zero dependencies, `preview` option for efficient partial parsing
- For schema preview before upload: use `File.slice(0, 65536)` to read first 64 KB, then Papa Parse with `preview: 100, header: true, dynamicTyping: true`
- SheetJS handles the Excel format family with client-side ArrayBuffer parsing
- FASTA/FASTQ formats are simple enough for lightweight custom parsers; seqparse or bionode/fasta-parser can be used if broader format support is needed
- JSON can be partially parsed using the Streams API for preview of large files

### Schema Inference: Custom Heuristic Pipeline

**Recommendation: Build a lightweight custom inference pipeline on top of Papa Parse's `dynamicTyping`, augmented by sampling-based heuristics for dates, categoricals, and domain-specific types.**

- Papa Parse's `dynamicTyping` handles number/boolean detection during parsing
- Layer on date detection (ISO 8601 regex + `Date.parse`), categorical detection (unique value ratio), and domain types (accession numbers, gene IDs)
- @datatables/type-detector is a useful reference for number/date format detection patterns (~10-20 ms for 10K values)
- Present inferred schema to user with per-column override capability
- tableschema-js (Frictionless Data) is worth evaluating if standards-based schema output is desired

### Drag-and-Drop: react-dropzone for Reception, Uppy for Upload

**Recommendation: Use react-dropzone for the workspace drag-drop surface (Vignette 3's "drag file onto workspace"), with files handed to Uppy for upload management.**

- react-dropzone's hook-based API (`useDropzone`) provides maximum UI flexibility for workspace-integrated drop targets
- Its `isDragActive`/`isDragAccept`/`isDragReject` state enables rich visual feedback during drag
- File type detection caveat: rely on file extension + magic bytes rather than MIME type for reliable CSV/TSV detection (MIME varies by OS)
- Uppy's DragDrop component is an alternative if a unified upload pipeline is preferred, but less flexible for custom workspace UI

### Proposed Client-Side Pipeline

```
[User drags file onto workspace]
    |
    v
[react-dropzone receives File object]
    |
    v
[Format detection: extension + File.slice(0, 512) magic bytes]
    |
    v
[Client-side preview parsing]
    |-- CSV/TSV: Papa Parse (preview: 100, header: true, dynamicTyping: true)
    |-- Excel: SheetJS (read first sheet, first 100 rows)
    |-- FASTA/FASTQ: Custom parser (first 10 sequences)
    |-- JSON: Streams API partial read + JSON.parse
    |
    v
[Schema inference on preview data]
    |-- Column names from headers
    |-- Type detection per column (int, float, string, date, boolean, categorical)
    |-- Confidence scoring
    |
    v
[Preview card rendered on workspace]
    |-- Shows inferred schema, sample rows, file metadata
    |-- User can adjust column types, rename, exclude columns
    |
    v
[User confirms --> Uppy + tus upload begins]
    |-- Resumable, chunked upload to tusd server
    |-- Progress shown in preview card
    |-- Server-side processing begins on upload completion
```

---

## Sources

### Upload Protocols
- [tus.io - Resumable File Uploads](https://tus.io/)
- [tus resumable upload protocol specification](https://tus.io/protocols/resumable-upload)
- [tus-js-client GitHub](https://github.com/tus/tus-js-client)
- [IETF draft-ietf-httpbis-resumable-upload-10](https://datatracker.ietf.org/doc/draft-ietf-httpbis-resumable-upload/)
- [Standardizing Resumable Uploads with the IETF (tus.io blog)](https://tus.io/blog/2023/08/09/resumable-uploads-ietf)
- [tusd GitHub - reference server implementation](https://github.com/tus/tusd)
- [tusd S3 backend documentation](https://tus.github.io/tusd/storage-backends/aws-s3/)
- [tus S3 backend blog post](https://tus.io/blog/2016/03/07/tus-s3-backend)
- [AWS S3 Multipart Upload documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)
- [Uploading large objects to S3 using multipart upload (AWS blog)](https://aws.amazon.com/blogs/compute/uploading-large-objects-to-amazon-s3-using-multipart-upload-and-transfer-acceleration/)

### Uppy
- [Uppy documentation](https://uppy.io/)
- [Uppy tus plugin](https://uppy.io/docs/tus/)
- [Uppy AWS S3 plugin](https://uppy.io/docs/aws-s3/)
- [Uppy React integration](https://uppy.io/docs/react/)
- [Uppy comparison of uploaders](https://uppy.io/docs/comparison/)
- [Choosing the uploader you need (Uppy)](https://uppy.io/docs/guides/choosing-uploader/)
- [@uppy/tus on npm](https://www.npmjs.com/package/@uppy/tus)
- [Uppy GitHub](https://github.com/transloadit/uppy)

### Client-Side Parsing
- [Papa Parse homepage](https://www.papaparse.com/)
- [Papa Parse documentation](https://www.papaparse.com/docs)
- [Papa Parse GitHub](https://github.com/mholt/PapaParse)
- [JavaScript CSV Parsers Benchmarks (LeanyLabs)](https://leanylabs.com/blog/js-csv-parsers-benchmarks/)
- [SheetJS React integration](https://docs.sheetjs.com/docs/demos/frontend/react/)
- [SheetJS import tutorial](https://docs.sheetjs.com/docs/getting-started/examples/import/)
- [bionode fasta-parser](https://github.com/bionode/fasta-parser)
- [FASTQA-JS](http://gregoryzynda.com/fastq/javascript/2014/05/29/fastqa-js.html)
- [seqparse / SeqViz](https://github.com/Lattice-Automation/seqviz)
- [biojs-io-fasta](https://github.com/biojs-io/biojs-io-fasta)

### Schema Inference
- [@datatables/type-detector on npm](https://www.npmjs.com/package/@datatables/type-detector)
- [DataTables Type Detection Library](https://datatables.net/blog/2021/type-detection-library)
- [tableschema-js (Frictionless Data)](https://github.com/frictionlessdata/tableschema-js)
- [Perspective schema and column types (FINOS)](https://perspective.finos.org/guide/explanation/table/schema.html)
- [csv-schema-inference](https://github.com/Wittline/csv-schema-inference)
- [Semi-automatic Column Type Inference for CSV Table Understanding](https://link.springer.com/chapter/10.1007/978-3-030-67731-2_39)
- [Building an Automatic Schema Generator (Datograde)](https://datograde.com/blog/autogenerate-schemas)

### Drag and Drop
- [react-dropzone documentation](https://react-dropzone.js.org/)
- [react-dropzone GitHub](https://github.com/react-dropzone/react-dropzone)
- [react-dropzone on npm](https://www.npmjs.com/package/react-dropzone)
- [Uppy Drag & Drop plugin](https://uppy.io/docs/drag-drop/)
- [Implementing Drag & Drop in React Without Libraries](https://dev.to/hexshift/implementing-drag-drop-file-uploads-in-react-without-external-libraries-1d31)

### Browser APIs
- [Streams API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Efficient data handling with the Streams API (MDN blog)](https://developer.mozilla.org/en-US/blog/efficient-data-handling-with-the-streams-api/)
- [Streams: The Definitive Guide (web.dev)](https://web.dev/articles/streams)
- [File.slice() tutorial](https://riptutorial.com/javascript/example/16626/slice-a-file)

### Prior Art
- [Galaxy Project: Performant Uploads with TUS](https://training.galaxyproject.org/training-material/topics/admin/tutorials/tus/tutorial.html)
- [Galaxy 2024 update (Nucleic Acids Research)](https://academic.oup.com/nar/article/52/W1/W83/7676834)
- [Galaxy Community Hub](https://galaxyproject.org)
- [Galaxy loading data documentation](https://galaxyproject.org/support/loading-data/)
- [Terra architecture](https://support.terra.bio/hc/en-us/articles/360058163311-Terra-architecture-where-your-data-and-tools-live)
- [Terra data upload](https://support.terra.bio/hc/en-us/articles/4419428208411-Upload-data-and-populate-the-table-with-linked-file-paths)
- [JupyterLab large file upload PR](https://github.com/jupyterlab/jupyterlab/pull/4224)
- [JupyterLab chunked upload issue](https://github.com/jupyter/notebook/issues/5705)
- [ipyuploads package](https://pypi.org/project/ipyuploads/)
