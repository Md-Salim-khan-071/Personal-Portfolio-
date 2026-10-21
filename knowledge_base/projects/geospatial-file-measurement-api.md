# Geospatial File Measurement API

## Project Overview

The Geospatial File Measurement API is a Python-based REST API built with FastAPI to upload, process, and measure geospatial vector data. It accepts KML files and zipped Shapefiles, extracts geographic features and their properties, calculates supported geometric measurements, and stores the results for later retrieval.

The project is designed for developers and applications that need programmatic access to geospatial file information and basic spatial measurements.

## Problem Statement

Geospatial datasets contain geographic features whose areas and lengths cannot be measured accurately by directly applying geometric calculations to longitude and latitude coordinates expressed in degrees. Manually processing files and retrieving measurements can also be repetitive.

This project automates file ingestion, feature extraction, coordinate transformation, measurement calculation, and result retrieval through REST API endpoints.

## Goals

- Support uploading and processing KML and zipped Shapefile datasets.
- Calculate polygon areas and line lengths using appropriate projected coordinate systems.
- Store file metadata and measurement results for retrieval through API endpoints.

## Technology Stack

- **Language:** Python
- **Framework:** FastAPI, Uvicorn
- **Geospatial libraries:** GeoPandas, Shapely, PyProj, Pyogrio
- **Database/storage:** SQLite, SQLAlchemy, local file storage
- **Deployment:** Local development using Uvicorn; production deployment not yet documented
- **Testing:** Pytest, FastAPI TestClient, HTTPX

## Key Features

- Upload and validate KML and zipped Shapefile files.
- Extract feature geometries, properties, geometry types, and CRS information.
- Calculate polygon area in square metres and LineString length in metres.
- Transform supported geometries from geographic coordinates into an estimated projected CRS before measurement.
- Persist uploaded file metadata and calculated feature results in SQLite.
- Retrieve file metadata and stored measurements using REST endpoints.
- Validate file extensions, empty uploads, ZIP integrity, Shapefile components, and upload size.

## Supported File Formats

- **KML (`.kml`):** Geographic feature data, including supported polygon and line geometries.
- **Zipped Shapefile (`.zip`):** ZIP archives containing matching `.shp`, `.shx`, and `.dbf` components.

The current implementation reads Shapefile data through GeoPandas. A `.prj` file is useful for defining the source CRS, but the ZIP validator does not currently require it explicitly.

## API Endpoints

### Endpoint 1: Upload Geospatial File

- **Method and path:** `POST /api/files/`
- **Purpose:** Upload and process a KML or zipped Shapefile, extract features, calculate supported measurements, and persist the results.
- **Input:** A multipart form upload with a file field named `file`.
- **Output:** File ID, original filename, feature count, CRS, processing status, and extracted feature details including measurements where supported.
- **Validation/errors:**
  - `400 Bad Request` for unsupported extensions, empty uploads, invalid ZIP archives, missing required Shapefile components, empty datasets, or file-processing failures.
  - `413 Payload Too Large` when the uploaded file exceeds 10 MB.

### Endpoint 2: Retrieve File Metadata

- **Method and path:** `GET /api/files/{file_id}/`
- **Purpose:** Retrieve metadata for a previously uploaded file.
- **Input:** The unique file ID returned by the upload endpoint.
- **Output:** File ID, filename, feature count, CRS, and processing status.
- **Validation/errors:** `404 Not Found` when the file ID does not exist.

### Endpoint 3: Retrieve Measurements

- **Method and path:** `GET /api/files/{file_id}/measurements/`
- **Purpose:** Retrieve feature measurements saved during file processing.
- **Input:** The unique file ID.
- **Output:** File ID, filename, feature count, and stored feature details with calculated measurements.
- **Validation/errors:** `404 Not Found` when the file ID does not exist.

### Additional Endpoint

- **Method and path:** `GET /`
- **Purpose:** Basic API availability check.
- **Output:** A successful response when the application is running. Consult `app/main.py` for the exact response schema.

## Measurement Logic

The API processes feature geometries and calculates measurements based on their geometry types.

- **Polygon:** Calculates area and returns the result in square metres (`m²`).
- **LineString:** Calculates length and returns the result in metres (`m`).
- **Point:** No area or length measurement is returned.
- **Unsupported geometry types:** Measurement is returned as `null` rather than applying an inappropriate formula.

Measurements are calculated after projecting the geometry, rather than directly using the area or length of geographic coordinates in degrees.

## Coordinate Reference Systems (CRS)

The API obtains CRS information from the uploaded dataset through GeoPandas.

For measurable geometries, the measurement service estimates a suitable UTM CRS when possible and transforms the geometry before calculating its area or length.

This approach is appropriate for many local and regional datasets. However, the estimated UTM CRS may not be suitable for every dataset, particularly geometries spanning large regions or multiple UTM zones.

If the source CRS is missing, the current measurement implementation raises an error for measurable geometries instead of assuming that the coordinates represent a known reference system.

## Architecture and Data Flow

1. **Upload and validation:** FastAPI receives the file, checks its extension and size, and validates ZIP archives when applicable.
2. **Parsing and feature extraction:** GeoPandas reads the dataset and exposes its geometries, attributes, and CRS.
3. **Measurement calculation:** The measurement service transforms supported geometries and calculates polygon areas or LineString lengths.
4. **Persistence:** SQLAlchemy stores file metadata and extracted feature results in SQLite.
5. **Response and retrieval:** The upload endpoint returns the processed results, while metadata and measurement endpoints retrieve persisted records by file ID.

## Error Handling and Validation

The API includes validation for:

- Unsupported file extensions.
- Empty uploads.
- Uploaded files exceeding the 10 MB limit.
- Invalid or corrupted ZIP archives.
- ZIP archives with excessive file counts or uncompressed contents.
- Missing matching `.shp`, `.shx`, and `.dbf` components.
- Datasets containing no features.
- Requests for nonexistent file IDs.
- Processing failures, including certain CRS-related errors.

ZIP validation limits the archive to 100 entries and 50 MB of total uncompressed content. Additional production hardening, such as stricter geometry validation and more specific exception handling, remains a potential improvement.

## My Contributions

- Designed and implemented REST endpoints using FastAPI.
- Integrated GeoPandas-based parsing for KML and zipped Shapefile inputs.
- Implemented geometry extraction and CRS-aware measurement calculations.
- Integrated SQLAlchemy and SQLite for storing metadata and measurement results.
- Added upload validation and error handling.
- Wrote automated tests for API behavior, invalid uploads, measurement calculations, and persistence.

## Technical Challenges and Solutions

### Challenge 1: Measuring Geographic Coordinates

- **Challenge:** Geographic coordinates commonly use degrees, so directly calculating polygon area or line length from those coordinates produces results in unsuitable units.
- **Solution:** Implemented coordinate transformation through GeoPandas and PyProj before calculating supported measurements in metres.

### Challenge 2: Processing Uploaded Shapefiles

- **Challenge:** A Shapefile consists of multiple related files rather than a single standalone dataset, and uploaded ZIP archives may be invalid or incomplete.
- **Solution:** Implemented ZIP integrity checks, archive size and file-count limits, and validation for matching `.shp`, `.shx`, and `.dbf` components before parsing the dataset.

## Testing

- **Testing framework:** Pytest.
- **API testing:** FastAPI TestClient and HTTPX.
- **Measurement testing:** Polygon area, LineString length, and Point handling.
- **Validation testing:** Invalid file extensions, malformed ZIP archives, and ZIP files without Shapefile components.
- **Persistence testing:** Successful KML uploads, file metadata retrieval, and measurement retrieval.
- **Verified result:** 12 tests passed in the latest reported test run.

## Performance and Security

- Maximum uploaded file size: 10 MB.
- Maximum ZIP entry count: 100.
- Maximum total uncompressed ZIP content: 50 MB.
- Generated UUID-based filenames are used for stored uploads instead of trusting client-provided filenames for storage paths.
- ZIP path validation and archive integrity checks are performed before geospatial parsing.
- File metadata and calculated feature results are stored in a local SQLite database.

Authentication, authorization, rate limiting, configurable retention, and production-grade resource isolation have not been documented as implemented features.

## Deployment and Usage

- **Live API / documentation:** No live deployment URL currently documented.
- **Repository:** Add the GitHub repository URL after publishing the project.
- **How to run locally:**

Create and activate a Python virtual environment, then install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Open the interactive API documentation:

`http://127.0.0.1:8000/docs`

Run the test suite:

```bash
pytest -v
```

## Results and Learnings

- Implemented an API for ingesting two common geospatial file formats.
- Automated feature extraction and supported geometric measurements.
- Learned how CRS selection and coordinate transformations affect spatial calculations.
- Implemented database persistence and REST endpoints for retrieving previously processed results.
- Verified the current test suite with 12 passing tests.

## Known Limitations

- MultiPolygon and MultiLineString measurements are not currently implemented.
- CRS estimation may be unsuitable for some large or geographically extensive datasets.
- Files with missing or unsuitable CRS information may fail measurement processing.
- SQLite and local file storage are intended for the current project implementation, not a distributed production environment.
- Large-scale asynchronous processing, authentication, and production deployment are not yet documented as implemented.

## Future Improvements

- Add MultiPolygon and MultiLineString measurement support.
- Add explicit CRS selection and validation options.
- Support GeoJSON export and additional geospatial file formats.
- Add more robust geometry validation and specific error responses.
- Introduce database migrations and configurable persistent storage.
- Implement background processing for large datasets.
- Add authentication, rate limiting, monitoring, and production deployment.
- Expand integration tests for missing CRS, empty geometries, and invalid geospatial content.