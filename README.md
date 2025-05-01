## Deliverables

Deployed app url: https://gray-sand-04ca9ed1e.6.azurestaticapps.net/

My app heavily uses Azure Functions and Azure static web apps. To run locally, you may need to install both.

- https://github.com/Azure/azure-functions-core-tools
- https://github.com/Azure/static-web-apps

## Running the app locally
Run `npx swa build` then `npx swa start`
If this doesn't work you may need to install static web apps as a dev or regular dependency. You will also need to install azure functions core tools, using the links above - the getting started sections.

## Example Data
You can download an example CSV file to test the upload functionality:
- [Download example_2500.csv](https://raw.githubusercontent.com/lgn-lvx3/pge-nrg/main/public/example_2500.csv)

## Project Core Deliverables

✅ **User Authentication**
- Implemented using Azure Static Web Apps authentication
- Secure access to all API endpoints

✅ **Manual Data Input**
- Implemented via `/energy-input` endpoint
- Accepts date and usage values
- Stores data in Cosmos DB
- Validates input data

✅ **File Uploads**
- Implemented via `/energy-upload` endpoint
- Uses Azure Blob Storage for file storage
- Processes CSV files with proper validation
- Supports bulk csv data import

✅ **Historical Insights**
- Implemented via `/energy-history` endpoint
- Supports date range filtering
- Returns detailed energy usage data
- Can be used for visualization

✅ **AI-Powered Analysis**
- Implemented via `/recommendations` endpoint
- Provides AI-generated insights on energy usage patterns
- Offers personalized recommendations for energy savings
- Includes estimated savings potential
- Features a disclaimer about AI-generated content

✅ **Alerts and Notifications**
- Implemented via `/energy-alerts` endpoint
- Supports multiple notification channels (email, SMS)
- Allows setting custom thresholds
- Monitors energy usage against thresholds

### UI Implementation

✅ **Dashboard**
- Modern, responsive design using React and DaisyUI
- Interactive data visualization with Chart.js
- Monthly and daily usage statistics
- CSV file upload interface with progress tracking

✅ **Data Visualization**
- Line chart showing energy usage over time
- Bar chart displaying average monthly usage
- Interactive tooltips and zoom capabilities
- Responsive design that works on all devices

✅ **User Interface Features**
- Modal-based forms for data entry
- Progress indicators for file uploads
- Error handling and success messages
- Responsive tables for data display
- AI analysis modal with recommendations

✅ **Alert Management**
- Alert history tracking
- Simple alert deletion process

✅ **Documentation**
- Integrated Swagger UI for API documentation
- Accessible from the main navigation
- Interactive API testing interface

### API Implementation

✅ **Authentication**
- Integrated with Azure Static Web Apps auth
- Secure access to all endpoints

✅ **Manual Data Input**
- POST `/energy-input`
- Validates and stores energy usage data

✅ **File Upload**
- POST `/energy-upload`
- Processes CSV files
- Validates data format

✅ **Historical Data**
- GET `/energy-history`
- Supports date range filtering
- Returns detailed usage data

✅ **AI Analysis**
- GET `/recommendations`
- Provides AI-generated insights
- Returns personalized recommendations
- Includes estimated savings

✅ **Alerts**
- POST `/energy-alerts`
- Manages alert thresholds
- Configures notification channels

### Architecture Implementation

✅ **API Gateway**
- Implemented using Azure Functions
- RESTful endpoints documented in OpenAPI spec
- Proper error handling and status codes

✅ **Backend Compute**
- Azure Functions for all data processing
- Efficient handling of requests
- Proper error handling and logging

✅ **Storage**
- Azure Blob Storage for file uploads
- Cosmos DB for energy data and alerts
- Proper data modeling and indexing

✅ **Authentication**
- Azure Static Web Apps authentication
- Secure access to all resources
- Role-based access control

✅ **Notifications**
- Support for multiple notification channels
- Threshold-based alerting system
- Configurable alert settings

## System Architecture

```mermaid
graph TD
    subgraph "Azure Functions Flow"
        A[Energy Input] -->|Store| D[Cosmos DB]
        B[Energy Upload] -->|Process| E[Blob Storage]
        E -->|Trigger| F[Upload Event Trigger]
        F -->|Store| D
        G[Alert Timer Trigger] -->|Check| D
        G -->|Send| H[Alert Channels]
        I[Energy History] -->|Query| D
        J[Energy Alerts] -->|Manage| D
        K[AI Analysis] -->|Analyze| N[Azure AI]
        K -->|Store| D
        M[Email/SMS] <--> H
        O[Web Client] <--> A
        O <--> I
        O <--> J
        O <--> K
        O --> B
        P[Auth Provider] <-->|Authenticate| O
    end


    style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b
    style B fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b
    style F fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b
    style G fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b
    style I fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b
    style J fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b
    style K fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b
    style D fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20
    style E fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20
    style N fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20
    style H fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100
    style M fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20
    style O fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    style P fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20
```


### CI/CD Implementation

✅ **GitHub Actions Workflow**
- Automated build and deployment pipeline
- Triggers on push to main branch and pull requests
- Uses Node.js 20 for build environment
- Secure token handling for Azure deployment
- Automated static web app deployment

✅ **Deployment Configuration**
- App source code path: "/"
- Built app content directory: "/dist"
- Secure token management for Azure Static Web Apps
- Automated deployment to Azure Static Web Apps

✅ **Security & Authentication**
- OIDC client integration
- Secure token handling
- GitHub Actions permissions management
- Protected deployment credentials

### API unit tests
There are some unit test written, you can run the tests with `yarn jest`

### Bulk CSV Upload
Template used is like this -
Date,Usage(kWh)
2025-03-01,25
2025-02-01,10
2025-03-10,2.5
2025-05-03,10.2
2025-02-01,3.2
2025-06-01,10.1
2025-03-01,25.6
2025-01-01,22
2026-01-01,22

There are some samples in the /public folder, which you can upload.

## SNS
Using a timer trigger, and querying the database, notifications are sent out at 9AM to the email channel via SendGrid.


### handy commands
- `yarn create vite pge-nrg --template react-ts`
- `swa build`
- `swa login --resource-group pge-rg --app-name pge-nrg`
- `swa deploy --env production`

### handy links
- https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-web-framework?tabs=bash&pivots=react
- https://vite.dev/guide/
- https://azure.github.io/static-web-apps-cli/docs/cli/swa-start/
- https://learn.microsoft.com/en-us/azure/static-web-apps/add-authentication

### Scripts
Runs a script to create a row csv example from test-data.csv template
`awk 'BEGIN {srand(); print "Date,Usage(kWh)"} NR>1 {for(i=0;i<10000; i++) {year=2025+int(rand()*2); month=1+int(rand()*12); day=1+int(rand()*28); printf("%04d-%02d-%02d,%0.1f\n", year, month, day, rand()*100)}}' test-data.csv > example_10k.csv`
